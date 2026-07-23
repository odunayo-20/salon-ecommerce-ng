import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateSlots(start: string, end: string): string[] {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const slots: string[] = [];
  let current = sh * 60 + sm;
  const finish = eh * 60 + em;
  while (current < finish) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    current += 30;
  }
  return slots;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const stylistId = searchParams.get("stylistId");

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const requestDate = new Date(date);
    requestDate.setHours(0, 0, 0, 0);
    const dayOfWeek = requestDate.getDay();

    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    let stylistIds: string[] = [];

    if (stylistId) {
      stylistIds = [stylistId];
    } else {
      const stylists = await prisma.stylistProfile.findMany({
        where: { isActive: true },
        select: { id: true },
      });
      stylistIds = stylists.map((s) => s.id);
    }

    if (stylistIds.length === 0) {
      return NextResponse.json({ slots: [], workingHours: [] });
    }

    const allAvailability = await prisma.availability.findMany({
      where: { stylistId: { in: stylistIds }, dayOfWeek, isBreak: false },
      select: { stylistId: true, startTime: true, endTime: true },
    });

    const allBreaks = await prisma.availability.findMany({
      where: { stylistId: { in: stylistIds }, dayOfWeek, isBreak: true },
      select: { stylistId: true, startTime: true, endTime: true },
    });

    const blockedTimes = await prisma.blockedTime.findMany({
      where: {
        stylistId: { in: stylistIds },
        date: { gte: requestDate, lte: dateEnd },
      },
      select: { stylistId: true, startTime: true, endTime: true, reason: true },
    });

    const appointments = await prisma.appointment.findMany({
      where: {
        date: { gte: requestDate, lte: dateEnd },
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
        stylistId: { in: stylistIds },
      },
      select: { startTime: true, endTime: true, stylistId: true },
    });

    const workingHours: { stylistId: string; start: string; end: string }[] = [];
    const allSlots = new Set<string>();

    for (const sId of stylistIds) {
      const avail = allAvailability.filter((a) => a.stylistId === sId);
      if (avail.length === 0) continue;

      const dayStart = avail.reduce((min, a) => a.startTime < min ? a.startTime : min, "23:59");
      const dayEnd = avail.reduce((max, a) => a.endTime > max ? a.endTime : max, "00:00");
      workingHours.push({ stylistId: sId, start: dayStart, end: dayEnd });

      for (const a of avail) {
        for (const slot of generateSlots(a.startTime, a.endTime)) {
          allSlots.add(slot);
        }
      }
    }

    if (allSlots.size === 0) {
      return NextResponse.json({ slots: [], workingHours });
    }

    const sortedSlots = Array.from(allSlots).sort();

    const breakSlots = new Set<string>();
    for (const b of allBreaks) {
      for (const slot of generateSlots(b.startTime, b.endTime)) {
        breakSlots.add(slot);
      }
    }

    const blockedFullDay = new Set<string>();
    const blockedPartial = new Map<string, { start: string; end: string; reason: string | null }[]>();
    for (const bt of blockedTimes) {
      if (!bt.startTime && !bt.endTime) {
        blockedFullDay.add(bt.stylistId);
      } else if (bt.startTime && bt.endTime) {
        const key = bt.stylistId;
        if (!blockedPartial.has(key)) blockedPartial.set(key, []);
        blockedPartial.get(key)!.push({ start: bt.startTime, end: bt.endTime, reason: bt.reason });
      }
    }

    const slots = sortedSlots.map((time) => {
      const [h, m] = time.split(":").map(Number);
      const slotStart = h * 60 + m;
      const slotEnd = slotStart + 30;

      if (breakSlots.has(time)) {
        return { time, available: false, reason: "break" };
      }

      const isOccupied = appointments.some((apt) => {
        const [ah, am] = apt.startTime.split(":").map(Number);
        const [eh, em] = apt.endTime.split(":").map(Number);
        const aptStart = ah * 60 + am;
        const aptEnd = eh * 60 + em;
        return slotStart < aptEnd && slotEnd > aptStart;
      });

      if (isOccupied) {
        return { time, available: false, reason: "booked" };
      }

      const isBlocked = blockedTimes.some((bt) => {
        if (blockedFullDay.has(bt.stylistId)) return true;
        if (bt.startTime && bt.endTime) {
          const [bsh, bsm] = bt.startTime.split(":").map(Number);
          const [beh, bem] = bt.endTime.split(":").map(Number);
          const bStart = bsh * 60 + bsm;
          const bEnd = beh * 60 + bem;
          return slotStart < bEnd && slotEnd > bStart;
        }
        return false;
      });

      if (isBlocked) {
        return { time, available: false, reason: "blocked" };
      }

      return { time, available: true, reason: null };
    });

    return NextResponse.json({ slots, workingHours });
  } catch (error) {
    console.error("Slots fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
  }
}
