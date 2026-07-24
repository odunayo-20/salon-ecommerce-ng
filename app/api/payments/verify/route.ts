import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { verifyTransaction } from "@/lib/paystack";
import { notify, notifyAdmins } from "@/lib/notifications";

const POINTS_PER_Naira = 100;
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

async function awardLoyaltyPoints(userId: string, amount: number, reference: string, note: string) {
  const points = Math.floor(amount / POINTS_PER_Naira);
  if (points <= 0) return 0;

  await prisma.loyaltyPoint.create({
    data: {
      userId,
      points,
      type: "earned",
      reference,
      note,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
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

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentId } = await request.json();
    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID required" }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status === "PAID") {
      return NextResponse.json({ success: true, message: "Already paid" });
    }

    const verification = await verifyTransaction(payment.reference);

    if (verification.status && verification.data?.status === "success") {
      const providerRef = String(verification.data.id || "");

      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "PAID", providerRef, paidAt: new Date() },
      });

      if (payment.appointmentId) {
        const appointment = await prisma.appointment.update({
          where: { id: payment.appointmentId },
          data: { status: "CONFIRMED" },
          include: {
            service: true,
            stylist: { include: { user: { select: { name: true } } } },
            customerProfile: {
              include: { user: { select: { id: true, name: true, email: true } } },
            },
          },
        });

        if (appointment.customerProfile?.user?.id) {
          try {
            const earned = await awardLoyaltyPoints(
              appointment.customerProfile.user.id,
              Number(appointment.totalAmount) - Number(appointment.depositPaid),
              appointment.reference,
              `Appointment: ${appointment.service.name}`
            );
            if (earned > 0) {
              await prisma.appointment.update({
                where: { id: appointment.id },
                data: { loyaltyPointsEarned: earned },
              });
            }
          } catch {
            // Loyalty failure — non-critical
          }

          try {
            await notify({
              userId: appointment.customerProfile.user.id,
              event: "appointment.confirmed",
              data: {
                customerName: appointment.customerProfile.user.name || "Valued Client",
                serviceName: appointment.service.name,
                stylistName: appointment.stylist?.user.name || undefined,
                date: appointment.date.toLocaleDateString("en-NG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
                time: appointment.startTime,
                reference: appointment.reference,
              },
            });
            await notifyAdmins("appointment.confirmed", {
              customerName: appointment.customerProfile.user.name || "Valued Client",
              serviceName: appointment.service.name,
              date: appointment.date.toLocaleDateString("en-NG", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              time: appointment.startTime,
            });
          } catch {
            // Notification failure — non-critical
          }
        }
      } else if (payment.orderId) {
        const order = await prisma.order.update({
          where: { id: payment.orderId },
          data: { status: "PROCESSING" },
          include: {
            customerProfile: { include: { user: { select: { id: true } } } },
          },
        });

        if (order.customerProfile?.user?.id) {
          try {
            const earned = await awardLoyaltyPoints(
              order.customerProfile.user.id,
              Number(order.total) - order.pointsRedeemed,
              order.orderNumber,
              `Order: ${order.orderNumber}`
            );
            if (earned > 0) {
              await prisma.order.update({
                where: { id: order.id },
                data: { loyaltyPointsEarned: earned },
              });
            }
          } catch {
            // Loyalty failure — non-critical
          }
        }
      }

      return NextResponse.json({ success: true, message: "Payment confirmed" });
    }

    return NextResponse.json({ success: false, message: "Payment not yet successful" });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
