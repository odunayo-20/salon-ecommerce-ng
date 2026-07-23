import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
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

    // Verify ownership
    const userId = session.user.id;
    const ownerEmail =
      payment.appointment?.customerProfile?.user?.email ||
      payment.order?.customerProfile?.user?.email;
    const ownerUserId =
      payment.appointment?.customerProfile?.userId ||
      payment.order?.customerProfile?.userId;

    if (ownerUserId !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (payment.status !== "PAID") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const customerName =
      payment.appointment?.customerProfile?.user?.name ||
      payment.order?.customerProfile?.user?.name ||
      "Customer";

    // Calculate total paid for this appointment/order
    let totalAmount = 0;
    let totalPaid = 0;
    let serviceName = "";
    let stylistName = "";
    let date = "";
    let time = "";
    let bookingRef = "";
    let paymentHistory: { id: string; amount: number; status: string; reference: string; paidAt: string | null; createdAt: string }[] = [];

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
        id: p.id,
        amount: Number(p.amount),
        status: p.status,
        reference: p.reference,
        paidAt: p.paidAt?.toISOString() || null,
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
        id: p.id,
        amount: Number(p.amount),
        status: p.status,
        reference: p.reference,
        paidAt: p.paidAt?.toISOString() || null,
        createdAt: p.createdAt.toISOString(),
      }));
      totalPaid = allPayments.filter((p) => p.status === "PAID").reduce((sum, p) => sum + Number(p.amount), 0);
    }

    return NextResponse.json({
      receipt: {
        paymentId: payment.id,
        reference: payment.reference,
        amount: Number(payment.amount),
        totalAmount,
        totalPaid,
        remaining: Math.max(totalAmount - totalPaid, 0),
        isFullyPaid: totalPaid >= totalAmount,
        paidAt: payment.paidAt?.toISOString() || payment.createdAt.toISOString(),
        customerName,
        serviceName,
        stylistName,
        date,
        time,
        bookingRef,
        paymentHistory,
      },
    });
  } catch (error) {
    console.error("Receipt error:", error);
    return NextResponse.json({ error: "Failed to generate receipt" }, { status: 500 });
  }
}
