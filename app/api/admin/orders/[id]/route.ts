import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notify } from "@/lib/notifications";

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

    // Send status update notifications
    if (status && order.customerProfile?.user?.id) {
      try {
        const customerName = order.customerProfile.user.name || "Valued Customer";
        const orderNum = order.orderNumber;
        const items = order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: Number(item.price),
        }));
        const total = Number(order.total);

        if (status.toUpperCase() === "PROCESSING") {
          await notify({
            userId: order.customerProfile.user.id,
            event: "order.processing",
            data: { customerName, orderNumber: orderNum, items, total },
          });
        } else if (status.toUpperCase() === "SHIPPED") {
          await notify({
            userId: order.customerProfile.user.id,
            event: "order.shipped",
            data: {
              customerName,
              orderNumber: orderNum,
              items,
              total,
              trackingNumber: trackingNumber || order.trackingNumber || undefined,
            },
          });
        } else if (status.toUpperCase() === "DELIVERED") {
          await notify({
            userId: order.customerProfile.user.id,
            event: "order.delivered",
            data: { customerName, orderNumber: orderNum, items, total },
          });
        }
      } catch {
        // Notification failure shouldn't block order update
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
