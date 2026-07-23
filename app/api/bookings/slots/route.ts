import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const stylistId = searchParams.get("stylistId");

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const where: Record<string, unknown> = {
      date: { gte: start, lte: end },
      status: { notIn: ["CANCELLED", "NO_SHOW"] },
    };

    if (stylistId) {
      where.stylistId = stylistId;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      select: { startTime: true, endTime: true, stylistId: true },
    });

    // Collect all occupied time slots (every 30-min slot that overlaps any appointment)
    const occupied: { startTime: string; endTime: string; stylistId: string | null }[] = [];

    for (const apt of appointments) {
      occupied.push({
        startTime: apt.startTime,
        endTime: apt.endTime,
        stylistId: apt.stylistId,
      });
    }

    return NextResponse.json({ occupied });
  } catch (error) {
    console.error("Slots fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
  }
}
