import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal, type } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false, error: "Coupon code is required" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({ valid: false, error: "Invalid coupon code" }, { status: 400 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ valid: false, error: "This coupon is no longer active" }, { status: 400 });
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, error: "This coupon has expired" }, { status: 400 });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ valid: false, error: "This coupon has reached its usage limit" }, { status: 400 });
    }

    if (coupon.minOrderAmount && Number(subtotal || 0) < Number(coupon.minOrderAmount)) {
      return NextResponse.json({
        valid: false,
        error: `Minimum order amount is ₦${Number(coupon.minOrderAmount).toLocaleString()}`,
      }, { status: 400 });
    }

    // Check appliesTo
    if (coupon.appliesTo !== "ALL" && type && coupon.appliesTo !== type) {
      return NextResponse.json({
        valid: false,
        error: `This coupon is only valid for ${coupon.appliesTo.toLowerCase()} purchases`,
      }, { status: 400 });
    }

    // Check per-user limit
    const session = await auth();
    if (session?.user?.id && coupon.perUserLimit) {
      const orderCount = await prisma.order.count({
        where: {
          couponId: coupon.id,
          customerProfile: { userId: session.user.id },
        },
      });
      const appointmentCount = await prisma.appointment.count({
        where: {
          couponId: coupon.id,
          customerProfile: { userId: session.user.id },
        },
      });
      const totalUses = orderCount + appointmentCount;
      if (totalUses >= coupon.perUserLimit) {
        return NextResponse.json({
          valid: false,
          error: "You have already used this coupon the maximum number of times",
        }, { status: 400 });
      }
    }

    // Calculate discount
    const amount = Number(subtotal || 0);
    let discountAmount: number;

    if (coupon.type === "PERCENTAGE") {
      discountAmount = amount * (Number(coupon.value) / 100);
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, Number(coupon.maxDiscountAmount));
      }
    } else {
      discountAmount = Math.min(Number(coupon.value), amount);
    }

    discountAmount = Math.round(discountAmount * 100) / 100;

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
      discountAmount,
      description: coupon.type === "PERCENTAGE"
        ? `${Number(coupon.value)}% off`
        : `₦${Number(coupon.value).toLocaleString()} off`,
    });
  } catch (error) {
    console.error("Validate coupon error:", error);
    return NextResponse.json({ valid: false, error: "Failed to validate coupon" }, { status: 500 });
  }
}
