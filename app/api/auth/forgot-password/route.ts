import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, passwordResetCodeEmail } from "@/lib/resend";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, password: true },
    });

    // Always return success to prevent email enumeration
    if (!user || !user.password) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with that email, a reset code has been sent.",
      });
    }

    // Delete any existing reset codes for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: `password-reset:${normalizedEmail}` },
    });

    const code = generateCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.verificationToken.create({
      data: {
        identifier: `password-reset:${normalizedEmail}`,
        token: code,
        expires,
      },
    });

    // Send the code via email
    await sendEmail({
      to: normalizedEmail,
      subject: `Your Password Reset Code — ${code}`,
      html: passwordResetCodeEmail({ email: normalizedEmail, code }),
    });

    return NextResponse.json({
      success: true,
      message: "If an account exists with that email, a reset code has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
