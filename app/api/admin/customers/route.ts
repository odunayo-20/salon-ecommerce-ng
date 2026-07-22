import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { role: "CUSTOMER" };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        customerProfile: {
          include: {
            orders: { select: { id: true, total: true, status: true } },
            appointments: { select: { id: true, status: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const customers = users.map((u) => {
      const orders = u.customerProfile?.orders || [];
      const appointments = u.customerProfile?.appointments || [];
      const totalSpent = orders.reduce((sum, o) => sum + Number(o.total), 0);
      return {
        id: u.id, name: u.name, email: u.email, phone: u.phone, image: u.image,
        orders: orders.length, spent: totalSpent, appointments: appointments.length,
        joined: u.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ customers });
  } catch (error) {
    console.error("Admin customers error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
