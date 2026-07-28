import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { expireIfOverdue } from "@/lib/orders";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!customerProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: { select: { slug: true } } } },
        payments: {
          select: {
            id: true, amount: true, status: true, method: true,
            reference: true, paidAt: true, createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.customerProfileId !== customerProfile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let displayStatus = order.status;
    if (order.status === "PENDING" && order.expiresAt && new Date() > order.expiresAt) {
      await expireIfOverdue(order.id);
      displayStatus = "CANCELLED";
    }

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: displayStatus,
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        discount: Number(order.discount),
        total: Number(order.total),
        currency: order.currency,
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        notes: order.notes,
        trackingNumber: order.trackingNumber,
        shippedAt: order.shippedAt?.toISOString() || null,
        deliveredAt: order.deliveredAt?.toISOString() || null,
        couponCode: order.couponCode,
        pointsRedeemed: order.pointsRedeemed,
        loyaltyPointsEarned: order.loyaltyPointsEarned,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        expiresAt: order.expiresAt?.toISOString() || null,
        items: order.items.map((i) => ({
          id: i.id,
          name: i.name,
          price: Number(i.price),
          quantity: i.quantity,
          image: i.image,
          slug: i.product.slug,
        })),
        payments: order.payments.map((p) => ({
          id: p.id,
          amount: Number(p.amount),
          status: p.status,
          method: p.method,
          reference: p.reference,
          paidAt: p.paidAt?.toISOString() || null,
          createdAt: p.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("Fetch order error:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
