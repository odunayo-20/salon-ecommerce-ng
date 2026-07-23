import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import { ChannelHandler } from "../types";

export const emailChannel: ChannelHandler = {
  async send(userId, message) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (!user?.email) {
        return { success: false, error: "No email address" };
      }

      const result = await sendEmail({
        to: user.email,
        subject: message.title,
        html: message.html || `<p>${message.message}</p>`,
      });

      if (result.error) {
        return { success: false, error: result.error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },
};
