import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  source: z.string().optional().default("footer"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = schema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const { email, source } = validation.data;

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json({ message: "You're already subscribed!" });
      }
      await prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: { isActive: true },
      });
      return NextResponse.json({ message: "Welcome back! You've been resubscribed." });
    }

    await prisma.newsletterSubscriber.create({
      data: {
        email: email.toLowerCase(),
        source,
      },
    });

    return NextResponse.json({ message: "Welcome to the MecBill community!" }, { status: 201 });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
