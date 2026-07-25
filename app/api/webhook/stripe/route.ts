import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
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

async function awardLoyaltyPoints(
  userId: string,
  amount: number,
  reference: string,
  note: string
) {
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

  const membership = await prisma.membership.findUnique({
    where: { userId },
  });
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
      data: {
        userId,
        points: newTotal,
        totalSpent: newSpent,
        tier: newTier,
      },
    });
  }

  return points;
}

async function consumeCoupon(
  couponId: string,
  _customerProfileId: string
) {
  await prisma.$transaction(async (tx) => {
    await tx.coupon.update({
      where: { id: couponId },
      data: { usedCount: { increment: 1 } },
    });
  });
}

async function redeemLoyaltyPoints(
  userId: string,
  pointsToRedeem: number,
  orderNumber: string
) {
  if (pointsToRedeem <= 0) return;

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
    const balance =
      (totalEarned._sum.points || 0) -
      (totalRedeemed._sum.points || 0);

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
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    const event = constructWebhookEvent(
      Buffer.from(body),
      signature
    );

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const { orderId, appointmentId, type, paymentId } =
          paymentIntent.metadata || {};

        // Find the payment record
        const payment = paymentId
          ? await prisma.payment.findUnique({ where: { id: paymentId } })
          : await prisma.payment.findFirst({
              where: { reference: paymentIntent.id },
            });

        if (!payment || payment.status === "PAID") {
          return NextResponse.json({ received: true });
        }

        const providerRef = paymentIntent.id;

        if (type === "appointment" && appointmentId) {
          await prisma.$transaction(async (tx) => {
            const lockedPayment = await tx.$queryRaw<
              { id: string; status: string }[]
            >`SELECT id, status FROM "Payment" WHERE id = ${payment.id} FOR UPDATE`;
            if (lockedPayment[0]?.status === "PAID") return;

            await tx.payment.update({
              where: { id: payment.id },
              data: {
                status: "PAID",
                providerRef,
                paidAt: new Date(),
              },
            });

            await tx.appointment.update({
              where: { id: appointmentId },
              data: { status: "CONFIRMED" },
            });
          });

          // Post-transaction notifications
          const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
              service: true,
              stylist: {
                include: { user: { select: { name: true } } },
              },
              customerProfile: {
                include: {
                  user: { select: { id: true, name: true, email: true } },
                },
              },
            },
          });

          if (appointment?.customerProfile?.user?.id) {
            try {
              const earned = await awardLoyaltyPoints(
                appointment.customerProfile.user.id,
                Number(appointment.totalAmount) -
                  Number(appointment.depositPaid),
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
              /* non-critical */
            }

            try {
              await notify({
                userId: appointment.customerProfile.user.id,
                event: "appointment.confirmed",
                data: {
                  customerName:
                    appointment.customerProfile.user.name ||
                    "Valued Client",
                  serviceName: appointment.service.name,
                  stylistName:
                    appointment.stylist?.user.name || undefined,
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
                customerName:
                  appointment.customerProfile.user.name ||
                  "Valued Client",
                serviceName: appointment.service.name,
                date: appointment.date.toLocaleDateString("en-NG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
                time: appointment.startTime,
              });
            } catch {
              /* non-critical */
            }
          }
        } else if (orderId) {
          // Order payment: atomic transaction with RESERVATION → SALE
          await prisma.$transaction(async (tx) => {
            const lockedPayment = await tx.$queryRaw<
              { id: string; status: string }[]
            >`SELECT id, status FROM "Payment" WHERE id = ${payment.id} FOR UPDATE`;
            if (lockedPayment[0]?.status === "PAID") return;

            await tx.payment.update({
              where: { id: payment.id },
              data: {
                status: "PAID",
                providerRef,
                paidAt: new Date(),
              },
            });

            await tx.order.update({
              where: { id: orderId },
              data: { status: "PROCESSING" },
            });

            // Convert RESERVATION → SALE
            const order = await tx.order.findUnique({
              where: { id: orderId },
              select: { orderNumber: true },
            });
            if (order) {
              await tx.stockMovement.updateMany({
                where: {
                  reference: order.orderNumber,
                  type: "RESERVATION",
                },
                data: {
                  type: "SALE",
                  note: `Sold via order ${order.orderNumber}`,
                },
              });
            }
          });

          // Post-transaction: loyalty, coupons, notifications
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
              items: true,
              customerProfile: {
                include: {
                  user: {
                    select: { id: true, name: true, email: true },
                  },
                },
              },
            },
          });

          if (order?.customerProfile?.user?.id) {
            // Consume deferred coupon
            if (order.couponId) {
              try {
                await consumeCoupon(
                  order.couponId,
                  order.customerProfileId
                );
              } catch {
                /* non-critical */
              }
            }

            // Redeem deferred loyalty points
            if (order.pointsRedeemed > 0) {
              try {
                await redeemLoyaltyPoints(
                  order.customerProfile.user.id,
                  order.pointsRedeemed,
                  order.orderNumber
                );
              } catch {
                /* non-critical */
              }
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
            } catch {
              /* non-critical */
            }

            // Notifications
            try {
              await notify({
                userId: order.customerProfile.user.id,
                event: "order.placed",
                data: {
                  customerName:
                    order.customerProfile.user.name ||
                    "Valued Customer",
                  orderNumber: order.orderNumber,
                  items: order.items.map((item) => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: Number(item.price),
                  })),
                  total: Number(order.total),
                  shippingAddress: order.shippingAddress || "",
                },
              });
              await notifyAdmins("order.placed", {
                customerName:
                  order.customerProfile.user.name ||
                  "Valued Customer",
                orderNumber: order.orderNumber,
                total: Number(order.total),
              });
            } catch {
              /* non-critical */
            }
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const failedIntent = event.data.object;
        await prisma.payment.updateMany({
          where: { reference: failedIntent.id },
          data: { status: "FAILED" },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
