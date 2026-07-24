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

    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { services: true, products: true } } },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Failed to fetch category:", error);
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
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
    const { name, slug, description, image, type, sortOrder, isActive } = body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    if (slug && slug !== existing.slug) {
      const slugTaken = await prisma.category.findUnique({ where: { slug } });
      if (slugTaken) {
        return NextResponse.json({ error: "A category with this slug already exists" }, { status: 409 });
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description: description || null }),
        ...(image !== undefined && { image: image || null }),
        ...(type !== undefined && { type }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    if (session?.user?.id) {
      const changes = diffObjects(
        { name: existing.name, slug: existing.slug, isActive: existing.isActive },
        { name: category.name, slug: category.slug, isActive: category.isActive }
      );
      if (changes) {
        await logAudit({ userId: session.user.id, action: "UPDATE", entityType: "CATEGORY", entityId: id, entityName: category.name, changes });
      }
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Failed to update category:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    const existing = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { services: true, products: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    if (existing._count.services > 0 || existing._count.products > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${existing._count.services} services and ${existing._count.products} products. Reassign them first.` },
        { status: 409 }
      );
    }

    await prisma.category.delete({ where: { id } });

    if (session?.user?.id) {
      await logAudit({ userId: session.user.id, action: "DELETE", entityType: "CATEGORY", entityId: id, entityName: existing.name });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete category:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
