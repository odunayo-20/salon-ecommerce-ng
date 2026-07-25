"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useCartStore } from "@/store";

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>}>
      <PaymentCallbackContent />
    </Suspense>
  );
}

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const paymentId = searchParams.get("paymentId");
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("");
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    if (!paymentId) {
      setStatus("failed");
      setMessage("Invalid payment reference");
      return;
    }

    const verify = async () => {
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        try {
          const res = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId }),
          });
          const data = await res.json();

          if (data.success) {
            clearCart(); // Only clear cart when payment is confirmed
            setStatus("success");
            setMessage("Your payment was successful!");
            return;
          }
        } catch { /* retry */ }

        attempts++;
        if (attempts < maxAttempts) {
          await new Promise((r) => setTimeout(r, 2000));
        }
      }

      clearCart(); // Optimistic — webhook will confirm
      setStatus("success");
      setMessage("Your payment is being processed. You will receive a confirmation email shortly.");
    };

    verify();
  }, [paymentId, clearCart]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="bg-white border border-border rounded-2xl p-8 max-w-md w-full text-center space-y-6">
        {status === "loading" && (
          <>
            <Loader2 className="h-16 w-16 text-gold animate-spin mx-auto" />
            <h1 className="font-heading text-2xl font-bold text-charcoal">Processing Payment...</h1>
            <p className="text-sm text-muted-foreground">Please wait while we confirm your payment.</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
            <h1 className="font-heading text-2xl font-bold text-charcoal">Payment Successful!</h1>
            <p className="text-sm text-muted-foreground">{message}</p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link href={orderId ? `/dashboard/orders` : "/dashboard"}>
                <Button className="bg-charcoal text-white hover:bg-charcoal-light rounded-full px-8 text-xs font-semibold tracking-wider uppercase">View Orders</Button>
              </Link>
              <Link href="/shop">
                <Button variant="outline" className="rounded-full px-8 text-xs font-semibold tracking-wider uppercase">Continue Shopping</Button>
              </Link>
            </div>
          </>
        )}
        {status === "failed" && (
          <>
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h1 className="font-heading text-2xl font-bold text-charcoal">Payment Failed</h1>
            <p className="text-sm text-muted-foreground">{message}</p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link href="/shop/checkout">
                <Button className="bg-charcoal text-white hover:bg-charcoal-light rounded-full px-8 text-xs font-semibold tracking-wider uppercase">Try Again</Button>
              </Link>
              <Link href="/shop">
                <Button variant="outline" className="rounded-full px-8 text-xs font-semibold tracking-wider uppercase">Continue Shopping</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
