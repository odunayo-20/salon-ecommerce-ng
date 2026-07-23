import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: true,
        reviews: { select: { rating: true } },
        _count: { select: { orderItems: true, wishlist: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const ratings = product.reviews.map((r) => r.rating);
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    return NextResponse.json({
      product: {
        ...product,
        price: Number(product.price),
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
        weight: product.weight ? Number(product.weight) : null,
        variants: product.variants.map((v) => ({ ...v, price: Number(v.price) })),
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: ratings.length,
      },
    });
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name, slug, description, shortDesc, price, comparePrice, sku, barcode,
      image, images, videoUrl, categoryId, stock, lowStock, weight, isActive, isFeatured,
      tags, hairTexture, hairLength, hairColor,
    } = body;

    // Merge single image into images array
    let finalImages = Array.isArray(images) ? images : undefined;
    if (image && finalImages !== undefined && finalImages.length === 0) {
      finalImages = [image];
    } else if (image && finalImages === undefined) {
      finalImages = [image];
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (slug && slug !== existing.slug) {
      const slugTaken = await prisma.product.findUnique({ where: { slug } });
      if (slugTaken) {
        return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
      }
    }

    if (sku && sku !== existing.sku) {
      const skuTaken = await prisma.product.findUnique({ where: { sku } });
      if (skuTaken) {
        return NextResponse.json({ error: "A product with this SKU already exists" }, { status: 409 });
      }
    }

    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!categoryExists) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description: description || null }),
        ...(shortDesc !== undefined && { shortDesc: shortDesc || null }),
        ...(price !== undefined && { price }),
        ...(comparePrice !== undefined && { comparePrice: comparePrice || null }),
        ...(sku !== undefined && { sku: sku || null }),
        ...(barcode !== undefined && { barcode: barcode || null }),
        ...(finalImages !== undefined && { images: JSON.stringify(finalImages) }),
        ...(image !== undefined && { image: image || (finalImages && finalImages[0]) || null }),
        ...(videoUrl !== undefined && { videoUrl: videoUrl || null }),
        ...(categoryId !== undefined && { categoryId }),
        ...(stock !== undefined && { stock }),
        ...(lowStock !== undefined && { lowStock }),
        ...(weight !== undefined && { weight: weight || null }),
        ...(isActive !== undefined && { isActive }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(tags !== undefined && { tags: JSON.stringify(tags) }),
        ...(hairTexture !== undefined && { hairTexture: hairTexture || null }),
        ...(hairLength !== undefined && { hairLength: hairLength || null }),
        ...(hairColor !== undefined && { hairColor: hairColor || null }),
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({
      product: {
        ...product,
        price: Number(product.price),
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      },
    });
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { _count: { select: { orderItems: true, cartItems: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (existing._count.orderItems > 0) {
      return NextResponse.json(
        { error: `Cannot delete "${existing.name}" — it has ${existing._count.orderItems} order history entries. Deactivate instead.` },
        { status: 409 }
      );
    }

    await prisma.wishlist.deleteMany({ where: { productId: id } });
    await prisma.cartItem.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
