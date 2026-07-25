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

const adminInAppTemplates: Record<string, (data: Record<string, unknown>) => { title: string; message: string; actionUrl?: string }> = {
  "appointment.created": (d) => ({
    title: "New Booking",
    message: `${d.customerName as string} booked a ${d.serviceName as string} appointment for ${d.date as string}.`,
    actionUrl: "/admin/appointments",
  }),
  "appointment.confirmed": (d) => ({
    title: "Booking Confirmed",
    message: `${d.customerName as string}'s ${d.serviceName as string} appointment has been confirmed.`,
    actionUrl: "/admin/appointments",
  }),
  "appointment.cancelled": (d) => ({
    title: "Booking Cancelled",
    message: `${d.customerName as string} cancelled their ${d.serviceName as string} appointment.${d.reason ? ` Reason: ${d.reason as string}` : ""}`,
    actionUrl: "/admin/appointments",
  }),
  "appointment.rescheduled": (d) => ({
    title: "Booking Rescheduled",
    message: `${d.customerName as string} rescheduled their ${d.serviceName as string} appointment to ${d.date as string} at ${d.time as string}.`,
    actionUrl: "/admin/appointments",
  }),
  "appointment.no_show": (d) => ({
    title: "No-Show",
    message: `${d.customerName as string} did not attend their ${d.serviceName as string} appointment on ${d.date as string}.`,
    actionUrl: "/admin/appointments",
  }),
  "order.placed": (d) => ({
    title: "New Order",
    message: `${d.customerName as string} placed order ${d.orderNumber as string} — ₦${(d.total as number).toLocaleString()}.`,
    actionUrl: "/admin/orders",
  }),
  "order.cancelled": (d) => ({
    title: "Order Cancelled",
    message: `${d.customerName as string}'s order ${d.orderNumber as string} has been cancelled.`,
    actionUrl: "/admin/orders",
  }),
  "payment.received": (d) => ({
    title: "Payment Received",
    message: `₦${(d.amount as number).toLocaleString()} payment received for ${d.reference as string}.`,
    actionUrl: "/admin/orders",
  }),
  "review.created": (d) => ({
    title: "New Review",
    message: `${d.customerName as string} left a ${d.rating as number}-star review on ${d.targetName as string}.`,
    actionUrl: "/admin/reviews",
  }),
  "inventory.low_stock": (d) => ({
    title: "Low Stock Alert",
    message: `${d.productName as string} has only ${d.currentStock as number} units left (threshold: ${d.threshold as number}).`,
    actionUrl: "/admin/inventory",
  }),
};

export async function notifyAdmins(
  event: NotificationEventType,
  data: Record<string, unknown>,
  channels?: NotificationChannel[]
): Promise<void> {
  const adminIds = await getAdminUserIds();
  if (adminIds.length === 0) return;

  const config = eventConfigs[event];
  if (!config) return;

  const activeChannels = channels || config.channels;
  const inAppChannel_ = activeChannels.includes("IN_APP" as NotificationChannel)
    ? inAppChannel
    : null;

  if (!inAppChannel_) return;

  const templateFn = adminInAppTemplates[event];
  if (!templateFn) return;

  const content = templateFn(data);

  await Promise.allSettled(
    adminIds.map((userId) =>
      inAppChannel_.send(userId, {
        title: content.title,
        message: content.message,
        actionUrl: content.actionUrl,
        data,
      })
    )
  );
}
