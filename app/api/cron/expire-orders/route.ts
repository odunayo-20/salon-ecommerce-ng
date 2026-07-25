import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find all PENDING orders past their expiration
    const expired = await prisma.order.findMany({
      where: {
        status: "PENDING",
        expiresAt: { lt: new Date() },
      },
      include: {
        items: true,
        customerProfile: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    let released = 0;

    for (const order of expired) {
      try {
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
                note: `Auto-released: order expired after 30 min`,
              },
            });
          }

          // Cancel the order
          await tx.order.update({
            where: { id: order.id },
            data: { status: "CANCELLED" },
          });

          // Void pending payments
          await tx.payment.updateMany({
            where: { orderId: order.id, status: "PENDING" },
            data: { status: "FAILED" },
          });
        });

        await logAudit({
          userId: "SYSTEM",
          action: "UPDATE",
          entityType: "ORDER",
          entityId: order.id,
          entityName: order.orderNumber,
          changes: { status: { old: "PENDING", new: "CANCELLED (expired)" } },
        });

        released++;
      } catch (err) {
        console.error(`[Expiry] Failed to release order ${order.orderNumber}:`, err);
      }
    }

    return NextResponse.json({
      checked: expired.length,
      released,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Expiry cron error:", error);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
