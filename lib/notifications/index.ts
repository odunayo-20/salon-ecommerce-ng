import { prisma } from "@/lib/prisma";
import { NotificationEventType, NotificationChannel, NotificationPayload, ChannelMessage } from "./types";
import { eventConfigs } from "./templates";
import { emailChannel } from "./channels/email";
import { pushChannel } from "./channels/push";
import { inAppChannel } from "./channels/in-app";

const channelHandlers: Record<NotificationChannel, typeof inAppChannel> = {
  EMAIL: emailChannel,
  PUSH: pushChannel,
  IN_APP: inAppChannel,
};

export async function notify(payload: NotificationPayload): Promise<void> {
  const { userId, event, data, channels: overrideChannels } = payload;
  const config = eventConfigs[event];

  if (!config) {
    console.warn(`[Notification] Unknown event: ${event}`);
    return;
  }

  const activeChannels = overrideChannels || config.channels;

  for (const channel of activeChannels) {
    const templateFn = config.template[channel === "EMAIL" ? "email" : channel === "PUSH" ? "push" : "inApp"];

    if (!templateFn) continue;

    let message: ChannelMessage;

    if (channel === "EMAIL") {
      const emailContent = (templateFn as (data: Record<string, unknown>) => { subject: string; html: string })(data);
      message = {
        title: emailContent.subject,
        message: emailContent.subject,
        html: emailContent.html,
        data,
      };
    } else if (channel === "PUSH") {
      const pushContent = (templateFn as (data: Record<string, unknown>) => { title: string; body: string; url?: string })(data);
      message = {
        title: pushContent.title,
        message: pushContent.body,
        actionUrl: pushContent.url,
        data,
      };
    } else {
      const inAppContent = (templateFn as (data: Record<string, unknown>) => { title: string; message: string; actionUrl?: string })(data);
      message = {
        title: inAppContent.title,
        message: inAppContent.message,
        actionUrl: inAppContent.actionUrl,
        data,
      };
    }

    const handler = channelHandlers[channel];

    try {
      const result = await handler.send(userId, message);

      // Log delivery attempt
      await prisma.notificationLog.create({
        data: {
          notificationId: "", // Will be set for in-app notifications
          channel,
          status: result.success ? "SENT" : "FAILED",
          externalId: result.externalId,
          error: result.error,
          sentAt: result.success ? new Date() : null,
        },
      }).catch(() => {
        // Notification log creation failure is non-critical
      });
    } catch (error) {
      console.error(`[Notification] ${channel} channel error for event ${event}:`, error);
    }
  }
}

export async function notifyMany(
  userIds: string[],
  event: NotificationEventType,
  data: Record<string, unknown>,
  channels?: NotificationChannel[]
): Promise<void> {
  const promises = userIds.map((userId) =>
    notify({ userId, event, data, channels })
  );
  await Promise.allSettled(promises);
}

export async function getAdminUserIds(): Promise<string[]> {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  return admins.map((a) => a.id);
}
