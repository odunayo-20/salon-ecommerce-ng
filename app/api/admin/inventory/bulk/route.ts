import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { checkAndNotifyLowStock } from "@/lib/inventory";

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items, note } = body as { items: { productId: string; stock: number }[]; note?: string };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    const results: { id: string; success: boolean; error?: string }[] = [];

    for (const item of items) {
      try {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          results.push({ id: item.productId, success: false, error: "Not found" });
          continue;
        }

        const oldStock = product.stock;
        const newStock = item.stock;

        if (oldStock === newStock) {
          results.push({ id: item.productId, success: true });
          continue;
        }

        await prisma.$transaction([
          prisma.product.update({ where: { id: item.productId }, data: { stock: newStock } }),
          prisma.stockMovement.create({
            data: {
              productId: item.productId,
              type: "ADJUSTMENT",
              quantity: newStock - oldStock,
              previousQty: oldStock,
              newQty: newStock,
              note: note || "Bulk update",
              createdBy: session.user.id,
            },
          }),
        ]);

        await logAudit({
          userId: session.user.id,
          action: "UPDATE",
          entityType: "PRODUCT",
          entityId: item.productId,
          entityName: product.name,
          changes: { stock: { old: oldStock, new: newStock } },
        });

        if (newStock <= product.lowStock) {
          await checkAndNotifyLowStock(item.productId, newStock);
        }

        results.push({ id: item.productId, success: true });
      } catch (e) {
        results.push({ id: item.productId, success: false, error: String(e) });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Bulk update error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
