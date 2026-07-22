import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateOrderNumber } from "@/utils/helpers";
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
    const total = subtotal + shippingCost;

    // Create order with items and decrement stock in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerProfileId: customerProfile!.id,
          subtotal,
          shippingCost,
          total,
          shippingAddress: data.shippingAddress,
          billingAddress: data.billingAddress || data.shippingAddress,
          notes: data.notes,
          status: data.paymentMethod === "pay_on_delivery" ? "PROCESSING" : "PENDING",
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

    return NextResponse.json({
      order: {
        ...order,
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        total: Number(order.total),
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
        items: true,
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
        items: o.items.map((i) => ({ ...i, price: Number(i.price) })),
      })),
    });
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
