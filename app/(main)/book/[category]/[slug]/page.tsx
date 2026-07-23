"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Clock, CheckCircle2, ChevronDown, Star, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/reviews/review-form";
import { cn } from "@/lib/utils";

interface Stylist {
  id: string; name: string | null; image: string | null;
  specialties: string[]; experience: number | null;
}
interface Review {
  rating: number; comment: string | null; createdAt: string;
  user: { name: string | null } | null;
}
interface ServiceDetail {
  id: string; name: string; slug: string; description: string | null;
  price: number; duration: number; isPopular: boolean; depositAmount: number | null;
  category: { id: string; name: string; slug: string; type: string };
  stylists: Stylist[];
  reviews: Review[];
  rating: number;
  reviewCount: number;
}

export default function ServiceDetailPage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { slug } = use(params);
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/services?slug=${slug}`);
        if (!res.ok) { setNotFound(true); return; }
        const data = await res.json();
        setService(data.service);
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    })();
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen bg-cream flex items-center justify-center"><Loader2 className="h-8 w-8 text-gold animate-spin" /></div>;
  }

  if (notFound || !service) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="bg-charcoal py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">Service Not Found</h1>
            <p className="text-white/60 mt-2">The service you&apos;re looking for doesn&apos;t exist.</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center">
          <Link href="/book"><Button className="bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold tracking-wider uppercase px-8">Browse All Services</Button></Link>
        </div>
      </div>
    );
  }

  const deposit = service.depositAmount || Math.round(service.price * 0.3);

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-charcoal py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <nav className="flex items-center justify-center gap-2 text-sm mb-4">
            <Link href="/" className="text-white/40 hover:text-white transition-colors">Home</Link>
            <span className="text-white/20">/</span>
            <Link href="/book" className="text-white/40 hover:text-white transition-colors">Book</Link>
            <span className="text-white/20">/</span>
            <span className="text-white/40">{service.category?.name || "Services"}</span>
            <span className="text-white/20">/</span>
            <span className="text-white">{service.name}</span>
          </nav>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">{service.name}</h1>
          {service.description && <p className="text-white/60 mt-2">{service.description}</p>}
          <div className="flex items-center justify-center gap-3 mt-4">
            {service.isPopular && <span className="text-[10px] bg-gold/20 text-gold px-3 py-1 rounded-full font-bold uppercase tracking-wider">Popular</span>}
            <span className="text-[10px] bg-white/10 text-white/70 px-3 py-1 rounded-full font-medium">₦{service.price.toLocaleString()}</span>
            <span className="text-[10px] bg-white/10 text-white/70 px-3 py-1 rounded-full font-medium">{service.duration} min</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">
            <Link href="/book" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors mb-4">
              <ArrowLeft className="h-4 w-4" />Back to all services
            </Link>

            <div className="aspect-[16/9] bg-cream border border-border rounded-2xl overflow-hidden flex items-center justify-center">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
                  <span className="font-heading text-2xl font-bold text-gold">{service.name.charAt(0)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{service.name}</p>
              </div>
            </div>

            {service.description && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
              </div>
            )}

            {/* Stylists */}
            {service.stylists.length > 0 && (
              <div>
                <h2 className="font-heading text-2xl font-bold text-charcoal tracking-tight mb-5">Our Stylists</h2>
                <div className="space-y-4">
                  {service.stylists.map((stylist) => (
                    <div key={stylist.id} className="bg-white border border-border rounded-2xl p-6 flex flex-col sm:flex-row items-start gap-5">
                      <div className="h-16 w-16 rounded-full bg-cream flex items-center justify-center shrink-0">
                        <span className="font-heading text-xl font-semibold text-gold">{stylist.name?.charAt(0) || "?"}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading font-semibold text-charcoal text-lg">{stylist.name}</h3>
                        {stylist.experience && <p className="text-xs text-muted-foreground mt-0.5">{stylist.experience} years experience</p>}
                        {stylist.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {stylist.specialties.map((spec) => (
                              <span key={spec} className="text-[10px] bg-cream px-3 py-1 rounded-full text-muted-foreground font-medium">{spec}</span>
                            ))}
                          </div>
                        )}
                        <div className="mt-4">
                          <Link href="/book"><Button className="bg-charcoal text-white hover:bg-charcoal-light rounded-full text-xs font-semibold tracking-wider uppercase px-6">Book with {stylist.name?.split(" ")[0]}</Button></Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-charcoal tracking-tight mb-5">Reviews</h2>
              <div className="space-y-6">
                <ReviewForm serviceId={service.id} itemName={service.name} />
                {service.reviews.map((review, i) => (
                  <div key={i} className="border-b border-border pb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-0.5">{[...Array(5)].map((_, j) => <Star key={j} className={cn("h-3 w-3", j < review.rating ? "fill-gold text-gold" : "text-gray-200")} />)}</div>
                      <span className="text-sm font-medium text-charcoal">{review.user?.name || "Customer"}</span>
                    </div>
                    {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              <div className="bg-white border border-border rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="font-heading text-xl font-bold text-charcoal">{service.name}</h3>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" /><span>{service.duration} minutes</span>
                  </div>
                  {service.rating > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="h-4 w-4 fill-gold text-gold" />
                      <span className="text-sm font-medium text-charcoal">{service.rating}</span>
                      <span className="text-xs text-muted-foreground">({service.reviewCount} reviews)</span>
                    </div>
                  )}
                </div>
                <div><span className="font-heading text-3xl font-bold text-charcoal">₦{service.price.toLocaleString()}</span></div>
                <div className="bg-cream rounded-xl p-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-charcoal">Deposit required: </span>
                    ₦{deposit.toLocaleString()} secures your booking. The remaining ₦{(service.price - deposit).toLocaleString()} is due at the salon.
                  </p>
                </div>
                <Link href="/book" className="block">
                  <Button className="w-full bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold tracking-wider uppercase px-8 py-3">Book Now</Button>
                </Link>
                <div className="text-center"><Link href="/contact" className="text-xs text-muted-foreground hover:text-gold transition-colors">Have a question? Contact us</Link></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
