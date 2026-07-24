import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notify, notifyAdmins } from "@/lib/notifications";
import { logAudit, diffObjects } from "@/lib/audit";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        service: true,
        stylist: { include: { user: { select: { id: true, name: true, email: true, phone: true, image: true } } } },
        customerProfile: { include: { user: { select: { id: true, name: true, email: true, phone: true, image: true } } } },
        payments: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({
      appointment: {
        ...appointment,
        totalAmount: Number(appointment.totalAmount),
        depositPaid: Number(appointment.depositPaid),
      },
    });
  } catch (error) {
    console.error("Admin appointment fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch appointment" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, notes, cancelReason } = body;

    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) {
      updateData.status = status.toUpperCase();
      if (status.toUpperCase() === "CANCELLED") {
        updateData.cancelledAt = new Date();
        if (cancelReason) updateData.cancelReason = cancelReason;
      }
    }
    if (notes !== undefined) updateData.notes = notes;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        service: { select: { id: true, name: true, duration: true, price: true } },
        stylist: { include: { user: { select: { id: true, name: true, image: true } } } },
        customerProfile: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      },
    });

    const changes = diffObjects(
      { status: existing.status, notes: existing.notes },
      { status: appointment.status, notes: appointment.notes }
    );
    if (changes) {
      await logAudit({
        userId: session.user.id,
        action: "UPDATE",
        entityType: "APPOINTMENT",
        entityId: id,
        entityName: `${appointment.service.name} (${appointment.reference})`,
        changes,
      });
    }

    // Send lifecycle notifications for COMPLETED / CANCELLED
    if (status && appointment.customerProfile?.user?.id) {
      try {
        const base = {
          customerName: appointment.customerProfile.user.name || "Valued Client",
          serviceName: appointment.service.name,
          stylistName: appointment.stylist?.user.name || undefined,
          date: appointment.date.toLocaleDateString("en-NG", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          reference: appointment.reference,
        };

        if (status.toUpperCase() === "COMPLETED") {
          await notify({
            userId: appointment.customerProfile.user.id,
            event: "appointment.completed",
            data: base,
          });
        } else if (status.toUpperCase() === "CANCELLED") {
          await notify({
            userId: appointment.customerProfile.user.id,
            event: "appointment.cancelled",
            data: { ...base, reason: cancelReason || undefined },
          });
          await notifyAdmins("appointment.cancelled", {
            ...base,
            reason: cancelReason || undefined,
          });
        }
      } catch {
        // Notification failure — non-critical
      }
    }

    return NextResponse.json({
      appointment: {
        ...appointment,
        totalAmount: Number(appointment.totalAmount),
        depositPaid: Number(appointment.depositPaid),
      },
    });
  } catch (error) {
    console.error("Admin appointment update error:", error);
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { date, startTime, stylistId } = body;

    const existing = await prisma.appointment.findUnique({
      where: { id },
      include: { service: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const newDate = date ? new Date(date) : existing.date;
    const newStart = startTime || existing.startTime;
    const newStylistId = stylistId !== undefined ? stylistId : existing.stylistId;

    const startHour = parseInt(newStart.split(":")[0]);
    const startMin = parseInt(newStart.split(":")[1]);
    const endMinutes = startHour * 60 + startMin + existing.service.duration;
    const endTime = `${Math.floor(endMinutes / 60).toString().padStart(2, "0")}:${(endMinutes % 60).toString().padStart(2, "0")}`;

    if (newStylistId) {
      const conflict = await prisma.appointment.findFirst({
        where: {
          id: { not: id },
          stylistId: newStylistId,
          date: newDate,
          status: { notIn: ["CANCELLED", "NO_SHOW"] },
          OR: [
            { startTime: { lte: newStart }, endTime: { gt: newStart } },
            { startTime: { lt: endTime }, endTime: { gte: endTime } },
          ],
        },
      });
      if (conflict) {
        return NextResponse.json({ error: "Time slot conflicts with another appointment" }, { status: 409 });
      }
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        date: newDate,
        startTime: newStart,
        endTime,
        stylistId: newStylistId || null,
        isRescheduled: date !== undefined || startTime !== undefined,
      },
      include: {
        service: { select: { id: true, name: true, duration: true, price: true } },
        stylist: { include: { user: { select: { id: true, name: true, image: true } } } },
        customerProfile: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      },
    });

    return NextResponse.json({
      appointment: {
        ...appointment,
        totalAmount: Number(appointment.totalAmount),
        depositPaid: Number(appointment.depositPaid),
      },
    });
  } catch (error) {
    console.error("Admin appointment reschedule error:", error);
    return NextResponse.json({ error: "Failed to reschedule appointment" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.appointment.findUnique({
      where: { id },
      include: { payments: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (existing.payments.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete appointment with payments. Cancel instead." },
        { status: 409 }
      );
    }

    await prisma.appointment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin appointment delete error:", error);
    return NextResponse.json({ error: "Failed to delete appointment" }, { status: 500 });
  }
}
