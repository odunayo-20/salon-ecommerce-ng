import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const serviceId = searchParams.get("serviceId");
    const isFeatured = searchParams.get("isFeatured");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Record<string, unknown> = { isApproved: true };
    if (productId) where.productId = productId;
    if (serviceId) where.serviceId = serviceId;
    if (isFeatured === "true") where.isFeatured = true;

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, image: true } },
        product: { select: { id: true, name: true, slug: true } },
        service: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        id: r.id,
        name: r.user.name || "Anonymous",
        avatar: r.user.image || null,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        service: r.service?.name || null,
        product: r.product?.name || null,
        date: r.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Reviews fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "You must be signed in to leave a review" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, serviceId, rating, title, comment, images } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    if (!productId && !serviceId) {
      return NextResponse.json({ error: "A product or service must be specified" }, { status: 400 });
    }

    if (productId) {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (serviceId) {
      const service = await prisma.service.findUnique({ where: { id: serviceId } });
      if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const existing = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        ...(productId ? { productId } : { serviceId }),
      },
    });

    if (existing) {
      return NextResponse.json({ error: "You have already reviewed this item" }, { status: 409 });
    }

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId: productId || null,
        serviceId: serviceId || null,
        rating: Math.round(rating),
        title: title?.trim() || null,
        comment: comment?.trim() || null,
        images: images ? JSON.stringify(images) : "[]",
        isApproved: false,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({
      review: {
        ...review,
        images: JSON.parse(review.images || "[]"),
        createdAt: review.createdAt.toISOString(),
      },
      message: "Review submitted! It will appear after admin approval.",
    }, { status: 201 });
  } catch (error) {
    console.error("Review create error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
