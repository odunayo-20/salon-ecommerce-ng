import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

/**
 * Release a pending order's reservation: restore stock + cancel order + void payments.
 * Safe to call multiple times (idempotent — only acts on PENDING orders).
 */
export async function releaseReservation(orderId: string): Promise<boolean> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, payments: true },
  });
  if (!order || order.status !== "PENDING") return false;

  await prisma.$transaction(async (tx) => {
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
          note: `Released reservation — order ${order.orderNumber} expired or cancelled`,
        },
      });
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    await tx.payment.updateMany({
      where: { orderId, status: "PENDING" },
      data: { status: "FAILED" },
    });
  });

  await logAudit({
    userId: "SYSTEM",
    action: "UPDATE",
    entityType: "ORDER",
    entityId: orderId,
    entityName: order.orderNumber,
    changes: { status: { old: "PENDING", new: "CANCELLED (expired)" } },
  });

  return true;
}

/**
 * Check if a PENDING order has expired and release it if so.
 * Returns true if the order was expired and released.
 */
export async function expireIfOverdue(orderId: string): Promise<boolean> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, expiresAt: true },
  });
  if (!order || order.status !== "PENDING" || !order.expiresAt) return false;
  if (new Date() <= order.expiresAt) return false;

  return releaseReservation(orderId);
}

/**
 * Batch-expire all overdue PENDING orders.
 * Returns the count of released orders.
 */
export async function expireAllOverdue(): Promise<number> {
  const overdue = await prisma.order.findMany({
    where: {
      status: "PENDING",
      expiresAt: { not: null, lt: new Date() },
    },
    select: { id: true },
  });

  let released = 0;
  for (const { id } of overdue) {
    const ok = await releaseReservation(id);
    if (ok) released++;
  }
  return released;
}
