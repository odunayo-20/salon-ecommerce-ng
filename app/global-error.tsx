"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="bg-white border border-border rounded-2xl p-8 max-w-md w-full text-center space-y-5">
          <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-charcoal">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mt-2">
              An unexpected error occurred. Our team has been notified.
            </p>
            {error.digest && (
              <p className="text-[10px] text-muted-foreground mt-2 font-mono">
                Error ID: {error.digest}
              </p>
            )}
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={reset}
              className="bg-charcoal text-white hover:bg-charcoal/90 rounded-full px-6 text-xs font-semibold tracking-wider uppercase"
            >
              Try Again
            </Button>
            <Link href="/">
              <Button variant="outline" className="rounded-full px-6 text-xs font-semibold tracking-wider uppercase">
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
