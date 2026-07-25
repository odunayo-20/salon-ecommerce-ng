import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notifyAdmins } from "@/lib/notifications";
import { logAudit } from "@/lib/audit";

const CANCELLABLE_STATUSES = ["PENDING", "PROCESSING"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!customerProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.customerProfileId !== customerProfile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      return NextResponse.json(
        { error: "Only pending or processing orders can be cancelled" },
        { status: 400 }
      );
    }

    // Update order status + restore stock in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: { status: "CANCELLED" },
      });

      // Restore stock
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
            type: "RETURN",
            quantity: item.quantity,
            previousQty: product.stock,
            newQty,
            reference: order.orderNumber,
            note: `Customer cancelled order ${order.orderNumber}`,
          },
        });
      }

      // Mark PENDING payments as REFUNDED
      await tx.payment.updateMany({
        where: { orderId: id, status: "PENDING" },
        data: { status: "REFUNDED" },
      });
    });

    await logAudit({
      userId: session.user.id,
      action: "UPDATE",
      entityType: "ORDER",
      entityId: id,
      entityName: order.orderNumber,
      changes: { status: { old: order.status, new: "CANCELLED" } },
    });

    // Notify admins
    try {
      await notifyAdmins("order.cancelled", {
        customerName: session.user.name || "Valued Customer",
        orderNumber: order.orderNumber,
        total: Number(order.total),
      });
    } catch {
      // Non-critical
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Order cancel error:", error);
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}
