import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const consultationSchema = z.object({
  hairConcerns: z.string().min(10),
  desiredHairstyle: z.string().optional(),
  hairType: z.string().optional(),
  referenceImages: z.array(z.string()).optional(),
  additionalNotes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = consultationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!customerProfile) {
      return NextResponse.json({ error: "Customer profile not found" }, { status: 404 });
    }

    const consultation = await prisma.consultation.create({
      data: {
        customerProfileId: customerProfile.id,
        hairConcerns: validation.data.hairConcerns,
        desiredHairstyle: validation.data.desiredHairstyle,
        hairType: validation.data.hairType as never,
        referenceImages: JSON.stringify(validation.data.referenceImages || []),
        additionalNotes: validation.data.additionalNotes,
      },
    });

    return NextResponse.json({ consultation }, { status: 201 });
  } catch (error) {
    console.error("Consultation error:", error);
    return NextResponse.json(
      { error: "Failed to submit consultation" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!customerProfile) {
      return NextResponse.json({ consultations: [] });
    }

    const consultations = await prisma.consultation.findMany({
      where: { customerProfileId: customerProfile.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ consultations });
  } catch (error) {
    console.error("Fetch consultations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch consultations" },
      { status: 500 }
    );
  }
}
