import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { notify, notifyAdmins } from "@/lib/notifications";
import { redeemLoyaltyPoints } from "@/lib/loyalty";

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
            // Consume deferred coupon
            if (appointment.couponId) {
              try {
                await prisma.coupon.update({
                  where: { id: appointment.couponId },
                  data: { usedCount: { increment: 1 } },
                });
              } catch { /* non-critical */ }
            }

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

            const order = await tx.order.findUnique({
              where: { id: orderId },
              select: { orderNumber: true, status: true },
            });

            if (order?.status === "PENDING") {
              await tx.order.update({
                where: { id: orderId },
                data: { status: "PROCESSING" },
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
            } else if (order?.status === "CANCELLED") {
              console.warn(`[Stripe Webhook] Payment for expired order ${order.orderNumber} — stock already released. Marking for manual review.`);
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
