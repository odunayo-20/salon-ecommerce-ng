"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="font-heading text-2xl font-bold text-charcoal mb-2">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-6">{error.message || "Failed to load dashboard."}</p>
        <div className="flex items-center justify-center gap-4">
          <Button onClick={reset} className="bg-charcoal text-white hover:bg-charcoal-light rounded-full px-8 text-xs font-semibold tracking-wider uppercase">
            Try Again
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" className="rounded-full px-8 text-xs font-semibold tracking-wider uppercase">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
