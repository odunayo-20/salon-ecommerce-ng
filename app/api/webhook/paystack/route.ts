import { NextRequest, NextResponse } from "next/server";
import { verifyTransaction, verifyWebhookSignature } from "@/lib/paystack";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";

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

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          providerRef,
          paidAt: new Date(),
        },
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
      } else if (payment.orderId) {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { status: "PROCESSING" },
        });

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

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Payment not successful" }, { status: 400 });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
