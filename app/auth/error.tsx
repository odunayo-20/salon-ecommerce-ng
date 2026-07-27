"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AuthError]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="bg-white border border-border rounded-2xl p-8 max-w-md w-full text-center space-y-5">
        <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-charcoal">Authentication Error</h1>
          <p className="text-sm text-muted-foreground mt-2">
            There was a problem with authentication. Please try again.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={reset}
            className="bg-charcoal text-white hover:bg-charcoal/90 rounded-full px-6 text-xs font-semibold tracking-wider uppercase"
          >
            Try Again
          </Button>
          <Link href="/auth/signin">
            <Button variant="outline" className="rounded-full px-6 text-xs font-semibold tracking-wider uppercase">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
