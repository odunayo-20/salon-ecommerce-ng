import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { initializeTransaction } from "@/lib/paystack";
import { paymentLimiter } from "@/lib/rate-limit";

function generateRef() {
  return `PAY-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
}

export async function POST(request: NextRequest) {
  try {
    const rl = await paymentLimiter(request);
    if (!rl.success) return rl.response;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { paymentId, orderId, appointmentId, amount: bodyAmount, method } = body;

    let payment;

    if (paymentId) {
      payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          order: { include: { customerProfile: { include: { user: { select: { name: true, email: true, phone: true } } } } } },
          appointment: { include: { customerProfile: { include: { user: { select: { name: true, email: true, phone: true } } } } } },
        },
      });
      if (!payment) {
        return NextResponse.json({ error: "Payment not found" }, { status: 404 });
      }
      if (payment.status === "PAID") {
        return NextResponse.json({ error: "Payment already completed" }, { status: 400 });
      }
    } else if (appointmentId) {
      const apt = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { customerProfile: { include: { user: { select: { name: true, email: true, phone: true } } } }, payments: true },
      });
      if (!apt) {
        return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
      }
      const existingPending = apt.payments.find((p) => p.status === "PENDING");
      if (existingPending) {
        payment = await prisma.payment.findUnique({
          where: { id: existingPending.id },
          include: {
            order: { include: { customerProfile: { include: { user: { select: { name: true, email: true, phone: true } } } } } },
            appointment: { include: { customerProfile: { include: { user: { select: { name: true, email: true, phone: true } } } } } },
          },
        });
      } else {
        const totalPaid = apt.payments.filter((p) => p.status === "PAID").reduce((sum, p) => sum + Number(p.amount), 0);
        const remaining = Number(apt.totalAmount) - totalPaid;
        if (remaining <= 0) {
          return NextResponse.json({ error: "Appointment already fully paid" }, { status: 400 });
        }
        const ref = generateRef();
        payment = await prisma.payment.create({
          data: {
            appointmentId: apt.id,
            amount: remaining,
            method: "PAYSTACK",
            status: "PENDING",
            reference: ref,
          },
          include: {
            order: { include: { customerProfile: { include: { user: { select: { name: true, email: true, phone: true } } } } } },
            appointment: { include: { customerProfile: { include: { user: { select: { name: true, email: true, phone: true } } } } } },
          },
        });
      }
    } else {
      return NextResponse.json({ error: "Payment ID or Appointment ID is required" }, { status: 400 });
    }

    const amount = Number(payment!.amount);
    const email = payment!.order?.customerProfile?.user?.email || payment!.appointment?.customerProfile?.user?.email || session.user.email;
    const name = payment!.order?.customerProfile?.user?.name || payment!.appointment?.customerProfile?.user?.name || session.user.name;
    const phone = payment!.order?.customerProfile?.user?.phone || payment!.appointment?.customerProfile?.user?.phone || undefined;

    const redirectUrl = orderId
      ? `${process.env.NEXT_PUBLIC_APP_URL}/shop/payment/callback?orderId=${orderId}&paymentId=${payment!.id}`
      : payment!.appointmentId
      ? `${process.env.NEXT_PUBLIC_APP_URL}/book/payment/callback?appointmentId=${payment!.appointmentId}&paymentId=${payment!.id}`
      : `${process.env.NEXT_PUBLIC_APP_URL}/shop/payment/callback?paymentId=${payment!.id}`;

    let response = await initializeTransaction({
      amount,
      email: email || "",
      name: name || undefined,
      phone,
      reference: payment!.reference,
      callbackUrl: redirectUrl,
      metadata: { paymentId: payment!.id, orderId: orderId || undefined, appointmentId: payment!.appointmentId || undefined },
    });

    if (!response.status && response.code === "duplicate_reference") {
      const newRef = generateRef();
      await prisma.payment.update({ where: { id: payment!.id }, data: { reference: newRef } });
      response = await initializeTransaction({
        amount,
        email: email || "",
        name: name || undefined,
        phone,
        reference: newRef,
        callbackUrl: redirectUrl,
        metadata: { paymentId: payment!.id, orderId: orderId || undefined, appointmentId: payment!.appointmentId || undefined },
      });
    }

    if (response.status) {
      return NextResponse.json({
        checkoutUrl: response.data?.authorization_url,
        reference: payment!.reference,
      });
    }

    console.error("Paystack init error:", response);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate payment" },
      { status: 500 }
    );
  }
}
