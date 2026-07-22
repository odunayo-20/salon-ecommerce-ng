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
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const date = searchParams.get("date");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.date = { gte: start, lte: end };
    }
    if (search) {
      where.OR = [
        { reference: { contains: search, mode: "insensitive" } },
        { customerProfile: { user: { name: { contains: search, mode: "insensitive" } } } },
        { customerProfile: { user: { email: { contains: search, mode: "insensitive" } } } },
        { service: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          service: { select: { id: true, name: true, duration: true, price: true } },
          stylist: { include: { user: { select: { id: true, name: true, image: true } } } },
          customerProfile: { include: { user: { select: { id: true, name: true, email: true, phone: true, image: true } } } },
          payments: true,
        },
        orderBy: [{ date: "desc" }, { startTime: "desc" }],
        skip,
        take: limit,
      }),
      prisma.appointment.count({ where }),
    ]);

    const cleaned = appointments.map((a) => ({
      ...a,
      totalAmount: Number(a.totalAmount),
      depositPaid: Number(a.depositPaid),
    }));

    return NextResponse.json({
      appointments: cleaned,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Admin appointments fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}
