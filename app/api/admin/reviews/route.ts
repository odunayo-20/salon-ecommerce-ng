import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isApproved = searchParams.get("isApproved");
    const isFeatured = searchParams.get("isFeatured");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (isApproved !== null && isApproved !== undefined) where.isApproved = isApproved === "true";
    if (isFeatured !== null && isFeatured !== undefined) where.isFeatured = isFeatured === "true";
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { comment: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, image: true } },
        product: { select: { id: true, name: true } },
        service: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        id: r.id, rating: r.rating, title: r.title, comment: r.comment,
        isApproved: r.isApproved, isFeatured: r.isFeatured,
        createdAt: r.createdAt.toISOString(),
        customer: r.user.name, customerImage: r.user.image,
        productName: r.product?.name || null, serviceName: r.service?.name || null,
      })),
    });
  } catch (error) {
    console.error("Admin reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, isApproved, isFeatured } = body;
    if (!id) return NextResponse.json({ error: "Review ID is required" }, { status: 400 });

    const review = await prisma.review.update({
      where: { id },
      data: {
        ...(isApproved !== undefined && { isApproved }),
        ...(isFeatured !== undefined && { isFeatured }),
      },
    });

    await logAudit({
      userId: session.user.id,
      action: "UPDATE",
      entityType: "REVIEW",
      entityId: id,
      entityName: review.title || "Review",
      changes: {
        ...(isApproved !== undefined && { isApproved: { old: undefined, new: isApproved } }),
        ...(isFeatured !== undefined && { isFeatured: { old: undefined, new: isFeatured } }),
      },
    });

    return NextResponse.json({ review });
  } catch (error) {
    console.error("Admin review update error:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Review ID is required" }, { status: 400 });

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    await prisma.review.delete({ where: { id } });

    await logAudit({
      userId: session.user.id,
      action: "DELETE",
      entityType: "REVIEW",
      entityId: id,
      entityName: review.title || "Review",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin review delete error:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
