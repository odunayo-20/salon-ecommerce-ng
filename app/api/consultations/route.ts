import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const consultationSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  hairConcerns: z.string().min(10),
  desiredHairstyle: z.string().optional(),
  hairType: z.string().optional(),
  referenceImages: z.array(z.string()).optional(),
  additionalNotes: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const body = await request.json();
    const consultation = await prisma.consultation.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.adminNotes !== undefined && { adminNotes: body.adminNotes }),
        ...(body.recommendedService !== undefined && { recommendedService: body.recommendedService }),
        ...(body.recommendedProduct !== undefined && { recommendedProduct: body.recommendedProduct }),
        ...(body.priceEstimate !== undefined && { priceEstimate: body.priceEstimate }),
      },
    });

    return NextResponse.json({ consultation });
  } catch (error) {
    console.error("Update consultation error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = consultationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Try to link to customer profile if logged in
    let customerProfileId: string | null = null;
    try {
      const session = await auth();
      if (session?.user?.id) {
        const profile = await prisma.customerProfile.findUnique({
          where: { userId: session.user.id },
        });
        customerProfileId = profile?.id || null;
      }
    } catch {
      // Not logged in — that's fine
    }

    const consultation = await prisma.consultation.create({
      data: {
        customerProfileId,
        name: data.name || null,
        email: data.email || null,
        phone: data.phone || null,
        hairConcerns: data.hairConcerns,
        desiredHairstyle: data.desiredHairstyle,
        hairType: data.hairType as never,
        referenceImages: JSON.stringify(data.referenceImages || []),
        additionalNotes: data.additionalNotes,
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

    // Admin gets all consultations
    if (session.user.role === "ADMIN") {
      const consultations = await prisma.consultation.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          customerProfile: {
            include: { user: { select: { name: true, email: true, phone: true } } },
          },
        },
      });
      return NextResponse.json({ consultations });
    }

    // Customer gets their own
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
