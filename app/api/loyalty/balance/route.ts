import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [totalEarned, totalRedeemed] = await Promise.all([
      prisma.loyaltyPoint.aggregate({
        where: { userId: session.user.id, type: "earned" },
        _sum: { points: true },
      }),
      prisma.loyaltyPoint.aggregate({
        where: { userId: session.user.id, type: "redeemed" },
        _sum: { points: true },
      }),
    ]);

    const balance = (totalEarned._sum.points || 0) - (totalRedeemed._sum.points || 0);

    return NextResponse.json({ balance });
  } catch (error) {
    console.error("Fetch loyalty balance error:", error);
    return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 });
  }
}
