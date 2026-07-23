import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendEmail, orderShippedEmail, orderDeliveredEmail, orderProcessingEmail } from "@/lib/resend";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, trackingNumber, notes } = body;

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) {
      updateData.status = status.toUpperCase();
      if (status.toUpperCase() === "SHIPPED" && trackingNumber) {
        updateData.trackingNumber = trackingNumber;
        updateData.shippedAt = new Date();
      }
      if (status.toUpperCase() === "DELIVERED") {
        updateData.deliveredAt = new Date();
      }
    }
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (notes !== undefined) updateData.notes = notes;

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        customerProfile: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
        payments: { select: { id: true, amount: true, status: true, method: true, reference: true } },
      },
    });

    // Send status update email
    if (status && order.customerProfile?.user?.email) {
      try {
        const customerName = order.customerProfile.user.name || "Valued Customer";
        const orderNum = order.orderNumber;

        if (status.toUpperCase() === "PROCESSING") {
          await sendEmail({
            to: order.customerProfile.user.email,
            subject: `Order Processing — ${orderNum}`,
            html: orderProcessingEmail({ customerName, orderNumber: orderNum }),
          });
        } else if (status.toUpperCase() === "SHIPPED") {
          await sendEmail({
            to: order.customerProfile.user.email,
            subject: `Order Shipped — ${orderNum}`,
            html: orderShippedEmail({ customerName, orderNumber: orderNum, trackingNumber: trackingNumber || order.trackingNumber || undefined }),
          });
        } else if (status.toUpperCase() === "DELIVERED") {
          await sendEmail({
            to: order.customerProfile.user.email,
            subject: `Order Delivered — ${orderNum}`,
            html: orderDeliveredEmail({ customerName, orderNumber: orderNum }),
          });
        }
      } catch {
        // Email failure shouldn't block order update
      }
    }

    return NextResponse.json({
      order: {
        ...order,
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        discount: Number(order.discount),
        total: Number(order.total),
        items: order.items.map((i) => ({ ...i, price: Number(i.price) })),
        payments: order.payments.map((p) => ({ ...p, amount: Number(p.amount) })),
      },
    });
  } catch (error) {
    console.error("Admin order update error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
