import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { verifyTransaction } from "@/lib/paystack";
import { notify } from "@/lib/notifications";

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
      }

      return NextResponse.json({ success: true, message: "Payment confirmed" });
    }

    return NextResponse.json({ success: false, message: "Payment not yet successful" });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
