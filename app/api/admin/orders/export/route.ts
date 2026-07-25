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

    const where: Record<string, unknown> = {};
    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customerProfile: { user: { name: { contains: search, mode: "insensitive" } } } },
        { customerProfile: { user: { email: { contains: search, mode: "insensitive" } } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        customerProfile: { include: { user: { select: { name: true, email: true, phone: true } } } },
        payments: { select: { method: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const rows = [
      ["Order Number", "Date", "Customer", "Email", "Phone", "Items", "Subtotal", "Shipping", "Discount", "Total", "Payment Method", "Payment Status", "Order Status", "Tracking", "Coupon", "Points Redeemed", "Notes"],
      ...orders.map((o) => [
        o.orderNumber,
        o.createdAt.totoISOString().split("T")[0],
        o.customerProfile?.user?.name || "",
        o.customerProfile?.user?.email || "",
        o.customerProfile?.user?.phone || "",
        o.items.map((i) => `${i.name} x${i.quantity}`).join("; "),
        Number(o.subtotal).toFixed(2),
        Number(o.shippingCost).toFixed(2),
        Number(o.discount).toFixed(2),
        Number(o.total).toFixed(2),
        o.payments[0]?.method || "",
        o.payments[0]?.status || "",
        o.status,
        o.trackingNumber || "",
        o.couponCode || "",
        String(o.pointsRedeemed),
        o.notes || "",
      ]),
    ];

    const csv = rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ).join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("CSV export error:", error);
    return NextResponse.json({ error: "Failed to export orders" }, { status: 500 });
  }
}
