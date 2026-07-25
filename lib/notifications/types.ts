export type NotificationChannel = "EMAIL" | "PUSH" | "IN_APP";

export type NotificationEventType =
  | "appointment.created"
  | "appointment.confirmed"
  | "appointment.completed"
  | "appointment.cancelled"
  | "appointment.rescheduled"
  | "appointment.no_show"
  | "appointment.reminder.24h"
  | "appointment.reminder.1h"
  | "order.placed"
  | "order.processing"
  | "order.shipped"
  | "order.delivered"
  | "order.cancelled"
  | "payment.received"
  | "review.created"
  | "account.created"
  | "inventory.low_stock";

export interface NotificationPayload {
  userId: string;
  event: NotificationEventType;
  data: Record<string, unknown>;
  channels?: NotificationChannel[];
}

export interface ChannelMessage {
  title: string;
  message: string;
  actionUrl?: string;
  html?: string;
  data?: Record<string, unknown>;
}

export interface ChannelHandler {
  send(userId: string, message: ChannelMessage): Promise<{ success: boolean; externalId?: string; error?: string }>;
}

export interface EventTemplate {
  inApp: (data: Record<string, unknown>) => { title: string; message: string; actionUrl?: string };
  email?: (data: Record<string, unknown>) => { subject: string; html: string };
  push?: (data: Record<string, unknown>) => { title: string; body: string; url?: string };
}

export interface EventConfig {
  channels: NotificationChannel[];
  template: EventTemplate;
}
