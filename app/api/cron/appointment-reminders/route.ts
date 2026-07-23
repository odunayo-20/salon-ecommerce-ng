import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";

function buildAppointmentDateTime(date: Date, startTime: string): Date {
  const dateStr = date.toISOString().split("T")[0];
  return new Date(`${dateStr}T${startTime}:00`);
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results = { reminder24h: 0, reminder1h: 0, errors: 0 };

  try {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(now);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const appointments = await prisma.appointment.findMany({
      where: {
        status: "CONFIRMED",
        date: {
          gte: new Date(now.toISOString().split("T")[0]),
          lte: dayAfterTomorrow,
        },
      },
      include: {
        service: { select: { name: true } },
        stylist: { select: { user: { select: { name: true } } } },
        customerProfile: { select: { user: { select: { id: true, name: true } } } },
      },
    });

    for (const apt of appointments) {
      const aptDateTime = buildAppointmentDateTime(apt.date, apt.startTime);
      const diffMs = aptDateTime.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      const diffMinutes = diffMs / (1000 * 60);

      const userId = apt.customerProfile.user.id;
      const baseData = {
        customerName: apt.customerProfile.user.name || "Valued Customer",
        serviceName: apt.service.name,
        stylistName: apt.stylist?.user?.name,
        date: formatDate(apt.date),
        time: apt.startTime,
        reference: apt.reference,
      };

      // 24h reminder: between 23 and 25 hours away
      if (diffHours >= 23 && diffHours <= 25 && !apt.reminder24hSent) {
        try {
          await notify({
            userId,
            event: "appointment.reminder.24h",
            data: { ...baseData, hoursUntil: 24 },
          });
          await prisma.appointment.update({
            where: { id: apt.id },
            data: { reminder24hSent: true },
          });
          results.reminder24h++;
        } catch (err) {
          console.error(`[Cron] Failed to send 24h reminder for ${apt.reference}:`, err);
          results.errors++;
        }
      }

      // 1h reminder: between 50 and 70 minutes away
      if (diffMinutes >= 50 && diffMinutes <= 70 && !apt.reminder1hSent) {
        try {
          await notify({
            userId,
            event: "appointment.reminder.1h",
            data: { ...baseData, hoursUntil: 1 },
          });
          await prisma.appointment.update({
            where: { id: apt.id },
            data: { reminder1hSent: true },
          });
          results.reminder1h++;
        } catch (err) {
          console.error(`[Cron] Failed to send 1h reminder for ${apt.reference}:`, err);
          results.errors++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      checked: appointments.length,
      ...results,
    });
  } catch (error) {
    console.error("[Cron] Appointment reminders error:", error);
    return NextResponse.json(
      { error: "Failed to process reminders" },
      { status: 500 }
    );
  }
}
