import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const stylistId = searchParams.get("stylistId");

    if (!stylistId) {
      const stylists = await prisma.stylistProfile.findMany({
        where: { isActive: true },
        include: { user: { select: { name: true } } },
        orderBy: { user: { name: "asc" } },
      });
      return NextResponse.json({
        stylists: stylists.map((s) => ({ id: s.id, name: s.user.name })),
      });
    }

    const availability = await prisma.availability.findMany({
      where: { stylistId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    const blockedTimes = await prisma.blockedTime.findMany({
      where: {
        stylistId,
        date: { gte: new Date() },
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({
      availability: availability.map((a) => ({
        id: a.id,
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
        isBreak: a.isBreak,
      })),
      blockedTimes: blockedTimes.map((b) => ({
        id: b.id,
        date: b.date.toISOString().split("T")[0],
        startTime: b.startTime,
        endTime: b.endTime,
        reason: b.reason,
      })),
    });
  } catch (error) {
    console.error("Schedule fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { stylistId, action } = body;

    if (!stylistId) {
      return NextResponse.json({ error: "Stylist ID is required" }, { status: 400 });
    }

    if (action === "saveAvailability") {
      const { availability } = body;
      if (!Array.isArray(availability)) {
        return NextResponse.json({ error: "Availability array is required" }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        await tx.availability.deleteMany({ where: { stylistId } });
        if (availability.length > 0) {
          await tx.availability.createMany({
            data: availability.map((a: { dayOfWeek: number; startTime: string; endTime: string; isBreak?: boolean }) => ({
              stylistId,
              dayOfWeek: a.dayOfWeek,
              startTime: a.startTime,
              endTime: a.endTime,
              isBreak: a.isBreak || false,
            })),
          });
        }
      });

      return NextResponse.json({ success: true, message: "Availability saved" });
    }

    if (action === "addBlockedTime") {
      const { date, startTime, endTime, reason } = body;
      if (!date) {
        return NextResponse.json({ error: "Date is required" }, { status: 400 });
      }

      const blocked = await prisma.blockedTime.create({
        data: {
          stylistId,
          date: new Date(date),
          startTime: startTime || null,
          endTime: endTime || null,
          reason: reason || null,
        },
      });

      return NextResponse.json({
        blocked: {
          id: blocked.id,
          date: blocked.date.toISOString().split("T")[0],
          startTime: blocked.startTime,
          endTime: blocked.endTime,
          reason: blocked.reason,
        },
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Schedule save error:", error);
    return NextResponse.json({ error: "Failed to save schedule" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id || !type) {
      return NextResponse.json({ error: "ID and type are required" }, { status: 400 });
    }

    if (type === "blockedTime") {
      await prisma.blockedTime.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Schedule delete error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
