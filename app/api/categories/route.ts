import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const includeCount = searchParams.get("includeCount") === "true";

    const where = type ? { type } : {};

    const categories = await prisma.category.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      include: includeCount
        ? { _count: { select: { services: true, products: true } } }
        : undefined,
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();
    const { name, slug, description, image, type, sortOrder, isActive } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "A category with this slug already exists" }, { status: 409 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        image: image || null,
        type: type || "service",
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    if (session?.user?.id) {
      await logAudit({
        userId: session.user.id,
        action: "CREATE",
        entityType: "CATEGORY",
        entityId: category.id,
        entityName: category.name,
      });
    }

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
