import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        hairProfile: {
          select: {
            id: true,
            hairType: true,
            hairLength: true,
            hairDensity: true,
            scalpCondition: true,
            allergies: true,
            previousStyles: true,
            productsUsed: true,
            notes: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ profile: null });
    }

    return NextResponse.json({
      profile: profile.hairProfile
        ? {
            ...profile.hairProfile,
            previousStyles: JSON.parse(profile.hairProfile.previousStyles || "[]"),
            productsUsed: JSON.parse(profile.hairProfile.productsUsed || "[]"),
          }
        : null,
    });
  } catch (error) {
    console.error("Failed to fetch hair profile:", error);
    return NextResponse.json({ error: "Failed to fetch hair profile" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { hairType, hairLength, hairDensity, scalpCondition, allergies, previousStyles, productsUsed, notes } = body;

    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!customerProfile) {
      return NextResponse.json({ error: "Customer profile not found" }, { status: 404 });
    }

    const hairProfile = await prisma.hairProfile.upsert({
      where: { customerProfileId: customerProfile.id },
      update: {
        hairType: hairType || null,
        hairLength: hairLength || null,
        hairDensity: hairDensity || null,
        scalpCondition: scalpCondition || null,
        allergies: allergies || null,
        previousStyles: previousStyles ? JSON.stringify(previousStyles) : "[]",
        productsUsed: productsUsed ? JSON.stringify(productsUsed) : "[]",
        notes: notes || null,
      },
      create: {
        customerProfileId: customerProfile.id,
        hairType: hairType || null,
        hairLength: hairLength || null,
        hairDensity: hairDensity || null,
        scalpCondition: scalpCondition || null,
        allergies: allergies || null,
        previousStyles: previousStyles ? JSON.stringify(previousStyles) : "[]",
        productsUsed: productsUsed ? JSON.stringify(productsUsed) : "[]",
        notes: notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      profile: {
        ...hairProfile,
        previousStyles: JSON.parse(hairProfile.previousStyles || "[]"),
        productsUsed: JSON.parse(hairProfile.productsUsed || "[]"),
      },
    });
  } catch (error) {
    console.error("Failed to save hair profile:", error);
    return NextResponse.json({ error: "Failed to save hair profile" }, { status: 500 });
  }
}
