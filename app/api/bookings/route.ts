import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateBookingReference } from "@/utils/helpers";
import { sendEmail, appointmentPlacedEmail } from "@/lib/resend";
import { z } from "zod";

const bookingSchema = z.object({
  serviceId: z.string(),
  stylistId: z.string().optional(),
  date: z.string(),
  startTime: z.string(),
  notes: z.string().optional(),
  paymentMethod: z.enum(["deposit", "full", "later"]),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = bookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Check for conflicting appointments
    const startHour = parseInt(data.startTime.split(":")[0]);
    const startMin = parseInt(data.startTime.split(":")[1]);
    const endMinutes = startHour * 60 + startMin + service.duration;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;
    const endTime = `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`;

    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        date: new Date(data.date),
        stylistId: data.stylistId || undefined,
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
        OR: [
          {
            startTime: { lte: data.startTime },
            endTime: { gt: data.startTime },
          },
          {
            startTime: { lt: endTime },
            endTime: { gte: endTime },
          },
        ],
      },
    });

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: "This time slot is no longer available. Please choose a different time." },
        { status: 409 }
      );
    }

    let customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!customerProfile) {
      customerProfile = await prisma.customerProfile.create({
        data: { userId: session.user.id },
      });
    }

    const totalAmount = Number(service.price);
    const depositPaid =
      data.paymentMethod === "deposit"
        ? Number(service.depositAmount || 0) || totalAmount * 0.3
        : data.paymentMethod === "full"
        ? totalAmount
        : 0;

    const appointment = await prisma.appointment.create({
      data: {
        reference: generateBookingReference(),
        customerProfileId: customerProfile.id,
        serviceId: data.serviceId,
        stylistId: data.stylistId || null,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime,
        totalAmount,
        depositPaid,
        notes: data.notes,
        status: depositPaid > 0 ? "CONFIRMED" : "PENDING",
      },
      include: {
        service: true,
        stylist: {
          include: { user: true },
        },
      },
    });

    // Create payment record if online payment is required
    let paymentId: string | null = null;
    if (data.paymentMethod === "deposit" || data.paymentMethod === "full") {
      const paymentRef = `PAY-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      const payment = await prisma.payment.create({
        data: {
          appointmentId: appointment.id,
          amount: depositPaid,
          method: "PAYSTACK",
          status: "PENDING",
          reference: paymentRef,
        },
      });
      paymentId = payment.id;
    }

    // Send booking placed email
    try {
      await sendEmail({
        to: session.user.email!,
        subject: `Booking Received — ${appointment.reference}`,
        html: appointmentPlacedEmail({
          customerName: session.user.name || "Valued Client",
          serviceName: appointment.service.name,
          stylistName: appointment.stylist?.user.name || undefined,
          date: new Date(data.date).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          time: data.startTime,
          totalAmount: Number(totalAmount),
          depositPaid: Number(depositPaid),
          reference: appointment.reference,
        }),
      });
    } catch {
      // Email failure shouldn't block booking
    }

    return NextResponse.json({ appointment, paymentId }, { status: 201 });
  } catch (error) {
    console.error("Booking creation error:", error);
    const message = error instanceof Error ? error.message : "Failed to create booking";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!customerProfile) {
      return NextResponse.json({ appointments: [] });
    }

    const appointments = await prisma.appointment.findMany({
      where: { customerProfileId: customerProfile.id },
      include: {
        service: true,
        stylist: { include: { user: { select: { name: true } } } },
        payments: { select: { id: true, amount: true, status: true, method: true, reference: true } },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({
      appointments: appointments.map((a) => {
        const total = Number(a.totalAmount);
        const paid = a.payments
          .filter((p) => p.status === "PAID")
          .reduce((sum, p) => sum + Number(p.amount), 0);
        const remaining = Math.max(total - paid, 0);
        const isFullyPaid = Math.round(paid * 100) >= Math.round(total * 100);
        const hasPending = a.payments.some((p) => p.status === "PENDING");
        return {
          ...a,
          totalAmount: total,
          depositPaid: Number(a.depositPaid),
          payments: a.payments.map((p) => ({ ...p, amount: Number(p.amount) })),
          isFullyPaid,
          remaining,
          hasPending,
        };
      }),
    });
  } catch (error) {
    console.error("Fetch appointments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
