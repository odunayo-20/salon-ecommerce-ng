import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true";
    }
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { bio: { contains: search, mode: "insensitive" } },
      ];
    }

    const stylists = await prisma.stylistProfile.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, image: true, phone: true } },
        services: {
          include: { service: { select: { id: true, name: true, slug: true, price: true, duration: true } } },
        },
        _count: { select: { appointments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const stylistsClean = stylists.map((s) => ({
      ...s,
      specialties: JSON.parse(s.specialties || "[]") as string[],
      portfolio: JSON.parse(s.portfolio || "[]") as string[],
      schedule: JSON.parse(s.schedule || "{}") as Record<string, unknown>,
      services: s.services.map((ss) => ({
        ...ss,
        service: { ...ss.service, price: Number(ss.service.price) },
      })),
      appointmentCount: s._count.appointments,
    }));

    return NextResponse.json({ stylists: stylistsClean });
  } catch (error) {
    console.error("Failed to fetch stylists:", error);
    return NextResponse.json({ error: "Failed to fetch stylists" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, bio, specialties, experience, serviceIds } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        role: "STYLIST",
      },
    });

    const stylistProfile = await prisma.stylistProfile.create({
      data: {
        userId: user.id,
        bio: bio || null,
        specialties: JSON.stringify(specialties || []),
        experience: experience || 0,
      },
    });

    if (serviceIds && serviceIds.length > 0) {
      await prisma.stylistService.createMany({
        data: serviceIds.map((serviceId: string) => ({
          stylistId: stylistProfile.id,
          serviceId,
        })),
      });
    }

    const result = await prisma.stylistProfile.findUnique({
      where: { id: stylistProfile.id },
      include: {
        user: { select: { id: true, name: true, email: true, image: true, phone: true } },
        services: { include: { service: { select: { id: true, name: true, slug: true, price: true, duration: true } } } },
        _count: { select: { appointments: true } },
      },
    });

    return NextResponse.json({ stylist: result }, { status: 201 });
  } catch (error) {
    console.error("Failed to create stylist:", error);
    return NextResponse.json({ error: "Failed to create stylist" }, { status: 500 });
  }
}
