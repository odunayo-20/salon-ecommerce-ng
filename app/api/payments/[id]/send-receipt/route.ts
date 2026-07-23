import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendEmail, paymentReceiptEmail } from "@/lib/resend";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            service: true,
            stylist: { include: { user: { select: { name: true } } } },
            customerProfile: { include: { user: { select: { name: true, email: true } } } },
          },
        },
        order: {
          include: {
            items: true,
            customerProfile: { include: { user: { select: { name: true, email: true } } } },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status !== "PAID") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const customerEmail =
      payment.appointment?.customerProfile?.user?.email ||
      payment.order?.customerProfile?.user?.email;

    if (!customerEmail) {
      return NextResponse.json({ error: "Customer email not found" }, { status: 400 });
    }

    const customerName =
      payment.appointment?.customerProfile?.user?.name ||
      payment.order?.customerProfile?.user?.name ||
      "Customer";

    let totalAmount = 0;
    let totalPaid = 0;
    let serviceName = "";
    let stylistName = "";
    let date = "";
    let time = "";
    let bookingRef = "";
    let paymentHistory: Array<{ amount: number; status: string; createdAt: string }> = [];

    if (payment.appointment) {
      const apt = payment.appointment;
      totalAmount = Number(apt.totalAmount);
      bookingRef = apt.reference;
      serviceName = apt.service.name;
      stylistName = apt.stylist?.user?.name || "";
      date = new Date(apt.date).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" });
      time = apt.startTime;

      const allPayments = await prisma.payment.findMany({
        where: { appointmentId: apt.id },
        orderBy: { createdAt: "asc" },
      });
      paymentHistory = allPayments.map((p) => ({
        amount: Number(p.amount),
        status: p.status,
        createdAt: p.createdAt.toISOString(),
      }));
      totalPaid = allPayments.filter((p) => p.status === "PAID").reduce((sum, p) => sum + Number(p.amount), 0);
    } else if (payment.order) {
      const order = payment.order;
      totalAmount = Number(order.total);
      bookingRef = order.orderNumber;
      serviceName = order.items.map((i) => i.name).join(", ");
      date = new Date(order.createdAt).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" });

      const allPayments = await prisma.payment.findMany({
        where: { orderId: order.id },
        orderBy: { createdAt: "asc" },
      });
      paymentHistory = allPayments.map((p) => ({
        amount: Number(p.amount),
        status: p.status,
        createdAt: p.createdAt.toISOString(),
      }));
      totalPaid = allPayments.filter((p) => p.status === "PAID").reduce((sum, p) => sum + Number(p.amount), 0);
    }

    const receiptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/receipt/${payment.id}`;

    const result = await sendEmail({
      to: customerEmail,
      subject: `Payment Receipt — ${bookingRef}`,
      html: paymentReceiptEmail({
        customerName,
        serviceName,
        stylistName: stylistName || undefined,
        date,
        time,
        totalAmount,
        amountPaid: totalPaid,
        remaining: Math.max(totalAmount - totalPaid, 0),
        paymentReference: payment.reference,
        paidAt: payment.paidAt
          ? new Date(payment.paidAt).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
          : new Date().toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        bookingReference: bookingRef,
        receiptUrl,
        paymentHistory,
      }),
    });

    if (result?.error) {
      console.error("Resend error:", result.error);
      return NextResponse.json({ error: "Email failed: " + (result.error.message || JSON.stringify(result.error)) }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Receipt sent to " + customerEmail });
  } catch (error) {
    console.error("Send receipt error:", error);
    return NextResponse.json({ error: "Failed to send receipt" }, { status: 500 });
  }
}
