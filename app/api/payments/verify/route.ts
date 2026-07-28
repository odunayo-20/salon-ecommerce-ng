import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { verifyTransaction } from "@/lib/paystack";
import { notify, notifyAdmins } from "@/lib/notifications";
import { paymentLimiter } from "@/lib/rate-limit";
import { expireIfOverdue } from "@/lib/orders";

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

/** Convert RESERVATION movements to SALE for an order */
async function convertReservationsToSale(orderNumber: string) {
  await prisma.stockMovement.updateMany({
    where: { reference: orderNumber, type: "RESERVATION" },
    data: { type: "SALE", note: `Sold via order ${orderNumber}` },
  });
}

/** Consume deferred coupon usage */
async function consumeCoupon(couponId: string, customerProfileId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.coupon.update({
      where: { id: couponId },
      data: { usedCount: { increment: 1 } },
    });
  });
}

/** Redeem deferred loyalty points */
async function redeemLoyaltyPoints(
  userId: string,
  pointsToRedeem: number,
  orderNumber: string
) {
  if (pointsToRedeem <= 0) return;

  // Re-check balance within a transaction
  await prisma.$transaction(async (tx) => {
    const [totalEarned, totalRedeemed] = await Promise.all([
      tx.loyaltyPoint.aggregate({
        where: { userId, type: "earned" },
        _sum: { points: true },
      }),
      tx.loyaltyPoint.aggregate({
        where: { userId, type: "redeemed" },
        _sum: { points: true },
      }),
    ]);
    const balance = (totalEarned._sum.points || 0) - (totalRedeemed._sum.points || 0);

    const effectiveRedeemed = Math.min(pointsToRedeem, balance);
    if (effectiveRedeemed > 0) {
      await tx.loyaltyPoint.create({
        data: {
          userId,
          points: effectiveRedeemed,
          type: "redeemed",
          reference: orderNumber,
          note: `Redeemed for order ${orderNumber}`,
        },
      });
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const rl = await paymentLimiter(request);
    if (!rl.success) return rl.response;

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

    if (payment.orderId) {
      const expired = await expireIfOverdue(payment.orderId);
      if (expired) {
        return NextResponse.json({ error: "Order has expired" }, { status: 410 });
      }
    }

    const verification = await verifyTransaction(payment.reference);

    if (verification.status && verification.data?.status === "success") {
      const providerRef = String(verification.data.id || "");

      // ── Atomically confirm payment + convert reservation → sale ──
      await prisma.$transaction(async (tx) => {
        // Lock the payment row
        const lockedPayment = await tx.$queryRaw<{ id: string; status: string }[]>`
          SELECT id, status FROM "Payment"
          WHERE id = ${payment.id}
          FOR UPDATE
        `;
        if (lockedPayment[0]?.status === "PAID") return; // Already processed

        await tx.payment.update({
          where: { id: payment.id },
          data: { status: "PAID", providerRef, paidAt: new Date() },
        });

        if (payment.appointmentId) {
          await tx.appointment.update({
            where: { id: payment.appointmentId },
            data: { status: "CONFIRMED" },
          });
        } else if (payment.orderId) {
          // Mark order as PROCESSING
          await tx.order.update({
            where: { id: payment.orderId },
            data: { status: "PROCESSING" },
          });

          // Convert RESERVATION → SALE
          const order = await tx.order.findUnique({
            where: { id: payment.orderId },
            select: { orderNumber: true },
          });
          if (order) {
            await tx.stockMovement.updateMany({
              where: { reference: order.orderNumber, type: "RESERVATION" },
              data: { type: "SALE", note: `Sold via order ${order.orderNumber}` },
            });
          }
        }
      });

      // ── Post-transaction: loyalty, coupons, notifications ────────
      if (payment.appointmentId) {
        const appointment = await prisma.appointment.findUnique({
          where: { id: payment.appointmentId },
          include: {
            service: true,
            stylist: { include: { user: { select: { name: true } } } },
            customerProfile: {
              include: { user: { select: { id: true, name: true, email: true } } },
            },
          },
        });

        if (appointment?.customerProfile?.user?.id) {
          // Consume deferred coupon
          if (appointment.couponId) {
            try {
              await consumeCoupon(appointment.couponId, appointment.customerProfileId);
            } catch { /* non-critical */ }
          }

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
          } catch { /* non-critical */ }

          try {
            await notify({
              userId: appointment.customerProfile.user.id,
              event: "appointment.confirmed",
              data: {
                customerName: appointment.customerProfile.user.name || "Valued Client",
                serviceName: appointment.service.name,
                stylistName: appointment.stylist?.user.name || undefined,
                date: appointment.date.toLocaleDateString("en-NG", {
                  year: "numeric", month: "long", day: "numeric",
                }),
                time: appointment.startTime,
                reference: appointment.reference,
              },
            });
            await notifyAdmins("appointment.confirmed", {
              customerName: appointment.customerProfile.user.name || "Valued Client",
              serviceName: appointment.service.name,
              date: appointment.date.toLocaleDateString("en-NG", {
                year: "numeric", month: "long", day: "numeric",
              }),
              time: appointment.startTime,
            });
          } catch { /* non-critical */ }
        }
      } else if (payment.orderId) {
        const order = await prisma.order.findUnique({
          where: { id: payment.orderId },
          include: {
            items: true,
            customerProfile: {
              include: { user: { select: { id: true, name: true, email: true } } },
            },
          },
        });

        if (order?.customerProfile?.user?.id) {
          // Consume deferred coupon
          if (order.couponId) {
            try {
              await consumeCoupon(order.couponId, order.customerProfileId);
            } catch { /* non-critical */ }
          }

          // Redeem deferred loyalty points
          if (order.pointsRedeemed > 0) {
            try {
              await redeemLoyaltyPoints(
                order.customerProfile.user.id,
                order.pointsRedeemed,
                order.orderNumber
              );
            } catch { /* non-critical */ }
          }

          // Award earned loyalty points
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
          } catch { /* non-critical */ }
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
