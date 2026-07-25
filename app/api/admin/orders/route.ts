import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customerProfile: { user: { name: { contains: search, mode: "insensitive" } } } },
        { customerProfile: { user: { email: { contains: search, mode: "insensitive" } } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          customerProfile: { include: { user: { select: { id: true, name: true, email: true, image: true, phone: true } } } },
          payments: { select: { id: true, amount: true, status: true, method: true, reference: true, paidAt: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        subtotal: Number(o.subtotal),
        shippingCost: Number(o.shippingCost),
        discount: Number(o.discount),
        total: Number(o.total),
        currency: o.currency,
        shippingAddress: o.shippingAddress,
        notes: o.notes,
        trackingNumber: o.trackingNumber,
        shippedAt: o.shippedAt?.toISOString() || null,
        deliveredAt: o.deliveredAt?.toISOString() || null,
        couponCode: o.couponCode,
        pointsRedeemed: o.pointsRedeemed,
        loyaltyPointsEarned: o.loyaltyPointsEarned,
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
        items: o.items.map((i) => ({ ...i, price: Number(i.price) })),
        customerProfile: o.customerProfile
          ? {
              id: o.customerProfile.id,
              user: o.customerProfile.user,
            }
          : null,
        payments: o.payments.map((p) => ({
          ...p,
          amount: Number(p.amount),
          paidAt: p.paidAt?.toISOString() || null,
        })),
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Admin orders fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
