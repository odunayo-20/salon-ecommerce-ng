interface EmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: EmailParams) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error("BREVO_API_KEY is not configured");
    return { error: { message: "Email provider not configured" } };
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || "noreply@mecbilltechsalon.com";
  const senderName = process.env.BREVO_SENDER_NAME || process.env.NEXT_PUBLIC_APP_NAME || "MecBill Tech Salon";
  const parsedFrom = from?.match(/<(.+?)>/)?.[1] || from;

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify({
        sender: { name: senderName, email: parsedFrom || senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const msg = data?.message || `Brevo API error ${res.status}`;
      console.error("Brevo send error:", msg);
      return { error: { message: msg } };
    }

    return { error: null };
  } catch (err) {
    console.error("Brevo send error:", err);
    return { error: { message: err instanceof Error ? err.message : "Email send failed" } };
  }
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

          ${params.shippingAddress ? `
          <div style="background: #faf9f7; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px;">Shipping Address</p>
            <p style="color: #1a1a1a; font-size: 14px; margin: 0; line-height: 1.5;">${params.shippingAddress}</p>
          </div>
          ` : ""}
        </div>
      </div>
    </body>
    </html>
  `;
}

export function orderPlacedEmail(params: {
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
          <h1 style="color: #c9a96e; font-size: 24px; margin: 0; letter-spacing: 3px; text-transform: uppercase;">Order Placed</h1>
        </div>
        <div style="padding: 40px;">
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Dear ${params.customerName},</p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Thank you for your order! We&apos;ve received it and will process it once payment is confirmed.</p>
          
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

          ${params.shippingAddress ? `
          <div style="background: #faf9f7; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px;">Shipping Address</p>
            <p style="color: #1a1a1a; font-size: 14px; margin: 0; line-height: 1.5;">${params.shippingAddress}</p>
          </div>
          ` : ""}

          <p style="color: #999; font-size: 13px; margin-top: 24px;">Order: ${params.orderNumber}</p>
        </div>
        <div style="background: #faf9f7; padding: 24px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">${process.env.NEXT_PUBLIC_APP_NAME} | Luxury Hair Experiences</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function orderProcessingEmail(params: {
  customerName: string;
  orderNumber: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #faf9f7; margin: 0; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
        <div style="background: #1a1a1a; padding: 40px; text-align: center;">
          <h1 style="color: #c9a96e; font-size: 24px; margin: 0; letter-spacing: 3px; text-transform: uppercase;">Order Processing</h1>
        </div>
        <div style="padding: 40px;">
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Dear ${params.customerName},</p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Great news! Your order <strong>${params.orderNumber}</strong> has been confirmed and is now being processed.</p>
          
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
            <p style="color: #2563eb; font-size: 14px; font-weight: 600; margin: 0;">PROCESSING</p>
          </div>

          <p style="color: #666; font-size: 14px; line-height: 1.6;">We&apos;re preparing your order for shipment. You&apos;ll receive another email once it&apos;s on its way.</p>
        </div>
        <div style="background: #faf9f7; padding: 24px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">${process.env.NEXT_PUBLIC_APP_NAME} | Luxury Hair Experiences</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function orderShippedEmail(params: {
  customerName: string;
  orderNumber: string;
  trackingNumber?: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #faf9f7; margin: 0; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
        <div style="background: #1a1a1a; padding: 40px; text-align: center;">
          <h1 style="color: #c9a96e; font-size: 24px; margin: 0; letter-spacing: 3px; text-transform: uppercase;">Order Shipped</h1>
        </div>
        <div style="padding: 40px;">
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Dear ${params.customerName},</p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Your order <strong>${params.orderNumber}</strong> has been shipped and is on its way to you!</p>
          
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
            <p style="color: #16a34a; font-size: 14px; font-weight: 600; margin: 0;">SHIPPED</p>
          </div>

          ${params.trackingNumber ? `
          <div style="background: #faf9f7; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px;">Tracking Number</p>
            <p style="color: #1a1a1a; font-size: 16px; margin: 0; font-family: monospace; font-weight: 600;">${params.trackingNumber}</p>
          </div>
          ` : ""}

          <p style="color: #666; font-size: 14px; line-height: 1.6;">You&apos;ll receive another email once your order has been delivered.</p>
        </div>
        <div style="background: #faf9f7; padding: 24px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">${process.env.NEXT_PUBLIC_APP_NAME} | Luxury Hair Experiences</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function orderDeliveredEmail(params: {
  customerName: string;
  orderNumber: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #faf9f7; margin: 0; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
        <div style="background: #1a1a1a; padding: 40px; text-align: center;">
          <h1 style="color: #c9a96e; font-size: 24px; margin: 0; letter-spacing: 3px; text-transform: uppercase;">Order Delivered</h1>
        </div>
        <div style="padding: 40px;">
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Dear ${params.customerName},</p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Your order <strong>${params.orderNumber}</strong> has been delivered. We hope you love your purchase!</p>
          
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
            <p style="color: #16a34a; font-size: 14px; font-weight: 600; margin: 0;">DELIVERED</p>
          </div>

          <p style="color: #666; font-size: 14px; line-height: 1.6;">If you have any questions or need to return an item, please don&apos;t hesitate to reach out.</p>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders" style="display: inline-block; background: #1a1a1a; color: #ffffff; padding: 12px 32px; border-radius: 50px; text-decoration: none; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">View Orders</a>
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

export function appointmentPlacedEmail(params: {
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
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #faf9f7; margin: 0; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
        <div style="background: #1a1a1a; padding: 40px; text-align: center;">
          <h1 style="color: #c9a96e; font-size: 24px; margin: 0; letter-spacing: 3px; text-transform: uppercase;">Booking Placed</h1>
        </div>
        <div style="padding: 40px;">
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Dear ${params.customerName},</p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">We&apos;ve received your booking request. Here are the details:</p>
          
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

          ${params.depositPaid > 0 ? `
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
            <p style="color: #16a34a; font-size: 14px; font-weight: 600; margin: 0;">Deposit Paid: ₦${params.depositPaid.toLocaleString()}</p>
          </div>
          ` : `
          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
            <p style="color: #d97706; font-size: 14px; font-weight: 600; margin: 0;">Payment pending — pay at the salon</p>
          </div>
          `}

          <p style="color: #999; font-size: 13px;">Reference: ${params.reference}</p>
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 16px;">We&apos;ll send you a confirmation once your booking is approved.</p>
        </div>
        <div style="background: #faf9f7; padding: 24px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">${process.env.NEXT_PUBLIC_APP_NAME} | Luxury Hair Experiences</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function appointmentConfirmedEmail(params: {
  customerName: string;
  serviceName: string;
  stylistName?: string;
  date: string;
  time: string;
  reference: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #faf9f7; margin: 0; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
        <div style="background: #1a1a1a; padding: 40px; text-align: center;">
          <h1 style="color: #c9a96e; font-size: 24px; margin: 0; letter-spacing: 3px; text-transform: uppercase;">Booking Confirmed</h1>
        </div>
        <div style="padding: 40px;">
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Dear ${params.customerName},</p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Your appointment has been confirmed! We look forward to seeing you.</p>
          
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
            <p style="color: #16a34a; font-size: 14px; font-weight: 600; margin: 0;">CONFIRMED</p>
          </div>
          
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
                <td style="padding: 8px 0; color: #999; font-size: 14px;">Date & Time</td>
                <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right;">${params.date} at ${params.time}</td>
              </tr>
            </table>
          </div>

          <p style="color: #999; font-size: 13px;">Reference: ${params.reference}</p>
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 16px;">Need to reschedule? Contact us at least 24 hours before your appointment.</p>
        </div>
        <div style="background: #faf9f7; padding: 24px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">${process.env.NEXT_PUBLIC_APP_NAME} | Luxury Hair Experiences</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function appointmentCompletedEmail(params: {
  customerName: string;
  serviceName: string;
  stylistName?: string;
  date: string;
  reference: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #faf9f7; margin: 0; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
        <div style="background: #1a1a1a; padding: 40px; text-align: center;">
          <h1 style="color: #c9a96e; font-size: 24px; margin: 0; letter-spacing: 3px; text-transform: uppercase;">Service Completed</h1>
        </div>
        <div style="padding: 40px;">
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Dear ${params.customerName},</p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Thank you for visiting us! Your appointment for <strong>${params.serviceName}</strong> has been completed.</p>
          
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
            <p style="color: #16a34a; font-size: 14px; font-weight: 600; margin: 0;">COMPLETED</p>
          </div>

          <p style="color: #666; font-size: 14px; line-height: 1.6;">We hope you loved your experience! If you have a moment, we&apos;d appreciate your feedback.</p>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: #1a1a1a; color: #ffffff; padding: 12px 32px; border-radius: 50px; text-decoration: none; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">View Dashboard</a>
          </div>

          <p style="color: #999; font-size: 13px;">Reference: ${params.reference}</p>
        </div>
        <div style="background: #faf9f7; padding: 24px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">${process.env.NEXT_PUBLIC_APP_NAME} | Luxury Hair Experiences</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function appointmentCancelledEmail(params: {
  customerName: string;
  serviceName: string;
  date: string;
  reference: string;
  reason?: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #faf9f7; margin: 0; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
        <div style="background: #1a1a1a; padding: 40px; text-align: center;">
          <h1 style="color: #c9a96e; font-size: 24px; margin: 0; letter-spacing: 3px; text-transform: uppercase;">Booking Cancelled</h1>
        </div>
        <div style="padding: 40px;">
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Dear ${params.customerName},</p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Your appointment for <strong>${params.serviceName}</strong> on ${params.date} has been cancelled.</p>
          
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
            <p style="color: #dc2626; font-size: 14px; font-weight: 600; margin: 0;">CANCELLED</p>
          </div>

          ${params.reason ? `
          <div style="background: #faf9f7; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px;">Reason</p>
            <p style="color: #1a1a1a; font-size: 14px; margin: 0;">${params.reason}</p>
          </div>
          ` : ""}

          <p style="color: #666; font-size: 14px; line-height: 1.6;">If you&apos;d like to rebook, we&apos;re happy to help find a new time.</p>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/book" style="display: inline-block; background: #1a1a1a; color: #ffffff; padding: 12px 32px; border-radius: 50px; text-decoration: none; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">Rebook Now</a>
          </div>

          <p style="color: #999; font-size: 13px;">Reference: ${params.reference}</p>
        </div>
        <div style="background: #faf9f7; padding: 24px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">${process.env.NEXT_PUBLIC_APP_NAME} | Luxury Hair Experiences</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function appointmentReminderEmail(params: {
  customerName: string;
  serviceName: string;
  stylistName?: string;
  date: string;
  time: string;
  reference: string;
  hoursUntil: number;
}) {
  const urgency =
    params.hoursUntil <= 1
      ? { badge: "#dc2626", badgeBg: "#fef2f2", badgeBorder: "#fecaca", label: "IN 1 HOUR" }
      : { badge: "#2563eb", badgeBg: "#eff6ff", badgeBorder: "#bfdbfe", label: "TOMORROW" };

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #faf9f7; margin: 0; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
        <div style="background: #1a1a1a; padding: 40px; text-align: center;">
          <h1 style="color: #c9a96e; font-size: 24px; margin: 0; letter-spacing: 3px; text-transform: uppercase;">Appointment Reminder</h1>
        </div>
        <div style="padding: 40px;">
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Dear ${params.customerName},</p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">This is a friendly reminder about your upcoming appointment.</p>
          
          <div style="background: ${urgency.badgeBg}; border: 1px solid ${urgency.badgeBorder}; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
            <p style="color: ${urgency.badge}; font-size: 14px; font-weight: 600; margin: 0;">${urgency.label}</p>
          </div>
          
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
            </table>
          </div>

          <p style="color: #666; font-size: 14px; line-height: 1.6;">Please arrive a few minutes early. If you need to reschedule or cancel, kindly let us know as soon as possible.</p>

          <p style="color: #999; font-size: 13px;">Reference: ${params.reference}</p>
        </div>
        <div style="background: #faf9f7; padding: 24px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">${process.env.NEXT_PUBLIC_APP_NAME} | Luxury Hair Experiences</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function passwordResetCodeEmail(params: {
  email: string;
  code: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #faf9f7; margin: 0; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
        <div style="background: #1a1a1a; padding: 40px; text-align: center;">
          <h1 style="color: #c9a96e; font-size: 24px; margin: 0; letter-spacing: 3px; text-transform: uppercase;">Password Reset</h1>
        </div>
        <div style="padding: 40px;">
          <p style="color: #666; font-size: 16px; line-height: 1.6;">You requested a password reset for your account.</p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">Use the code below to reset your password:</p>
          
          <div style="background: #faf9f7; border-radius: 8px; padding: 32px; margin: 32px 0; text-align: center;">
            <p style="color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px;">Your verification code</p>
            <p style="color: #1a1a1a; font-size: 36px; font-weight: 700; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${params.code}</p>
          </div>

          <p style="color: #dc2626; font-size: 13px; line-height: 1.6; text-align: center;">This code expires in 15 minutes.</p>

          <p style="color: #999; font-size: 13px; line-height: 1.6; margin-top: 24px;">If you didn&apos;t request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>
        <div style="background: #faf9f7; padding: 24px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">${process.env.NEXT_PUBLIC_APP_NAME} | Luxury Hair Experiences</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
