"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function AppointmentPaymentCallbackPage() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");
  const paymentId = searchParams.get("paymentId");
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("");

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
            setStatus("success");
            setMessage("Your payment was successful! Your appointment is confirmed.");
            return;
          }
        } catch { /* retry */ }

        attempts++;
        if (attempts < maxAttempts) {
          await new Promise((r) => setTimeout(r, 2000));
        }
      }

      setStatus("success");
      setMessage("Your payment is being processed. You will receive a confirmation shortly.");
    };

    verify();
  }, [paymentId]);

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
              <Link href="/dashboard">
                <Button className="bg-charcoal text-white hover:bg-charcoal-light rounded-full px-8 text-xs font-semibold tracking-wider uppercase">View Appointments</Button>
              </Link>
              <Link href="/book">
                <Button variant="outline" className="rounded-full px-8 text-xs font-semibold tracking-wider uppercase">Book Another</Button>
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
              <Link href="/dashboard">
                <Button className="bg-charcoal text-white hover:bg-charcoal-light rounded-full px-8 text-xs font-semibold tracking-wider uppercase">Go to Dashboard</Button>
              </Link>
              <Link href="/book">
                <Button variant="outline" className="rounded-full px-8 text-xs font-semibold tracking-wider uppercase">Try Again</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
