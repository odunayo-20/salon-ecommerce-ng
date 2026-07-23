import webPush from "web-push";
import { prisma } from "@/lib/prisma";
import { ChannelHandler } from "../types";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:noreply@mecbill.com";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export const pushChannel: ChannelHandler = {
  async send(userId, message) {
    try {
      if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
        return { success: false, error: "VAPID keys not configured" };
      }

      const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId, isActive: true },
      });

      if (subscriptions.length === 0) {
        return { success: false, error: "No push subscriptions" };
      }

      const payload = JSON.stringify({
        title: message.title,
        body: message.message,
        url: message.actionUrl,
      });

      let sentCount = 0;
      const errors: string[] = [];

      for (const sub of subscriptions) {
        try {
          await webPush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload
          );
          sentCount++;
        } catch (error: unknown) {
          const err = error as { statusCode?: number };
          // Remove expired or invalid subscriptions
          if (err.statusCode === 404 || err.statusCode === 410) {
            await prisma.pushSubscription.update({
              where: { id: sub.id },
              data: { isActive: false },
            });
          } else {
            errors.push(String(error));
          }
        }
      }

      if (sentCount === 0 && errors.length > 0) {
        return { success: false, error: errors.join("; ") };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },
};
