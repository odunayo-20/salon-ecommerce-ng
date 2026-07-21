import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");
  }
  return _resend;
}

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: EmailParams) {
  return getResend().emails.send({
    from: from || `${process.env.NEXT_PUBLIC_APP_NAME} <noreply@${process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "").split("/")[0] || "mecbilltechsalon.com"}>`,
    to,
    subject,
    html,
  });
}

export function bookingConfirmationEmail(params: {
  customerName: string;
  serviceName: string;
  stylistName?: string;
  date: string;
  time: string;
  totalAmount: number;
  depositPaid: number;
  reference: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #faf9f7; margin: 0; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 20px rgba(0,0,0,0.05);">
        <div style="background: #1a1a1a; padding: 40px; text-align: center;">
          <h1 style="color: #c9a96e; font-size: 24px; margin: 0; letter-spacing: 3px; text-transform: uppercase;">Booking Confirmed</h1>
        </div>
        <div style="padding: 40px;">
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Dear ${params.customerName},</p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Your appointment has been confirmed. We look forward to seeing you!</p>
          
          <div style="background: #faf9f7; border-radius: 8px; padding: 24px; margin: 24px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #999; font-size: 14px;">Service</td>
                <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right;">${params.serviceName}</td>
              </tr>
              ${params.stylistName ? `
              <tr>
                <td style="padding: 8px 0; color: #999; font-size: 14px;">Stylist</td>
                <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right;">${params.stylistName}</td>
              </tr>
              ` : ""}
              <tr>
                <td style="padding: 8px 0; color: #999; font-size: 14px;">Date</td>
                <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right;">${params.date}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #999; font-size: 14px;">Time</td>
                <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right;">${params.time}</td>
              </tr>
              <tr style="border-top: 1px solid #e5e5e5;">
                <td style="padding: 12px 0 0; color: #999; font-size: 14px;">Total</td>
                <td style="padding: 12px 0 0; color: #1a1a1a; font-size: 14px; text-align: right; font-weight: 600;">₦${params.totalAmount.toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <p style="color: #999; font-size: 13px;">Reference: ${params.reference}</p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin-top: 24px;">
            Need to reschedule? Contact us on WhatsApp at least 24 hours before your appointment.
          </p>
        </div>
        <div style="background: #faf9f7; padding: 24px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            ${process.env.NEXT_PUBLIC_APP_NAME} | Luxury Hair Experiences
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function orderConfirmationEmail(params: {
  customerName: string;
  orderNumber: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  shippingAddress: string;
}) {
  const itemsHtml = params.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #1a1a1a; font-size: 14px;">${item.name}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #666; font-size: 14px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #1a1a1a; font-size: 14px; text-align: right;">₦${item.price.toLocaleString()}</td>
      </tr>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #faf9f7; margin: 0; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
        <div style="background: #1a1a1a; padding: 40px; text-align: center;">
          <h1 style="color: #c9a96e; font-size: 24px; margin: 0; letter-spacing: 3px; text-transform: uppercase;">Order Confirmed</h1>
        </div>
        <div style="padding: 40px;">
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Dear ${params.customerName},</p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Your order <strong>${params.orderNumber}</strong> has been received and is being processed.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            <thead>
              <tr>
                <th style="text-align: left; padding: 8px 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Item</th>
                <th style="text-align: center; padding: 8px 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Qty</th>
                <th style="text-align: right; padding: 8px 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Price</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          
          <div style="border-top: 2px solid #1a1a1a; padding-top: 16px; text-align: right;">
            <p style="color: #1a1a1a; font-size: 18px; font-weight: 600; margin: 0;">Total: ₦${params.total.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
