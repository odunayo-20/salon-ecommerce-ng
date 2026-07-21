import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const isActive = searchParams.get("isActive");
    const isFeatured = searchParams.get("isFeatured");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Record<string, unknown> = {};
    if (categoryId) where.categoryId = categoryId;
    if (isActive !== null && isActive !== undefined) where.isActive = isActive === "true";
    if (isFeatured !== null && isFeatured !== undefined) where.isFeatured = isFeatured === "true";
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          variants: { select: { id: true, name: true, price: true, stock: true, isActive: true } },
          _count: { select: { reviews: true, orderItems: true, wishlist: true } },
        },
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const productsClean = products.map((p) => ({
      ...p,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      weight: p.weight ? Number(p.weight) : null,
      reviewCount: p._count.reviews,
      orderCount: p._count.orderItems,
      wishlistCount: p._count.wishlist,
      variantCount: p.variants.length,
    }));

    return NextResponse.json({ products: productsClean, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name, slug, description, shortDesc, price, comparePrice, sku, barcode,
      images, videoUrl, categoryId, stock, lowStock, weight, isActive, isFeatured,
      tags, hairTexture, hairLength, hairColor, metadata,
    } = body;

    if (!name || !slug || price === undefined || !categoryId) {
      return NextResponse.json({ error: "Name, slug, price, and category are required" }, { status: 400 });
    }

    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
    }

    if (sku) {
      const existingSku = await prisma.product.findUnique({ where: { sku } });
      if (existingSku) {
        return NextResponse.json({ error: "A product with this SKU already exists" }, { status: 409 });
      }
    }

    const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!categoryExists) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        shortDesc: shortDesc || null,
        price,
        comparePrice: comparePrice || null,
        sku: sku || null,
        barcode: barcode || null,
        images: images ? JSON.stringify(images) : "[]",
        videoUrl: videoUrl || null,
        categoryId,
        stock: stock || 0,
        lowStock: lowStock || 5,
        weight: weight || null,
        isActive: isActive !== undefined ? isActive : true,
        isFeatured: isFeatured || false,
        tags: tags ? JSON.stringify(tags) : "[]",
        hairTexture: hairTexture || null,
        hairLength: hairLength || null,
        hairColor: hairColor || null,
        metadata: metadata ? JSON.stringify(metadata) : "{}",
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({
      product: { ...product, price: Number(product.price), comparePrice: product.comparePrice ? Number(product.comparePrice) : null },
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
