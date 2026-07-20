import Flutterwave from "flutterwave-react-v3";

const flutterwaveConfig = {
  public_key: process.env.FLUTTERWAVE_PUBLIC_KEY!,
  secret_key: process.env.FLUTTERWAVE_SECRET_KEY!,
  encryption_key: process.env.FLUTTERWAVE_ENCRYPTION_KEY!,
};

export function getFlutterwaveConfig() {
  return flutterwaveConfig;
}

export async function initializePayment(params: {
  amount: number;
  email: string;
  name?: string;
  phone?: string;
  txRef: string;
  currency?: string;
  redirectUrl?: string;
}) {
  const payload = {
    tx_ref: params.txRef,
    amount: params.amount,
    email: params.email,
    name: params.name,
    phone_number: params.phone,
    currency: params.currency || "NGN",
    redirect_url: params.redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
    meta: {
      concertId: params.txRef,
    },
  };

  const response = await fetch(
    "https://api.flutterwave.com/v3/payments",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  return response.json();
}

export async function verifyTransaction(transactionId: string) {
  const response = await fetch(
    `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
    {
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.json();
}
