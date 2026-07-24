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
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const granularity = searchParams.get("granularity") || "daily"; // daily, weekly, monthly

    const now = new Date();
    const dateFrom = from ? new Date(from) : new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const dateTo = to ? new Date(to) : now;

    // ─── Revenue time-series ───
    const payments = await prisma.payment.findMany({
      where: { status: "PAID", paidAt: { gte: dateFrom, lte: dateTo } },
      select: { amount: true, paidAt: true, appointmentId: true, orderId: true },
      orderBy: { paidAt: "asc" },
    });

    // ─── Appointment revenue ───
    const appointmentRevenue = payments
      .filter((p) => p.appointmentId)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // ─── Order revenue ───
    const orderRevenue = payments
      .filter((p) => p.orderId)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // ─── Build time-series buckets ───
    const revenueMap = new Map<string, { revenue: number; orders: number; appointments: number }>();
    const bucketFn = (d: Date): string => {
      if (granularity === "monthly") return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (granularity === "weekly") {
        const startOfYear = new Date(d.getFullYear(), 0, 1);
        const weekNum = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
        return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
      }
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    };

    for (const p of payments) {
      const key = p.paidAt ? bucketFn(new Date(p.paidAt)) : "unknown";
      const entry = revenueMap.get(key) || { revenue: 0, orders: 0, appointments: 0 };
      entry.revenue += Number(p.amount);
      if (p.orderId) entry.orders++;
      if (p.appointmentId) entry.appointments++;
      revenueMap.set(key, entry);
    }

    const timeSeries = Array.from(revenueMap.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));

    // ─── Status breakdown ───
    const [orderStatuses, appointmentStatuses] = await Promise.all([
      prisma.order.groupBy({ by: ["status"], _count: true }),
      prisma.appointment.groupBy({ by: ["status"], _count: true }),
    ]);

    // ─── Top products by revenue ───
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { price: true, quantity: true },
      _count: true,
      orderBy: { _sum: { price: "desc" } },
      take: 10,
    });

    const productIds = topProducts.map((p) => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, slug: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const topProductsWithNames = topProducts.map((tp) => ({
      name: productMap.get(tp.productId)?.name || "Unknown",
      slug: productMap.get(tp.productId)?.slug,
      revenue: Number(tp._sum.price || 0),
      quantity: tp._sum.quantity || 0,
      orders: tp._count,
    }));

    // ─── Top services ───
    const topServices = await prisma.appointment.groupBy({
      by: ["serviceId"],
      _sum: { totalAmount: true },
      _count: true,
      orderBy: { _sum: { totalAmount: "desc" } },
      take: 10,
    });

    const serviceIds = topServices.map((s) => s.serviceId);
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, name: true, slug: true },
    });
    const serviceMap = new Map(services.map((s) => [s.id, s]));

    const topServicesWithNames = topServices.map((ts) => ({
      name: serviceMap.get(ts.serviceId)?.name || "Unknown",
      revenue: Number(ts._sum.totalAmount || 0),
      bookings: ts._count,
    }));

    // ─── Summary stats ───
    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalOrders = await prisma.order.count({ where: { createdAt: { gte: dateFrom, lte: dateTo } } });
    const totalAppointments = await prisma.appointment.count({ where: { createdAt: { gte: dateFrom, lte: dateTo } } });
    const totalCustomers = await prisma.user.count({ where: { role: "CUSTOMER" } });
    const newCustomers = await prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: dateFrom, lte: dateTo } } });

    return NextResponse.json({
      summary: {
        totalRevenue,
        appointmentRevenue,
        orderRevenue,
        totalOrders,
        totalAppointments,
        totalCustomers,
        newCustomers,
      },
      timeSeries,
      orderStatuses: orderStatuses.map((s) => ({ status: s.status, count: s._count })),
      appointmentStatuses: appointmentStatuses.map((s) => ({ status: s.status, count: s._count })),
      topProducts: topProductsWithNames,
      topServices: topServicesWithNames,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
