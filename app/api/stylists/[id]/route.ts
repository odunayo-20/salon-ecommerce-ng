import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const stylist = await prisma.stylistProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, image: true, phone: true } },
        services: {
          include: { service: { select: { id: true, name: true, slug: true, price: true, duration: true } } },
        },
        availability: true,
        _count: { select: { appointments: true } },
      },
    });

    if (!stylist) {
      return NextResponse.json({ error: "Stylist not found" }, { status: 404 });
    }

    return NextResponse.json({
      stylist: {
        ...stylist,
        specialties: JSON.parse(stylist.specialties || "[]"),
        portfolio: JSON.parse(stylist.portfolio || "[]"),
        schedule: JSON.parse(stylist.schedule || "{}"),
        services: stylist.services.map((ss) => ({
          ...ss,
          service: { ...ss.service, price: Number(ss.service.price) },
        })),
        appointmentCount: stylist._count.appointments,
      },
    });
  } catch (error) {
    console.error("Failed to fetch stylist:", error);
    return NextResponse.json({ error: "Failed to fetch stylist" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, bio, specialties, experience, isActive, serviceIds } = body;

    const existing = await prisma.stylistProfile.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Stylist not found" }, { status: 404 });
    }

    if (email && email !== existing.user.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
    }

    if (name || email || phone !== undefined) {
      await prisma.user.update({
        where: { id: existing.userId },
        data: {
          ...(name !== undefined && { name }),
          ...(email !== undefined && { email }),
          ...(phone !== undefined && { phone: phone || null }),
        },
      });
    }

    await prisma.stylistProfile.update({
      where: { id },
      data: {
        ...(bio !== undefined && { bio: bio || null }),
        ...(specialties !== undefined && { specialties: JSON.stringify(specialties) }),
        ...(experience !== undefined && { experience }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    if (serviceIds !== undefined) {
      await prisma.stylistService.deleteMany({ where: { stylistId: id } });
      if (serviceIds.length > 0) {
        await prisma.stylistService.createMany({
          data: serviceIds.map((serviceId: string) => ({
            stylistId: id,
            serviceId,
          })),
        });
      }
    }

    const result = await prisma.stylistProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, image: true, phone: true } },
        services: { include: { service: { select: { id: true, name: true, slug: true, price: true, duration: true } } } },
        _count: { select: { appointments: true } },
      },
    });

    return NextResponse.json({ stylist: result });
  } catch (error) {
    console.error("Failed to update stylist:", error);
    return NextResponse.json({ error: "Failed to update stylist" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.stylistProfile.findUnique({
      where: { id },
      include: { _count: { select: { appointments: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Stylist not found" }, { status: 404 });
    }

    if (existing._count.appointments > 0) {
      return NextResponse.json(
        { error: `Cannot delete — has ${existing._count.appointments} appointments. Deactivate instead.` },
        { status: 409 }
      );
    }

    await prisma.stylistService.deleteMany({ where: { stylistId: id } });
    await prisma.availability.deleteMany({ where: { stylistId: id } });
    await prisma.stylistProfile.delete({ where: { id } });
    await prisma.user.delete({ where: { id: existing.userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete stylist:", error);
    return NextResponse.json({ error: "Failed to delete stylist" }, { status: 500 });
  }
}
