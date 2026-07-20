import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
  typescript: true,
});

export async function createPaymentIntent(
  amount: number,
  currency: string = "ngn",
  metadata?: Record<string, string>
) {
  return stripe.paymentIntents.create({
    amount,
    currency,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });
}

export async function createCheckoutSession(params: {
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  customerEmail?: string;
}) {
  return stripe.checkout.sessions.create({
    mode: "payment",
    line_items: params.lineItems,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
    customer_email: params.customerEmail,
    payment_intent_data: {
      metadata: params.metadata,
    },
  });
}

export async function retrievePaymentIntent(id: string) {
  return stripe.paymentIntents.retrieve(id);
}

export async function createRefund(
  paymentIntentId: string,
  amount?: number
) {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount,
  });
}

export function constructWebhookEvent(
  payload: Buffer,
  signature: string
) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
