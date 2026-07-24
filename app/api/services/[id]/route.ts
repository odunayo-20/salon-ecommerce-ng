import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logAudit, diffObjects } from "@/lib/audit";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        reviews: { select: { rating: true } },
        _count: { select: { appointments: true } },
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const ratings = service.reviews.map((r) => r.rating);
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    return NextResponse.json({
      service: {
        ...service,
        price: Number(service.price),
        depositAmount: service.depositAmount ? Number(service.depositAmount) : null,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: ratings.length,
      },
    });
  } catch (error) {
    console.error("Failed to fetch service:", error);
    return NextResponse.json({ error: "Failed to fetch service" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, duration, price, depositAmount, categoryId, isActive, isPopular, sortOrder } = body;

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    if (slug && slug !== existing.slug) {
      const slugTaken = await prisma.service.findUnique({ where: { slug } });
      if (slugTaken) {
        return NextResponse.json({ error: "A service with this slug already exists" }, { status: 409 });
      }
    }

    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!categoryExists) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description: description || null }),
        ...(duration !== undefined && { duration: parseInt(duration) }),
        ...(price !== undefined && { price }),
        ...(depositAmount !== undefined && { depositAmount: depositAmount || null }),
        ...(categoryId !== undefined && { categoryId }),
        ...(isActive !== undefined && { isActive }),
        ...(isPopular !== undefined && { isPopular }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    if (session?.user?.id) {
      const changes = diffObjects(
        { name: existing.name, price: Number(existing.price), duration: existing.duration, isActive: existing.isActive },
        { name: service.name, price: Number(service.price), duration: service.duration, isActive: service.isActive }
      );
      if (changes) {
        await logAudit({
          userId: session.user.id,
          action: "UPDATE",
          entityType: "SERVICE",
          entityId: id,
          entityName: service.name,
          changes,
        });
      }
    }

    return NextResponse.json({
      service: {
        ...service,
        price: Number(service.price),
        depositAmount: service.depositAmount ? Number(service.depositAmount) : null,
      },
    });
  } catch (error) {
    console.error("Failed to update service:", error);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    const existing = await prisma.service.findUnique({
      where: { id },
      include: { _count: { select: { appointments: true, reviews: true, stylists: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    if (existing._count.appointments > 0) {
      return NextResponse.json(
        { error: `Cannot delete "${existing.name}" — it has ${existing._count.appointments} appointments. Deactivate instead.` },
        { status: 409 }
      );
    }

    await prisma.stylistService.deleteMany({ where: { serviceId: id } });
    await prisma.service.delete({ where: { id } });

    if (session?.user?.id) {
      await logAudit({
        userId: session.user.id,
        action: "DELETE",
        entityType: "SERVICE",
        entityId: id,
        entityName: existing.name,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete service:", error);
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
