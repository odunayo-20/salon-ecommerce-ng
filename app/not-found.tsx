import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-heading font-bold text-gold mb-4">404</p>
        <h2 className="font-heading text-2xl font-bold text-charcoal mb-2">Page Not Found</h2>
        <p className="text-sm text-muted-foreground mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button className="bg-charcoal text-white hover:bg-charcoal-light rounded-full px-8 text-xs font-semibold tracking-wider uppercase">
              Back to Home
            </Button>
          </Link>
          <Link href="/shop">
            <Button variant="outline" className="rounded-full px-8 text-xs font-semibold tracking-wider uppercase">
              Browse Shop
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
