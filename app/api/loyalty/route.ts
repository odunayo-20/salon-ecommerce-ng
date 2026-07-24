import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const POINTS_PER_Naira = 100; // 1 point per ₦100 spent
const TIER_THRESHOLDS = [
  { tier: "PLATINUM" as const, points: 50000 },
  { tier: "GOLD" as const, points: 15000 },
  { tier: "SILVER" as const, points: 5000 },
  { tier: "BRONZE" as const, points: 0 },
];

function calcTier(points: number) {
  for (const t of TIER_THRESHOLDS) {
    if (points >= t.points) return t.tier;
  }
  return "BRONZE";
}

function nextTier(current: string) {
  const idx = TIER_THRESHOLDS.findIndex((t) => t.tier === current);
  return idx > 0 ? TIER_THRESHOLDS[idx - 1] : null;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [membership, pointsHistory, totalEarned] = await Promise.all([
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
    ]);

    const totalRedeemed = await prisma.loyaltyPoint.aggregate({
      where: { userId: session.user.id, type: "redeemed" },
      _sum: { points: true },
    });

    const balance = (totalEarned._sum.points || 0) - (totalRedeemed._sum.points || 0);
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
