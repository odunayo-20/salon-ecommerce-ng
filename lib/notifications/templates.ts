import { NotificationEventType, EventConfig } from "./types";
import {
  appointmentPlacedEmail,
  appointmentConfirmedEmail,
  appointmentCompletedEmail,
  appointmentCancelledEmail,
  appointmentReminderEmail,
  orderPlacedEmail,
  orderProcessingEmail,
  orderShippedEmail,
  orderDeliveredEmail,
  lowStockAlertEmail,
} from "@/lib/resend";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const eventConfigs: Record<NotificationEventType, EventConfig> = {
  "appointment.created": {
    channels: ["IN_APP", "EMAIL"],
    template: {
      inApp: (d) => ({
        title: "Booking Request Received",
        message: `Your ${d.serviceName as string} appointment has been submitted.`,
        actionUrl: "/dashboard",
      }),
      email: (d) => ({
        subject: `Booking Received — ${d.reference as string}`,
        html: appointmentPlacedEmail({
          customerName: d.customerName as string,
          serviceName: d.serviceName as string,
          stylistName: d.stylistName as string | undefined,
          date: d.date as string,
          time: d.time as string,
          totalAmount: d.totalAmount as number,
          depositPaid: d.depositPaid as number,
          reference: d.reference as string,
        }),
      }),
    },
  },

  "appointment.confirmed": {
    channels: ["IN_APP", "EMAIL", "PUSH"],
    template: {
      inApp: (d) => ({
        title: "Appointment Confirmed",
        message: `Your ${d.serviceName as string} appointment on ${d.date as string} is confirmed.`,
        actionUrl: "/dashboard",
      }),
      email: (d) => ({
        subject: `Appointment Confirmed — ${d.reference as string}`,
        html: appointmentConfirmedEmail({
          customerName: d.customerName as string,
          serviceName: d.serviceName as string,
          stylistName: d.stylistName as string | undefined,
          date: d.date as string,
          time: d.time as string,
          reference: d.reference as string,
        }),
      }),
      push: (d) => ({
        title: "Appointment Confirmed",
        body: `${d.serviceName as string} on ${d.date as string} at ${d.time as string}`,
        url: `${APP_URL}/dashboard`,
      }),
    },
  },

  "appointment.completed": {
    channels: ["IN_APP", "EMAIL"],
    template: {
      inApp: (d) => ({
        title: "Service Completed",
        message: `Your ${d.serviceName as string} appointment has been completed. We hope you loved it!`,
        actionUrl: "/dashboard",
      }),
      email: (d) => ({
        subject: `Service Completed — ${d.reference as string}`,
        html: appointmentCompletedEmail({
          customerName: d.customerName as string,
          serviceName: d.serviceName as string,
          stylistName: d.stylistName as string | undefined,
          date: d.date as string,
          reference: d.reference as string,
        }),
      }),
    },
  },

  "appointment.cancelled": {
    channels: ["IN_APP", "EMAIL", "PUSH"],
    template: {
      inApp: (d) => ({
        title: "Appointment Cancelled",
        message: `Your ${d.serviceName as string} appointment on ${d.date as string} has been cancelled.${d.reason ? ` Reason: ${d.reason as string}` : ""}`,
        actionUrl: "/book",
      }),
      email: (d) => ({
        subject: `Appointment Cancelled — ${d.reference as string}`,
        html: appointmentCancelledEmail({
          customerName: d.customerName as string,
          serviceName: d.serviceName as string,
          date: d.date as string,
          reference: d.reference as string,
          reason: d.reason as string | undefined,
        }),
      }),
      push: (d) => ({
        title: "Appointment Cancelled",
        body: `${d.serviceName as string} on ${d.date as string} has been cancelled.`,
        url: `${APP_URL}/book`,
      }),
    },
  },

  "appointment.rescheduled": {
    channels: ["IN_APP", "EMAIL", "PUSH"],
    template: {
      inApp: (d) => ({
        title: "Appointment Rescheduled",
        message: `Your ${d.serviceName as string} appointment has been rescheduled to ${d.date as string} at ${d.time as string}.`,
        actionUrl: "/dashboard",
      }),
      email: (d) => ({
        subject: `Appointment Rescheduled — ${d.reference as string}`,
        html: appointmentConfirmedEmail({
          customerName: d.customerName as string,
          serviceName: d.serviceName as string,
          stylistName: d.stylistName as string | undefined,
          date: d.date as string,
          time: d.time as string,
          reference: d.reference as string,
        }),
      }),
      push: (d) => ({
        title: "Appointment Rescheduled",
        body: `${d.serviceName as string} moved to ${d.date as string} at ${d.time as string}`,
        url: `${APP_URL}/dashboard`,
      }),
    },
  },

  "appointment.reminder.24h": {
    channels: ["IN_APP", "EMAIL", "PUSH"],
    template: {
      inApp: (d) => ({
        title: "Appointment Tomorrow",
        message: `Reminder: Your ${d.serviceName as string} appointment is tomorrow at ${d.time as string}.`,
        actionUrl: "/dashboard",
      }),
      email: (d) => ({
        subject: `Appointment Reminder — Tomorrow at ${d.time as string}`,
        html: appointmentReminderEmail({
          customerName: d.customerName as string,
          serviceName: d.serviceName as string,
          stylistName: d.stylistName as string | undefined,
          date: d.date as string,
          time: d.time as string,
          reference: d.reference as string,
          hoursUntil: 24,
        }),
      }),
      push: (d) => ({
        title: "Appointment Tomorrow",
        body: `${d.serviceName as string} tomorrow at ${d.time as string}`,
        url: `${APP_URL}/dashboard`,
      }),
    },
  },

  "appointment.reminder.1h": {
    channels: ["IN_APP", "EMAIL", "PUSH"],
    template: {
      inApp: (d) => ({
        title: "Appointment Starting Soon",
        message: `Your ${d.serviceName as string} appointment starts in 1 hour at ${d.time as string}.`,
        actionUrl: "/dashboard",
      }),
      email: (d) => ({
        subject: `Appointment Starting Soon — ${d.time as string}`,
        html: appointmentReminderEmail({
          customerName: d.customerName as string,
          serviceName: d.serviceName as string,
          stylistName: d.stylistName as string | undefined,
          date: d.date as string,
          time: d.time as string,
          reference: d.reference as string,
          hoursUntil: 1,
        }),
      }),
      push: (d) => ({
        title: "Appointment in 1 Hour",
        body: `${d.serviceName as string} starts at ${d.time as string}. See you soon!`,
        url: `${APP_URL}/dashboard`,
      }),
    },
  },

  "order.placed": {
    channels: ["IN_APP", "EMAIL"],
    template: {
      inApp: (d) => ({
        title: "Order Placed",
        message: `Order ${d.orderNumber as string} has been placed successfully.`,
        actionUrl: "/dashboard/orders",
      }),
      email: (d) => ({
        subject: `Order Placed — ${d.orderNumber as string}`,
        html: orderPlacedEmail({
          customerName: d.customerName as string,
          orderNumber: d.orderNumber as string,
          items: d.items as { name: string; quantity: number; price: number }[],
          total: d.total as number,
          shippingAddress: d.shippingAddress as string,
        }),
      }),
    },
  },

  "order.processing": {
    channels: ["IN_APP", "EMAIL"],
    template: {
      inApp: (d) => ({
        title: "Order Processing",
        message: `Your order ${d.orderNumber as string} is now being processed.`,
        actionUrl: "/dashboard/orders",
      }),
      email: (d) => ({
        subject: `Order Processing — ${d.orderNumber as string}`,
        html: orderProcessingEmail({
          customerName: d.customerName as string,
          orderNumber: d.orderNumber as string,
        }),
      }),
    },
  },

  "order.shipped": {
    channels: ["IN_APP", "EMAIL", "PUSH"],
    template: {
      inApp: (d) => ({
        title: "Order Shipped",
        message: `Your order ${d.orderNumber as string} has been shipped.${d.trackingNumber ? ` Tracking: ${d.trackingNumber as string}` : ""}`,
        actionUrl: "/dashboard/orders",
      }),
      email: (d) => ({
        subject: `Order Shipped — ${d.orderNumber as string}`,
        html: orderShippedEmail({
          customerName: d.customerName as string,
          orderNumber: d.orderNumber as string,
          trackingNumber: d.trackingNumber as string | undefined,
        }),
      }),
      push: (d) => ({
        title: "Order Shipped",
        body: `Order ${d.orderNumber as string} is on its way!${d.trackingNumber ? ` Track: ${d.trackingNumber}` : ""}`,
        url: `${APP_URL}/dashboard/orders`,
      }),
    },
  },

  "order.delivered": {
    channels: ["IN_APP", "EMAIL"],
    template: {
      inApp: (d) => ({
        title: "Order Delivered",
        message: `Your order ${d.orderNumber as string} has been delivered. Enjoy!`,
        actionUrl: "/dashboard/orders",
      }),
      email: (d) => ({
        subject: `Order Delivered — ${d.orderNumber as string}`,
        html: orderDeliveredEmail({
          customerName: d.customerName as string,
          orderNumber: d.orderNumber as string,
        }),
      }),
    },
  },

  "payment.received": {
    channels: ["IN_APP"],
    template: {
      inApp: (d) => ({
        title: "Payment Received",
        message: `Payment of ₦${(d.amount as number).toLocaleString()} received for ${d.reference as string}.`,
        actionUrl: "/dashboard",
      }),
    },
  },

  "review.created": {
    channels: ["IN_APP"],
    template: {
      inApp: (d) => ({
        title: "New Review",
        message: `${d.customerName as string} left a ${d.rating as number}-star review on ${d.targetName as string}.`,
        actionUrl: "/admin/reviews",
      }),
    },
  },

  "account.created": {
    channels: ["IN_APP", "EMAIL"],
    template: {
      inApp: (d) => ({
        title: "Welcome to MecBill!",
        message: `Hi ${d.customerName as string}, your account has been created. Explore our services and products.`,
        actionUrl: "/shop",
      }),
      email: (d) => ({
        subject: `Welcome to ${process.env.NEXT_PUBLIC_APP_NAME || "MecBill Tech Salon"}!`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #faf9f7; margin: 0; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
              <div style="background: #1a1a1a; padding: 40px; text-align: center;">
                <h1 style="color: #c9a96e; font-size: 24px; margin: 0; letter-spacing: 3px; text-transform: uppercase;">Welcome!</h1>
              </div>
              <div style="padding: 40px;">
                <p style="color: #666; font-size: 16px; line-height: 1.6;">Dear ${d.customerName as string},</p>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">Welcome to ${process.env.NEXT_PUBLIC_APP_NAME || "MecBill Tech Salon"}! We&apos;re excited to have you.</p>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">Explore our premium hair services, shop our collection, and book your next appointment.</p>
                <div style="text-align: center; margin: 24px 0;">
                  <a href="${APP_URL}/shop" style="display: inline-block; background: #1a1a1a; color: #ffffff; padding: 12px 32px; border-radius: 50px; text-decoration: none; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">Explore Now</a>
                </div>
              </div>
              <div style="background: #faf9f7; padding: 24px; text-align: center;">
                <p style="color: #999; font-size: 12px; margin: 0;">${process.env.NEXT_PUBLIC_APP_NAME || "MecBill Tech Salon"} | Luxury Hair Experiences</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    },
  },

  "inventory.low_stock": {
    channels: ["IN_APP", "EMAIL"],
    template: {
      inApp: (d) => ({
        title: "Low Stock Alert",
        message: `${d.productName as string} has ${d.currentStock as number} units left (threshold: ${d.threshold as number}).`,
        actionUrl: "/admin/inventory",
      }),
      email: (d) => ({
        subject: `Low Stock — ${d.productName as string}`,
        html: lowStockAlertEmail({
          productName: d.productName as string,
          currentStock: d.currentStock as number,
          threshold: d.threshold as number,
        }),
      }),
    },
  },
};
