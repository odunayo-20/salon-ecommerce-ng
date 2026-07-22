import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalAppointments,
      monthAppointments,
      lastMonthAppointments,
      totalCustomers,
      monthCustomers,
      lastMonthCustomers,
      totalServices,
      totalStylists,
      recentAppointments,
      statusCounts,
      popularServices,
      monthlyRevenue,
      lastMonthRevenue,
    ] = await Promise.all([
      prisma.appointment.count(),
      prisma.appointment.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.appointment.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: startOfMonth } } }),
      prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      prisma.service.count({ where: { isActive: true } }),
      prisma.stylistProfile.count({ where: { isActive: true } }),
      prisma.appointment.findMany({
        take: 5,
        orderBy: [{ date: "desc" }, { startTime: "desc" }],
        include: {
          service: { select: { name: true } },
          stylist: { include: { user: { select: { name: true } } } },
          customerProfile: { include: { user: { select: { name: true } } } },
        },
      }),
      prisma.appointment.groupBy({ by: ["status"], _count: true }),
      prisma.appointment.groupBy({
        by: ["serviceId"],
        _count: true,
        orderBy: { _count: { serviceId: "desc" } },
        take: 5,
      }),
      prisma.appointment.aggregate({ _sum: { totalAmount: true }, where: { createdAt: { gte: startOfMonth }, status: { notIn: ["CANCELLED"] } } }),
      prisma.appointment.aggregate({ _sum: { totalAmount: true }, where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth }, status: { notIn: ["CANCELLED"] } } }),
    ]);

    const serviceIds = popularServices.map((ps) => ps.serviceId);
    const services = await prisma.service.findMany({ where: { id: { in: serviceIds } }, select: { id: true, name: true } });
    const serviceMap = new Map(services.map((s) => [s.id, s.name]));

    const apptChange = lastMonthAppointments > 0 ? Math.round(((monthAppointments - lastMonthAppointments) / lastMonthAppointments) * 100) : 0;
    const custChange = lastMonthCustomers > 0 ? Math.round(((monthCustomers - lastMonthCustomers) / lastMonthCustomers) * 100) : 0;
    const thisRevenue = Number(monthlyRevenue._sum.totalAmount || 0);
    const lastRevenue = Number(lastMonthRevenue._sum.totalAmount || 0);
    const revChange = lastRevenue > 0 ? Math.round(((thisRevenue - lastRevenue) / lastRevenue) * 100) : 0;

    const statusMap: Record<string, number> = {};
    statusCounts.forEach((sc) => { statusMap[sc.status] = sc._count; });

    return NextResponse.json({
      stats: {
        appointments: { total: totalAppointments, month: monthAppointments, change: apptChange },
        customers: { total: totalCustomers, month: monthCustomers, change: custChange },
        revenue: { month: thisRevenue, change: revChange },
        services: totalServices,
        stylists: totalStylists,
        statusCounts: statusMap,
      },
      recentAppointments: recentAppointments.map((a) => ({
        id: a.id,
        reference: a.reference,
        customer: a.customerProfile.user.name,
        service: a.service.name,
        stylist: a.stylist?.user.name || null,
        time: a.startTime,
        status: a.status,
        date: a.date,
      })),
      popularServices: popularServices.map((ps) => ({
        name: serviceMap.get(ps.serviceId) || "Unknown",
        bookings: ps._count,
      })),
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
