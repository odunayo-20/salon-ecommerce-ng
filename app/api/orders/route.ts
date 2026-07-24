import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateOrderNumber } from "@/utils/helpers";
import { notify, notifyAdmins } from "@/lib/notifications";
import { z } from "zod";

const orderItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  image: z.string().optional(),
  variantId: z.string().optional(),
});

const orderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  shippingAddress: z.string().min(1, "Shipping address is required"),
  billingAddress: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(["card", "bank_transfer", "pay_on_delivery"]),
  couponCode: z.string().optional(),
  pointsRedeemed: z.number().int().min(0).optional().default(0),
});

export async function POST(request: NextRequest) {
  try {
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

    // Verify stock for all items
    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, name: true, stock: true, isActive: true },
      });

      if (!product || !product.isActive) {
        return NextResponse.json(
          { error: `Product "${item.name}" is no longer available` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${product.name}". Only ${product.stock} available.` },
          { status: 400 }
        );
      }
    }

    // Get or create customer profile
    let customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!customerProfile) {
      customerProfile = await prisma.customerProfile.create({
        data: { userId: session.user.id },
      });
    }

    const subtotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = subtotal >= 30000 ? 0 : 2000;

    // Validate and apply coupon
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
        const userUses = await prisma.order.count({ where: { couponId: coupon.id, customerProfile: { userId: session.user.id } } });
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

    // Validate and apply loyalty points redemption
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

    // Create order with items and decrement stock in a transaction
    const order = await prisma.$transaction(async (tx) => {
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
          status: data.paymentMethod === "pay_on_delivery" ? "PROCESSING" : "PENDING",
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

      // Decrement stock
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Increment coupon usage
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Deduct loyalty points
      if (pointsRedeemed > 0) {
        await tx.loyaltyPoint.create({
          data: {
            userId: session.user.id,
            points: pointsRedeemed,
            type: "redeemed",
            reference: newOrder.orderNumber,
            note: `Redeemed for order ${newOrder.orderNumber}`,
          },
        });
      }

      return newOrder;
    });

    // Create payment record
    const paymentRef = `PAY-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: total,
        method: data.paymentMethod === "card" ? "STRIPE" : data.paymentMethod === "bank_transfer" ? "PAYSTACK" : "CASH",
        status: data.paymentMethod === "pay_on_delivery" ? "PENDING" : "PENDING",
        reference: paymentRef,
      },
    });

    // Send order placed notification
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
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
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
