import { prisma } from "@/lib/prisma";
import { notifyAdmins } from "@/lib/notifications";

export async function checkAndNotifyLowStock(
  productId: string,
  newQty: number
): Promise<void> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { name: true, stock: true, lowStock: true },
    });

    if (!product) return;
    if (product.stock > product.lowStock) return;

    await notifyAdmins("inventory.low_stock", {
      productName: product.name,
      currentStock: product.stock,
      threshold: product.lowStock,
    });
  } catch (err) {
    console.error("[LowStock] Notification failed:", err);
  }
}
