import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { endpoint, p256dh, auth: authKey } = await request.json();

    if (!endpoint || !p256dh || !authKey) {
      return NextResponse.json({ error: "Missing push subscription fields" }, { status: 400 });
    }

    const subscription = await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId: session.user.id,
          endpoint,
        },
      },
      update: {
        p256dh,
        auth: authKey,
        isActive: true,
        userAgent: request.headers.get("user-agent"),
      },
      create: {
        userId: session.user.id,
        endpoint,
        p256dh,
        auth: authKey,
        userAgent: request.headers.get("user-agent"),
      },
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Failed to register push subscription:", error);
    return NextResponse.json({ error: "Failed to register subscription" }, { status: 500 });
  }
}
