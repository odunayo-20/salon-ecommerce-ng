import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCodeLimiter } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const rl = await verifyCodeLimiter(request);
    if (!rl.success) return rl.response;

    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = code.trim();

    const token = await prisma.verificationToken.findFirst({
      where: {
        identifier: `password-reset:${normalizedEmail}`,
        token: normalizedCode,
        expires: { gt: new Date() },
      },
    });

    if (!token) {
      return NextResponse.json(
        { error: "Invalid or expired code. Please request a new one." },
        { status: 400 }
      );
    }

    // Delete the used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: token.identifier,
          token: token.token,
        },
      },
    });

    // Generate a short-lived reset token (JWT-like random string)
    const resetToken = `reset-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`;
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.verificationToken.create({
      data: {
        identifier: `password-reset-token:${normalizedEmail}`,
        token: resetToken,
        expires: resetExpires,
      },
    });

    return NextResponse.json({
      success: true,
      resetToken,
      email: normalizedEmail,
    });
  } catch (error) {
    console.error("Verify reset code error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
