import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const event = constructWebhookEvent(Buffer.from(body), signature);

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const { orderId, appointmentId, type } = paymentIntent.metadata || {};

        if (type === "appointment" && appointmentId) {
          await prisma.payment.updateMany({
            where: { reference: paymentIntent.id },
            data: {
              status: "PAID",
              paidAt: new Date(),
            },
          });

          const appointment = await prisma.appointment.update({
            where: { id: appointmentId },
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
            } catch {
              // Notification failure — non-critical
            }
          }
        } else if (orderId) {
          await prisma.payment.updateMany({
            where: { reference: paymentIntent.id },
            data: {
              status: "PAID",
              paidAt: new Date(),
            },
          });

          await prisma.order.update({
            where: { id: orderId },
            data: { status: "PROCESSING" },
          });

          // Send order placed notification
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
              items: true,
              customerProfile: {
                include: { user: { select: { id: true, name: true, email: true } } },
              },
            },
          });

          if (order?.customerProfile?.user?.id) {
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
            } catch {
              // Notification failure — non-critical
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
