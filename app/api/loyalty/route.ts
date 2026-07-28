import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { TIER_THRESHOLDS, nextTier, getLoyaltyBalance } from "@/lib/loyalty";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [membership, pointsHistory, totalEarned, totalRedeemed, totalReversed] = await Promise.all([
      prisma.membership.findUnique({ where: { userId: session.user.id } }),
      prisma.loyaltyPoint.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.loyaltyPoint.aggregate({
        where: { userId: session.user.id, type: "earned" },
        _sum: { points: true },
      }),
      prisma.loyaltyPoint.aggregate({
        where: { userId: session.user.id, type: "redeemed" },
        _sum: { points: true },
      }),
      prisma.loyaltyPoint.aggregate({
        where: { userId: session.user.id, type: "reversed" },
        _sum: { points: true },
      }),
    ]);

    const balance =
      (totalEarned._sum.points || 0) -
      (totalRedeemed._sum.points || 0) -
      (totalReversed._sum.points || 0);
    const tier = membership?.tier || "BRONZE";
    const totalSpent = membership ? Number(membership.totalSpent) : 0;
    const next = nextTier(tier);

    return NextResponse.json({
      balance,
      tier,
      totalSpent,
      totalEarned: totalEarned._sum.points || 0,
      nextTier: next ? { tier: next.tier, pointsRequired: next.points } : null,
      history: pointsHistory.map((p) => ({
        id: p.id,
        points: p.points,
        type: p.type,
        reference: p.reference,
        note: p.note,
        expiresAt: p.expiresAt?.toISOString() || null,
        createdAt: p.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Fetch loyalty error:", error);
    return NextResponse.json({ error: "Failed to fetch loyalty data" }, { status: 500 });
  }
}
