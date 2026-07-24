"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="text-center max-w-md">
        <h2 className="font-heading text-2xl font-bold text-charcoal mb-2">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-6">{error.message || "An unexpected error occurred."}</p>
        <Button onClick={reset} className="bg-charcoal text-white hover:bg-charcoal-light rounded-full px-8 text-xs font-semibold tracking-wider uppercase">
          Try Again
        </Button>
      </div>
    </div>
  );
}
