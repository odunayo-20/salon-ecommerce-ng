import { NextRequest, NextResponse } from "next/server";
import { verifyTransaction, verifyWebhookSignature } from "@/lib/paystack";
import { prisma } from "@/lib/prisma";
import { notify, notifyAdmins } from "@/lib/notifications";
import { releaseReservation } from "@/lib/orders";
import { redeemLoyaltyPoints } from "@/lib/loyalty";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const body = JSON.parse(rawBody);
    const { event, data } = body;

    if (event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    if (!data?.reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    const verification = await verifyTransaction(data.reference);

    if (verification.status && verification.data?.status === "success") {
      const ref = verification.data.reference;
      const providerRef = String(verification.data.id || "");

      const payment = await prisma.payment.findFirst({
        where: { reference: ref },
      });

      if (!payment) {
        return NextResponse.json({ error: "Payment not found" }, { status: 404 });
      }

      if (payment.status === "PAID") {
        return NextResponse.json({ success: true, message: "Already processed" });
      }

      // ── Atomically confirm payment + convert reservation → sale ──
      await prisma.$transaction(async (tx) => {
        // Lock the payment row
        const lockedPayment = await tx.$queryRaw<{ id: string; status: string }[]>`
          SELECT id, status FROM "Payment"
          WHERE id = ${payment.id}
          FOR UPDATE
        `;
        if (lockedPayment[0]?.status === "PAID") return;

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
          const order = await tx.order.findUnique({
            where: { id: payment.orderId },
            select: { orderNumber: true, status: true },
          });

          if (order?.status === "PENDING") {
            await tx.order.update({
              where: { id: payment.orderId },
              data: { status: "PROCESSING" },
            });

            if (order) {
              await tx.stockMovement.updateMany({
                where: { reference: order.orderNumber, type: "RESERVATION" },
                data: { type: "SALE", note: `Sold via order ${order.orderNumber}` },
              });
            }
          } else if (order?.status === "CANCELLED") {
            console.warn(`[Paystack Webhook] Payment for expired order ${order.orderNumber} — stock already released. Marking for manual review.`);
          }
        }
      });

      // ── Post-transaction: notifications, loyalty, coupons ────────
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
              await prisma.coupon.update({
                where: { id: order.couponId },
                data: { usedCount: { increment: 1 } },
              });
            } catch { /* non-critical */ }
          }

          // Redeem deferred loyalty points
          if (order.pointsRedeemed > 0) {
            try {
              await redeemLoyaltyPoints(
                order.customerProfile.user.id,
                order.pointsRedeemed,
                order.orderNumber,
                `Redeemed for order ${order.orderNumber}`
              );
            } catch { /* non-critical */ }
          }

          try {
            await notify({
              userId: order.customerProfile.user.id,
              event: "order.placed",
              data: {
                customerName: order.customerProfile.user.name || "Valued Customer",
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
              customerName: order.customerProfile.user.name || "Valued Customer",
              orderNumber: order.orderNumber,
              total: Number(order.total),
            });
          } catch { /* non-critical */ }
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Payment not successful" }, { status: 400 });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
