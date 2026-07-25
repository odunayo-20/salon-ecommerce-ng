import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notify, notifyAdmins } from "@/lib/notifications";
import { z } from "zod";

const rescheduleSchema = z.object({
  date: z.string(),
  startTime: z.string(),
  reason: z.string().optional(),
});

const cancelSchema = z.object({
  reason: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = rescheduleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { date, startTime, reason } = validation.data;

    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!customerProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { service: true, stylist: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (appointment.customerProfileId !== customerProfile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!["PENDING", "CONFIRMED"].includes(appointment.status)) {
      return NextResponse.json(
        { error: "Only pending or confirmed appointments can be rescheduled" },
        { status: 400 }
      );
    }

    // Calculate end time based on service duration
    const startHour = parseInt(startTime.split(":")[0]);
    const startMin = parseInt(startTime.split(":")[1]);
    const endMinutes = startHour * 60 + startMin + appointment.service.duration;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;
    const endTime = `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`;

    // Check for conflicts (excluding this appointment)
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    const conflicting = await prisma.appointment.findFirst({
      where: {
        id: { not: id },
        date: { gte: newDate, lte: dateEnd },
        stylistId: appointment.stylistId,
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
        OR: [
          {
            startTime: { lte: startTime },
            endTime: { gt: startTime },
          },
          {
            startTime: { lt: endTime },
            endTime: { gte: endTime },
          },
        ],
      },
    });

    if (conflicting) {
      return NextResponse.json(
        { error: "This time slot is no longer available. Please choose a different time." },
        { status: 409 }
      );
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        date: newDate,
        startTime,
        endTime,
        isRescheduled: true,
        originalDate: appointment.originalDate ?? appointment.date,
        originalTime: appointment.originalTime ?? appointment.startTime,
      },
      include: {
        service: true,
        stylist: { include: { user: true } },
      },
    });

    try {
      await notify({
        userId: session.user.id,
        event: "appointment.rescheduled",
        data: {
          customerName: session.user.name || "Valued Client",
          serviceName: updated.service.name,
          stylistName: updated.stylist?.user.name || undefined,
          date: newDate.toLocaleDateString("en-NG", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          time: startTime,
          reference: updated.reference,
        },
      });
      await notifyAdmins("appointment.rescheduled", {
        customerName: session.user.name || "Valued Client",
        serviceName: updated.service.name,
        date: newDate.toLocaleDateString("en-NG", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        time: startTime,
      });
    } catch {
      // Notification failure shouldn't block reschedule
    }

    return NextResponse.json({ appointment: updated });
  } catch (error) {
    console.error("Reschedule error:", error);
    const message = error instanceof Error ? error.message : "Failed to reschedule";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = cancelSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!customerProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { service: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (appointment.customerProfileId !== customerProfile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!["PENDING", "CONFIRMED"].includes(appointment.status)) {
      return NextResponse.json(
        { error: "Only pending or confirmed appointments can be cancelled" },
        { status: 400 }
      );
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelReason: validation.data.reason || "Cancelled by customer",
      },
      include: { service: true },
    });

    try {
      await notify({
        userId: session.user.id,
        event: "appointment.cancelled",
        data: {
          customerName: session.user.name || "Valued Client",
          serviceName: updated.service.name,
          date: updated.date.toLocaleDateString("en-NG", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          time: updated.startTime,
          reference: updated.reference,
        },
      });
      await notifyAdmins("appointment.cancelled", {
        customerName: session.user.name || "Valued Client",
        serviceName: updated.service.name,
        date: updated.date.toLocaleDateString("en-NG", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        time: updated.startTime,
      });
    } catch {
      // Notification failure shouldn't block cancellation
    }

    return NextResponse.json({ appointment: updated });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    const message = error instanceof Error ? error.message : "Failed to cancel appointment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
