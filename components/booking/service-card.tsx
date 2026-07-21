import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  service: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    price: number;
    duration: number;
    image?: string;
    isPopular?: boolean;
    depositAmount?: number;
  };
  category?: string;
}

export function ServiceCard({ service, category }: ServiceCardProps) {
  const href = category
    ? `/book/${category}/${service.slug}`
    : `/book?service=${service.slug}`;

  return (
    <div
      className={cn(
        "group relative bg-white border border-border rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] hover:border-gold/20",
        service.isPopular && "border-gold/30"
      )}
    >
      {service.isPopular && (
        <span className="absolute -top-3 left-6 bg-gold text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Popular
        </span>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-heading text-lg font-semibold text-charcoal group-hover:text-gold transition-colors">
            {service.name}
          </h3>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <Clock className="h-3.5 w-3.5" />
              <span>{service.duration} min</span>
            </div>
          </div>
        </div>
        <span className="text-xl font-heading font-semibold text-charcoal">
          ₦{service.price.toLocaleString()}
        </span>
      </div>

      {service.description && (
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
          {service.description}
        </p>
      )}

      {service.depositAmount && (
        <p className="text-xs text-gold mb-4">
          Deposit: ₦{service.depositAmount.toLocaleString()} to book
        </p>
      )}

      <Button
        asChild
        variant="outline"
        className="w-full group/btn border-charcoal/20 hover:bg-charcoal hover:text-white rounded-full text-xs font-semibold tracking-wider uppercase"
      >
        <Link href={href}>
          Book This Service
          <ArrowRight className="h-3.5 w-3.5 ml-1.5 transition-transform group-hover/btn:translate-x-0.5" />
        </Link>
      </Button>
    </div>
  );
}
