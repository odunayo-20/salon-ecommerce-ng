import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logAudit, diffObjects } from "@/lib/audit";
import { checkAndNotifyLowStock } from "@/lib/inventory";

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

    // Bulk update: { items: [{ productId, stock }] }
    if (body.items && Array.isArray(body.items)) {
      const results: { id: string; success: boolean; error?: string }[] = [];

      for (const item of body.items) {
        try {
          const product = await prisma.product.findUnique({ where: { id: item.productId } });
          if (!product) {
            results.push({ id: item.productId, success: false, error: "Not found" });
            continue;
          }

          const oldStock = product.stock;
          const newStock = item.stock;

          await prisma.$transaction([
            prisma.product.update({ where: { id: item.productId }, data: { stock: newStock } }),
            prisma.stockMovement.create({
              data: {
                productId: item.productId,
                type: "ADJUSTMENT",
                quantity: newStock - oldStock,
                previousQty: oldStock,
                newQty: newStock,
                note: body.note || "Bulk update",
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
    }

    // Single product stock update
    const { stock, lowStock } = body as { stock?: number; lowStock?: number };
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updateData: Record<string, unknown> = {};
    const changes: Record<string, { old: unknown; new: unknown }> = {};

    if (typeof stock === "number") {
      updateData.stock = stock;
      changes.stock = { old: product.stock, new: stock };
    }
    if (typeof lowStock === "number") {
      updateData.lowStock = lowStock;
      changes.lowStock = { old: product.lowStock, new: lowStock };
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    await prisma.product.update({ where: { id }, data: updateData });

    if (typeof stock === "number" && stock !== product.stock) {
      await prisma.stockMovement.create({
        data: {
          productId: id,
          type: "ADJUSTMENT",
          quantity: stock - product.stock,
          previousQty: product.stock,
          newQty: stock,
          note: body.note || "Admin adjustment",
          createdBy: session.user.id,
        },
      });
    }

    await logAudit({
      userId: session.user.id,
      action: "UPDATE",
      entityType: "PRODUCT",
      entityId: id,
      entityName: product.name,
      changes,
    });

    if (typeof stock === "number" && stock <= product.lowStock) {
      await checkAndNotifyLowStock(id, stock);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Inventory update error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
