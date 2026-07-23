"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-charcoal tracking-tight">Check Your Email</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            If an account exists with <strong>{email}</strong>, we&apos;ve sent a 6-digit verification code.
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            The code expires in 15 minutes.
          </p>
          <div className="mt-8 space-y-3">
            <Link href="/auth/verify-code">
              <Button className="w-full bg-charcoal text-white hover:bg-charcoal-light rounded-full py-6 text-xs font-semibold tracking-wider uppercase">
                Enter Verification Code
              </Button>
            </Link>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              className="w-full text-sm text-muted-foreground hover:text-charcoal"
            >
              Use a different email
            </button>
          </div>
          <Link href="/auth/signin" className="inline-flex items-center gap-1 text-sm text-gold hover:text-gold-dark mt-6">
            <ArrowLeft className="h-4 w-4" /> Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-block mb-8">
          <span className="font-heading text-3xl font-semibold text-charcoal tracking-tight">MecBill</span>
          <span className="font-heading text-3xl font-light text-gold ml-0.5">Tech</span>
        </Link>

        <h1 className="font-heading text-2xl font-bold text-charcoal tracking-tight">Forgot Password?</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Enter your email address and we&apos;ll send you a code to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                className="w-full bg-cream border border-border rounded-full pl-10 pr-4 py-3 text-sm text-charcoal placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-charcoal text-white hover:bg-charcoal-light rounded-full py-6 text-xs font-semibold tracking-wider uppercase"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Send Reset Code
          </Button>
        </form>

        <Link href="/auth/signin" className="inline-flex items-center gap-1 text-sm text-gold hover:text-gold-dark mt-6">
          <ArrowLeft className="h-4 w-4" /> Back to Sign In
        </Link>
      </div>
    </div>
  );
}
