import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateOrderNumber } from "@/utils/helpers";
import { notify, notifyAdmins } from "@/lib/notifications";
import { checkAndNotifyLowStock } from "@/lib/inventory";
import { orderLimiter } from "@/lib/rate-limit";
import { z } from "zod";

const RESERVATION_TTL_MS = 30 * 60 * 1000; // 30 minutes

const orderItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  price: z.coerce.number().positive(),
  quantity: z.coerce.number().int().positive(),
  image: z.string().nullish().transform((v) => v || undefined),
  variantId: z.string().nullish().transform((v) => v || undefined),
});

const orderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  shippingAddress: z.string().min(1, "Shipping address is required"),
  billingAddress: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(["card", "bank_transfer", "pay_on_delivery"]),
  couponCode: z.string().optional(),
  pointsRedeemed: z.coerce.number().int().min(0).optional().default(0),
});

function buildItemKey(items: { productId: string; variantId?: string; quantity: number }[]): string {
  return items
    .map((i) => `${i.productId}:${i.variantId || ""}:${i.quantity}`)
    .sort()
    .join("|");
}

export async function POST(request: NextRequest) {
  try {
    const rl = await orderLimiter(request);
    if (!rl.success) return rl.response;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = orderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;
    const incomingKey = buildItemKey(data.items);

    // ── Idempotency: check for existing PENDING order ──────────────
    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (customerProfile) {
      const existingPending = await prisma.order.findFirst({
        where: {
          customerProfileId: customerProfile.id,
          status: "PENDING",
          createdAt: { gte: new Date(Date.now() - RESERVATION_TTL_MS) },
        },
        include: {
          items: true,
          payments: { where: { status: "PENDING" }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
      });

      if (existingPending) {
        const existingKey = buildItemKey(
          existingPending.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          }))
        );

        if (existingKey === incomingKey) {
          const existingPayment = existingPending.payments[0];
          return NextResponse.json({
            order: {
              ...existingPending,
              subtotal: Number(existingPending.subtotal),
              shippingCost: Number(existingPending.shippingCost),
              discount: Number(existingPending.discount),
              total: Number(existingPending.total),
            },
            payment: existingPayment
              ? {
                  id: existingPayment.id,
                  reference: existingPayment.reference,
                  amount: Number(existingPayment.amount),
                  method: existingPayment.method,
                  status: existingPayment.status,
                }
              : null,
            resumed: true,
          });
        }

        // Different items — release the old reservation
        await releaseReservation(existingPending.id);
      }
    }

    // ── Verify stock (with row-level check inside TX) ──────────────
    const subtotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = subtotal >= 30000 ? 0 : 2000;

    // ── Validate coupon (defer consumption to payment success) ─────
    let discount = 0;
    let couponId: string | null = null;
    let couponCode: string | null = null;

    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode.trim().toUpperCase() },
      });

      if (!coupon || !coupon.isActive) {
        return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
      }
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
      }
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
      }
      if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
        return NextResponse.json({ error: `Minimum order amount is ₦${Number(coupon.minOrderAmount).toLocaleString()}` }, { status: 400 });
      }
      if (coupon.appliesTo !== "ALL" && coupon.appliesTo !== "PRODUCTS") {
        return NextResponse.json({ error: "This coupon is not valid for product orders" }, { status: 400 });
      }
      if (coupon.perUserLimit) {
        const userUses = await prisma.order.count({
          where: { couponId: coupon.id, customerProfile: { userId: session.user.id }, status: { not: "CANCELLED" } },
        });
        if (userUses >= coupon.perUserLimit) {
          return NextResponse.json({ error: "You have already used this coupon the maximum number of times" }, { status: 400 });
        }
      }

      if (coupon.type === "PERCENTAGE") {
        discount = subtotal * (Number(coupon.value) / 100);
        if (coupon.maxDiscountAmount) discount = Math.min(discount, Number(coupon.maxDiscountAmount));
      } else {
        discount = Math.min(Number(coupon.value), subtotal);
      }
      discount = Math.round(discount * 100) / 100;
      couponId = coupon.id;
      couponCode = coupon.code;
    }

    // ── Validate loyalty points (defer redemption to payment success)
    let pointsRedeemed = data.pointsRedeemed;
    if (pointsRedeemed > 0) {
      const [totalEarned, totalRedeemed] = await Promise.all([
        prisma.loyaltyPoint.aggregate({
          where: { userId: session.user.id, type: "earned" },
          _sum: { points: true },
        }),
        prisma.loyaltyPoint.aggregate({
          where: { userId: session.user.id, type: "redeemed" },
          _sum: { points: true },
        }),
      ]);
      const balance = (totalEarned._sum.points || 0) - (totalRedeemed._sum.points || 0);

      if (pointsRedeemed > balance) {
        return NextResponse.json({ error: `Insufficient points. You have ${balance} points available.` }, { status: 400 });
      }

      const maxRedeemable = Math.floor(subtotal * 0.5);
      if (pointsRedeemed > maxRedeemable) {
        pointsRedeemed = maxRedeemable;
      }
    }

    const loyaltyDiscount = pointsRedeemed;
    const total = Math.max(subtotal + shippingCost - discount - loyaltyDiscount, 0);

    // ── Create order with RESERVATION in a serializable transaction ──
    const order = await prisma.$transaction(async (tx) => {
      // Lock and verify stock for all items
      const lockedProducts: { id: string; stock: number; name: string }[] = [];
      for (const item of data.items) {
        const rows = await tx.$queryRaw<{ id: string; stock: number; name: string }[]>`
          SELECT id, stock, name FROM "Product"
          WHERE id = ${item.productId} AND "isActive" = true
          FOR UPDATE
        `;
        const product = rows[0];

        if (!product) {
          throw new Error(`Product "${item.name}" is no longer available`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${product.name}". Only ${product.stock} available.`);
        }
        lockedProducts.push(product);
      }

      const expiresAt = new Date(Date.now() + RESERVATION_TTL_MS);

      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerProfileId: customerProfile!.id,
          subtotal,
          shippingCost,
          discount: discount + loyaltyDiscount,
          total,
          shippingAddress: data.shippingAddress,
          billingAddress: data.billingAddress || data.shippingAddress,
          notes: data.notes,
          status: "PENDING",
          expiresAt,
          pointsRedeemed,
          ...(couponId && { couponId, couponCode: couponCode! }),
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
            })),
          },
        },
        include: { items: true },
      });

      // Reserve stock — type RESERVATION (not SALE)
      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];
        const product = lockedProducts[i];

        const newQty = product.stock - item.quantity;
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: newQty },
        });
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: "RESERVATION",
            quantity: -item.quantity,
            previousQty: product.stock,
            newQty,
            reference: newOrder.orderNumber,
            note: `Reserved for order ${newOrder.orderNumber}`,
          },
        });
      }

      return newOrder;
    });

    // Check low stock after reservation
    for (const item of data.items) {
      const afterProduct = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { stock: true, lowStock: true },
      });
      if (afterProduct && afterProduct.stock <= afterProduct.lowStock) {
        await checkAndNotifyLowStock(item.productId, afterProduct.stock);
      }
    }

    // Create payment record
    const paymentRef = `PAY-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: total,
        method: data.paymentMethod === "card" ? "STRIPE" : data.paymentMethod === "bank_transfer" ? "PAYSTACK" : "CASH",
        status: "PENDING",
        reference: paymentRef,
      },
    });

    // Send notification
    try {
      await notify({
        userId: session.user.id,
        event: "order.placed",
        data: {
          customerName: session.user.name || "Valued Customer",
          orderNumber: order.orderNumber,
          items: data.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          total,
          shippingAddress: data.shippingAddress,
        },
      });
      await notifyAdmins("order.placed", {
        customerName: session.user.name || "Valued Customer",
        orderNumber: order.orderNumber,
        total,
      });
    } catch {
      // Notification failure shouldn't block order
    }

    return NextResponse.json({
      order: {
        ...order,
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        discount: Number(order.discount),
        total: Number(order.total),
        pointsRedeemed: order.pointsRedeemed,
      },
      payment: {
        id: payment.id,
        reference: payment.reference,
        amount: Number(payment.amount),
        method: payment.method,
        status: payment.status,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    const message = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Release a reservation: restore stock + cancel order */
async function releaseReservation(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, payments: true },
    });
    if (!order || order.status !== "PENDING") return;

    await prisma.$transaction(async (tx) => {
      // Restore stock for each reserved item
      for (const item of order.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true },
        });
        if (!product) continue;

        const newQty = product.stock + item.quantity;
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: newQty },
        });
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: "RELEASE",
            quantity: item.quantity,
            previousQty: product.stock,
            newQty,
            reference: order.orderNumber,
            note: `Released reservation for expired order ${order.orderNumber}`,
          },
        });
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });

      // Void pending payments
      await tx.payment.updateMany({
        where: { orderId, status: "PENDING" },
        data: { status: "FAILED" },
      });
    });
  } catch (err) {
    console.error("[Reservation] Release failed:", err);
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!customerProfile) {
      return NextResponse.json({ orders: [] });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = { customerProfileId: customerProfile.id };
    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { product: { select: { slug: true } } } },
        payments: { select: { id: true, status: true, method: true, reference: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      orders: orders.map((o) => ({
        ...o,
        subtotal: Number(o.subtotal),
        shippingCost: Number(o.shippingCost),
        discount: Number(o.discount),
        total: Number(o.total),
        items: o.items.map((i) => ({ ...i, price: Number(i.price), slug: i.product.slug })),
      })),
    });
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
