const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

export async function initializeTransaction(params: {
  amount: number;
  email: string;
  name?: string;
  phone?: string;
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}) {
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(params.amount * 100), // Paystack uses kobo
      email: params.email,
      name: params.name,
      phone: params.phone,
      reference: params.reference,
      callback_url: params.callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/shop/payment/callback`,
      metadata: params.metadata || {},
    }),
  });

  return response.json();
}

export async function verifyTransaction(reference: string) {
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.json();
}

export function verifyWebhookSignature(body: string, signature: string | null): boolean {
  if (!signature) return false;
  const crypto = require("crypto");
  const hash = crypto.createHmac("sha512", process.env.PAYSTACK_WEBHOOK_SECRET || "").update(body).digest("hex");
  return hash === signature;
}
