import { prisma } from "@/lib/prisma";
import { ChannelHandler } from "../types";

export const inAppChannel: ChannelHandler = {
  async send(userId, message) {
    try {
      await prisma.notification.create({
        data: {
          userId,
          title: message.title,
          message: message.message,
          type: message.data?.type as string || "info",
          channel: "IN_APP",
          actionUrl: message.actionUrl,
          metadata: message.data ? JSON.stringify(message.data) : "{}",
        },
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },
};
