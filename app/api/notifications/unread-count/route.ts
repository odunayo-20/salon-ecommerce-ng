import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const count = await prisma.notification.count({
      where: { userId: session.user.id, isRead: false },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Failed to fetch unread count:", error);
    return NextResponse.json({ error: "Failed to fetch unread count" }, { status: 500 });
  }
}
