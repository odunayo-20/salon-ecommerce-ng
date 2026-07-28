import { prisma } from "@/lib/prisma";

const POINTS_PER_Naira = 1000;
const TIER_THRESHOLDS = [
  { tier: "PLATINUM" as const, points: 50000 },
  { tier: "GOLD" as const, points: 15000 },
  { tier: "SILVER" as const, points: 5000 },
  { tier: "BRONZE" as const, points: 0 },
];
const POINTS_EXPIRY_MS = 365 * 24 * 60 * 60 * 1000;

export function calcTier(points: number) {
  for (const t of TIER_THRESHOLDS) {
    if (points >= t.points) return t.tier;
  }
  return "BRONZE";
}

export function nextTier(current: string) {
  const idx = TIER_THRESHOLDS.findIndex((t) => t.tier === current);
  return idx > 0 ? TIER_THRESHOLDS[idx - 1] : null;
}

export { POINTS_PER_Naira, TIER_THRESHOLDS };

/** Award loyalty points after order delivery. Returns points awarded. */
export async function awardLoyaltyPoints(
  userId: string,
  amount: number,
  reference: string,
  note: string
): Promise<number> {
  const points = Math.floor(amount / POINTS_PER_Naira);
  if (points <= 0) return 0;

  await prisma.loyaltyPoint.create({
    data: {
      userId,
      points,
      type: "earned",
      reference,
      note,
      expiresAt: new Date(Date.now() + POINTS_EXPIRY_MS),
    },
  });

  const membership = await prisma.membership.findUnique({ where: { userId } });
  const newTotal = (membership?.points || 0) + points;
  const newSpent = Number(membership?.totalSpent || 0) + amount;
  const newTier = calcTier(newTotal);

  if (membership) {
    await prisma.membership.update({
      where: { userId },
      data: { points: newTotal, totalSpent: newSpent, tier: newTier },
    });
  } else {
    await prisma.membership.create({
      data: { userId, points: newTotal, totalSpent: newSpent, tier: newTier },
    });
  }

  return points;
}

/** Reverse earned loyalty points for a cancelled/refunded order. */
export async function reverseLoyaltyPoints(
  userId: string,
  pointsToReverse: number,
  reference: string,
  note: string
): Promise<void> {
  if (pointsToReverse <= 0) return;

  await prisma.loyaltyPoint.create({
    data: {
      userId,
      points: pointsToReverse,
      type: "reversed",
      reference,
      note,
    },
  });

  const membership = await prisma.membership.findUnique({ where: { userId } });
  if (membership) {
    const newTotal = Math.max(0, (membership.points || 0) - pointsToReverse);
    const newTier = calcTier(newTotal);
    await prisma.membership.update({
      where: { userId },
      data: { points: newTotal, tier: newTier },
    });
  }
}

/** Redeem loyalty points (deferred — called on payment success). */
export async function redeemLoyaltyPoints(
  userId: string,
  pointsToRedeem: number,
  reference: string,
  note: string
): Promise<number> {
  if (pointsToRedeem <= 0) return 0;

  const [totalEarned, totalRedeemed] = await Promise.all([
    prisma.loyaltyPoint.aggregate({
      where: { userId, type: "earned" },
      _sum: { points: true },
    }),
    prisma.loyaltyPoint.aggregate({
      where: { userId, type: "redeemed" },
      _sum: { points: true },
    }),
  ]);

  const reversedAgg = await prisma.loyaltyPoint.aggregate({
    where: { userId, type: "reversed" },
    _sum: { points: true },
  });

  const balance =
    (totalEarned._sum.points || 0) -
    (totalRedeemed._sum.points || 0) -
    (reversedAgg._sum.points || 0);

  const effective = Math.min(pointsToRedeem, Math.max(0, balance));
  if (effective <= 0) return 0;

  await prisma.loyaltyPoint.create({
    data: {
      userId,
      points: effective,
      type: "redeemed",
      reference,
      note,
    },
  });

  return effective;
}

/** Get a user's current loyalty balance. */
export async function getLoyaltyBalance(userId: string): Promise<number> {
  const [totalEarned, totalRedeemed, totalReversed] = await Promise.all([
    prisma.loyaltyPoint.aggregate({
      where: { userId, type: "earned" },
      _sum: { points: true },
    }),
    prisma.loyaltyPoint.aggregate({
      where: { userId, type: "redeemed" },
      _sum: { points: true },
    }),
    prisma.loyaltyPoint.aggregate({
      where: { userId, type: "reversed" },
      _sum: { points: true },
    }),
  ]);

  return (
    (totalEarned._sum.points || 0) -
    (totalRedeemed._sum.points || 0) -
    (totalReversed._sum.points || 0)
  );
}
