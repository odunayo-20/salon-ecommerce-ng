import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const slug = searchParams.get("slug");
    const isActive = searchParams.get("isActive");
    const isPopular = searchParams.get("isPopular");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (slug) {
      const service = await prisma.service.findUnique({
        where: { slug },
        include: {
          category: { select: { id: true, name: true, slug: true, type: true } },
          stylists: {
            include: { stylist: { include: { user: { select: { name: true, image: true } } } } },
          },
          reviews: { select: { rating: true, comment: true, createdAt: true, user: { select: { name: true } } } },
          _count: { select: { reviews: true, appointments: true } },
        },
      });
      if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });
      const ratings = service.reviews.map((r) => r.rating);
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      return NextResponse.json({
        service: {
          ...service,
          price: Number(service.price),
          depositAmount: service.depositAmount ? Number(service.depositAmount) : null,
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: ratings.length,
          stylists: service.stylists.map((ss) => ({
            id: ss.stylist.id,
            name: ss.stylist.user.name,
            image: ss.stylist.user.image,
            specialties: JSON.parse(ss.stylist.specialties || "[]"),
            experience: ss.stylist.experience,
          })),
          reviews: service.reviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
        },
      });
    }

    const where: Record<string, unknown> = {};
    if (categoryId) where.categoryId = categoryId;
    if (isActive !== null && isActive !== undefined) where.isActive = isActive === "true";
    if (isPopular !== null && isPopular !== undefined) where.isPopular = isPopular === "true";
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true, type: true } },
          _count: { select: { reviews: true, appointments: true } },
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.service.count({ where }),
    ]);

    const servicesWithRating = services.map((s) => ({
      ...s,
      price: Number(s.price),
      depositAmount: s.depositAmount ? Number(s.depositAmount) : null,
      rating:
        s._count.reviews > 0
          ? 0 // will be calculated if reviews are included
          : 0,
      reviewCount: s._count.reviews,
      appointmentCount: s._count.appointments,
    }));

    return NextResponse.json({
      services: servicesWithRating,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, duration, price, depositAmount, categoryId, isActive, isPopular, sortOrder } = body;

    if (!name || !slug || !duration || price === undefined || !categoryId) {
      return NextResponse.json(
        { error: "Name, slug, duration, price, and category are required" },
        { status: 400 }
      );
    }

    const existingSlug = await prisma.service.findUnique({ where: { slug } });
    if (existingSlug) {
      return NextResponse.json({ error: "A service with this slug already exists" }, { status: 409 });
    }

    const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!categoryExists) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const service = await prisma.service.create({
      data: {
        name,
        slug,
        description: description || null,
        duration: parseInt(duration),
        price,
        depositAmount: depositAmount || null,
        categoryId,
        isActive: isActive !== undefined ? isActive : true,
        isPopular: isPopular || false,
        sortOrder: sortOrder || 0,
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    await logAudit({
      userId: session.user.id,
      action: "CREATE",
      entityType: "SERVICE",
      entityId: service.id,
      entityName: service.name,
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    console.error("Failed to create service:", error);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
