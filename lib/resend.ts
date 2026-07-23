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
  const fromAddress = from || process.env.RESEND_FROM_EMAIL || `${process.env.NEXT_PUBLIC_APP_NAME || "MecBill Tech Salon"} <noreply@mecbilltechsalon.com>`;

  const result = await getResend().emails.send({
    from: fromAddress,
    to,
    subject,
    html,
  });

  if (result.error) {
    console.error("Resend send error:", result.error);
  }

  return result;
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

export function paymentReceiptEmail(params: {
  customerName: string;
  serviceName: string;
  stylistName?: string;
  date: string;
  time: string;
  totalAmount: number;
  amountPaid: number;
  remaining: number;
  paymentReference: string;
  paidAt: string;
  bookingReference: string;
  receiptUrl: string;
  paymentHistory?: Array<{ amount: number; status: string; createdAt: string }>;
}) {
  const historyRows = (params.paymentHistory || [])
    .map(
      (p) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
          <span style="display: inline-block; background: ${p.status === "PAID" ? "#f0fdf4" : "#fffbeb"}; color: ${p.status === "PAID" ? "#16a34a" : "#d97706"}; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 3px; text-transform: uppercase;">${p.status}</span>
          <span style="color: #999; font-size: 12px; margin-left: 8px;">${new Date(p.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}</span>
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align: right; color: #1a1a1a; font-size: 14px; font-weight: 500;">₦${p.amount.toLocaleString()}</td>
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
          <h1 style="color: #c9a96e; font-size: 24px; margin: 0; letter-spacing: 3px; text-transform: uppercase;">Payment Receipt</h1>
        </div>
        <div style="padding: 40px;">
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Dear ${params.customerName},</p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Thank you for your payment. Here is your receipt:</p>

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
              </tr>` : ""}
              <tr>
                <td style="padding: 8px 0; color: #999; font-size: 14px;">Date & Time</td>
                <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right;">${params.date} at ${params.time}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #999; font-size: 14px;">Service Total</td>
                <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right; font-weight: 600;">₦${params.totalAmount.toLocaleString()}</td>
              </tr>
            </table>
          </div>

          ${historyRows ? `
          <p style="color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Payment History</p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            ${historyRows}
          </table>
          <div style="border-top: 2px solid #1a1a1a; padding-top: 12px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; color: #999; font-size: 14px;">Total Paid</td>
                <td style="padding: 4px 0; color: #16a34a; font-size: 14px; text-align: right; font-weight: 700;">₦${params.amountPaid.toLocaleString()}</td>
              </tr>
              ${params.remaining > 0 ? `
              <tr>
                <td style="padding: 4px 0; color: #999; font-size: 14px;">Balance Remaining</td>
                <td style="padding: 4px 0; color: #d97706; font-size: 14px; text-align: right; font-weight: 700;">₦${params.remaining.toLocaleString()}</td>
              </tr>` : ""}
            </table>
          </div>
          ` : `
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
            <p style="color: #16a34a; font-size: 14px; font-weight: 600; margin: 0;">PAID: ₦${params.amountPaid.toLocaleString()}</p>
          </div>
          `}

          <div style="background: ${params.remaining === 0 ? "#f0fdf4" : "#fffbeb"}; border: 1px solid ${params.remaining === 0 ? "#bbf7d0" : "#fde68a"}; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
            <p style="color: ${params.remaining === 0 ? "#16a34a" : "#d97706"}; font-size: 14px; font-weight: 600; margin: 0;">
              ${params.remaining === 0 ? "PAID IN FULL" : "PARTIAL PAYMENT"}
            </p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 0 0 24px;">
            <tr>
              <td style="padding: 6px 0; color: #999; font-size: 12px;">Payment Ref</td>
              <td style="padding: 6px 0; color: #1a1a1a; font-size: 12px; text-align: right; font-family: monospace;">${params.paymentReference}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #999; font-size: 12px;">Booking Ref</td>
              <td style="padding: 6px 0; color: #1a1a1a; font-size: 12px; text-align: right; font-family: monospace;">${params.bookingReference}</td>
            </tr>
          </table>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${params.receiptUrl}" style="display: inline-block; background: #1a1a1a; color: #ffffff; padding: 12px 32px; border-radius: 50px; text-decoration: none; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">View & Download Receipt</a>
          </div>
        </div>
        <div style="background: #faf9f7; padding: 24px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">${process.env.NEXT_PUBLIC_APP_NAME} | Luxury Hair Experiences</p>
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
