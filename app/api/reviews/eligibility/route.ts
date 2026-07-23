import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ eligible: false, reason: "not_signed_in" });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ eligible: false, reason: "missing_product" });
    }

    const profile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ eligible: false, reason: "no_profile" });
    }

    const deliveredOrder = await prisma.order.findFirst({
      where: {
        customerProfileId: profile.id,
        status: "DELIVERED",
        items: { some: { productId } },
      },
      select: { id: true, orderNumber: true, deliveredAt: true },
    });

    if (!deliveredOrder) {
      return NextResponse.json({ eligible: false, reason: "not_delivered" });
    }

    const existingReview = await prisma.review.findFirst({
      where: { userId: session.user.id, productId },
      select: { id: true },
    });

    return NextResponse.json({
      eligible: true,
      orderId: deliveredOrder.id,
      orderNumber: deliveredOrder.orderNumber,
      alreadyReviewed: !!existingReview,
    });
  } catch (error) {
    console.error("Review eligibility check error:", error);
    return NextResponse.json({ eligible: false, reason: "error" });
  }
}
