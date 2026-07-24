import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logAudit, diffObjects } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({
      coupon: {
        ...coupon,
        value: Number(coupon.value),
        minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null,
        maxDiscountAmount: coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : null,
      },
    });
  } catch (error) {
    console.error("Fetch coupon error:", error);
    return NextResponse.json({ error: "Failed to fetch coupon" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    // If code is being changed, check for duplicates
    if (body.code && body.code.toUpperCase() !== coupon.code) {
      const existing = await prisma.coupon.findUnique({
        where: { code: body.code.toUpperCase() },
      });
      if (existing) {
        return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 409 });
      }
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        ...(body.code && { code: body.code.toUpperCase() }),
        ...(body.type && { type: body.type }),
        ...(body.value !== undefined && { value: body.value }),
        ...(body.minOrderAmount !== undefined && { minOrderAmount: body.minOrderAmount }),
        ...(body.maxDiscountAmount !== undefined && { maxDiscountAmount: body.maxDiscountAmount }),
        ...(body.usageLimit !== undefined && { usageLimit: body.usageLimit }),
        ...(body.perUserLimit !== undefined && { perUserLimit: body.perUserLimit }),
        ...(body.expiresAt !== undefined && { expiresAt: body.expiresAt ? new Date(body.expiresAt) : null }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.appliesTo && { appliesTo: body.appliesTo }),
      },
    });

    const changes = diffObjects(
      { code: coupon.code, type: coupon.type, value: Number(coupon.value), isActive: coupon.isActive, appliesTo: coupon.appliesTo },
      { code: updated.code, type: updated.type, value: Number(updated.value), isActive: updated.isActive, appliesTo: updated.appliesTo }
    );
    if (changes) {
      await logAudit({
        userId: session.user.id,
        action: "UPDATE",
        entityType: "COUPON",
        entityId: id,
        entityName: updated.code,
        changes,
      });
    }

    return NextResponse.json({
      coupon: {
        ...updated,
        value: Number(updated.value),
        minOrderAmount: updated.minOrderAmount ? Number(updated.minOrderAmount) : null,
        maxDiscountAmount: updated.maxDiscountAmount ? Number(updated.maxDiscountAmount) : null,
      },
    });
  } catch (error) {
    console.error("Update coupon error:", error);
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    await prisma.coupon.delete({ where: { id } });

    await logAudit({
      userId: session.user.id,
      action: "DELETE",
      entityType: "COUPON",
      entityId: id,
      entityName: coupon.code,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete coupon error:", error);
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
