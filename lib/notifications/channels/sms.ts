import { prisma } from "@/lib/prisma";
import { ChannelHandler } from "../types";

const TERMII_API_KEY = process.env.TERMII_API_KEY;
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID || "MecBill";
const TERMII_BASE_URL = process.env.TERMII_BASE_URL || "https://api.termii.com/api";

export const smsChannel: ChannelHandler = {
  async send(userId, message) {
    try {
      if (!TERMII_API_KEY) {
        return { success: false, error: "TERMII_API_KEY not configured" };
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { phone: true },
      });

      if (!user?.phone) {
        return { success: false, error: "No phone number" };
      }

      const response = await fetch(`${TERMII_BASE_URL}/sms/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: TERMII_API_KEY,
          to: user.phone,
          from: TERMII_SENDER_ID,
          sms: message.message,
          type: "plain",
          channel: "generic",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || "SMS send failed" };
      }

      return { success: true, externalId: data.request_id };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },
};
