import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { checkAndNotifyLowStock } from "@/lib/inventory";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const lowStockOnly = searchParams.get("lowStock") === "true";
    const category = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }
    if (category) where.categoryId = category;

    const products = await prisma.product.findMany({
      where,
      include: { category: { select: { name: true } }, variants: { select: { id: true, name: true, stock: true } } },
      orderBy: lowStockOnly ? { stock: "asc" } : { updatedAt: "desc" },
      skip: lowStockOnly ? 0 : skip,
      take: lowStockOnly ? 200 : limit,
    });

    // For low stock filtering, we filter in JS since we need to compare stock <= lowStock (two columns)
    const filtered = lowStockOnly
      ? products.filter((p) => p.stock <= p.lowStock)
      : products;

    const total = await prisma.product.count({ where: { isActive: true } });
    const lowStockCount = (await prisma.product.findMany({ where: { isActive: true }, select: { stock: true, lowStock: true } }))
      .filter((p) => p.stock <= p.lowStock).length;

    // Recent movements
    const recentMovements = await prisma.stockMovement.findMany({
      include: { product: { select: { name: true } }, variant: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      products: filtered.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        stock: p.stock,
        lowStock: p.lowStock,
        category: p.category.name,
        image: p.image,
        variants: p.variants.map((v) => ({ id: v.id, name: v.name, stock: v.stock })),
        isLowStock: p.stock <= p.lowStock,
        isOutOfStock: p.stock === 0,
      })),
      recentMovements: recentMovements.map((m) => ({
        id: m.id,
        productName: m.product.name,
        variantName: m.variant?.name,
        type: m.type,
        quantity: m.quantity,
        previousQty: m.previousQty,
        newQty: m.newQty,
        reference: m.reference,
        note: m.note,
        createdAt: m.createdAt,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      lowStockCount,
    });
  } catch (error) {
    console.error("Inventory fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, variantId, type, quantity, note } = body as {
      productId: string; variantId?: string; type: string; quantity: number; note?: string;
    };

    if (!productId || !type || typeof quantity !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validTypes = ["ADJUSTMENT", "RESTOCK", "DAMAGE", "RETURN", "TRANSFER"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid movement type" }, { status: 400 });
    }

    if (variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
      if (!variant) return NextResponse.json({ error: "Variant not found" }, { status: 404 });

      const previousQty = variant.stock;
      const newQty = previousQty + quantity;
      if (newQty < 0) return NextResponse.json({ error: "Stock cannot go below zero" }, { status: 400 });

      await prisma.$transaction([
        prisma.productVariant.update({ where: { id: variantId }, data: { stock: newQty } }),
        prisma.stockMovement.create({
          data: { productId, variantId, type, quantity, previousQty, newQty, note, createdBy: session.user.id },
        }),
      ]);

      await logAudit({
        userId: session.user.id,
        action: "UPDATE",
        entityType: "PRODUCT_VARIANT",
        entityId: variantId,
        entityName: variant.name,
        changes: { stock: { old: previousQty, new: newQty } },
      });

      // Low-stock alert is variant-level; skip for parent product
    } else {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

      const previousQty = product.stock;
      const newQty = previousQty + quantity;
      if (newQty < 0) return NextResponse.json({ error: "Stock cannot go below zero" }, { status: 400 });

      await prisma.$transaction([
        prisma.product.update({ where: { id: productId }, data: { stock: newQty } }),
        prisma.stockMovement.create({
          data: { productId, type, quantity, previousQty, newQty, note, createdBy: session.user.id },
        }),
      ]);

      await logAudit({
        userId: session.user.id,
        action: "UPDATE",
        entityType: "PRODUCT",
        entityId: productId,
        entityName: product.name,
        changes: { stock: { old: previousQty, new: newQty } },
      });

      if (newQty <= product.lowStock) {
        await checkAndNotifyLowStock(productId, newQty);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Inventory adjust error:", error);
    return NextResponse.json({ error: "Failed to adjust stock" }, { status: 500 });
  }
}
