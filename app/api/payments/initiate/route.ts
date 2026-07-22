import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { initializeTransaction } from "@/lib/paystack";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { paymentId, orderId } = body;

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: { include: { customerProfile: { include: { user: { select: { name: true, email: true, phone: true } } } } } },
        appointment: true,
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status === "PAID") {
      return NextResponse.json({ error: "Payment already completed" }, { status: 400 });
    }

    const amount = Number(payment.amount);
    const email = payment.order?.customerProfile?.user?.email || session.user.email;
    const name = payment.order?.customerProfile?.user?.name || session.user.name;
    const phone = payment.order?.customerProfile?.user?.phone || undefined;

    const redirectUrl = orderId
      ? `${process.env.NEXT_PUBLIC_APP_URL}/shop/payment/callback?orderId=${orderId}&paymentId=${paymentId}`
      : `${process.env.NEXT_PUBLIC_APP_URL}/shop/payment/callback?paymentId=${paymentId}`;

    const response = await initializeTransaction({
      amount,
      email: email || "",
      name: name || undefined,
      phone,
      reference: payment.reference,
      callbackUrl: redirectUrl,
      metadata: { paymentId, orderId: orderId || undefined },
    });

    if (response.status) {
      return NextResponse.json({
        checkoutUrl: response.data?.authorization_url,
        reference: payment.reference,
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
