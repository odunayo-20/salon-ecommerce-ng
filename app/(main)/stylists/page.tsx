"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Scissors, Clock, Award, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePublicStylists } from "@/hooks/queries";

function RatingStars({ rating, count }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`h-3.5 w-3.5 ${i < rating ? "text-gold fill-gold" : "text-border"}`} />
        ))}
      </div>
      {count !== undefined && <span className="text-xs text-muted-foreground">({count})</span>}
    </div>
  );
}

export default function StylistsPage() {
  const { data, isLoading: loading } = usePublicStylists();
  const stylists = data?.stylists ?? [];

  const featured = stylists[0];
  const rest = stylists.slice(1);

  return (
    <div className="min-h-screen">
      <div className="bg-charcoal py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">Our Stylists</h1>
          <p className="text-white/60 mt-2">Meet the talented artists who bring your hair dreams to life</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="h-8 w-8 text-gold animate-spin mx-auto" /></div>
        ) : stylists.length === 0 ? (
          <div className="py-20 text-center"><p className="text-muted-foreground">No stylists available yet.</p></div>
        ) : (
          <>
            {featured && (
              <div className="bg-cream rounded-2xl p-6 md:p-10">
                <div className="grid md:grid-cols-5 gap-8 items-center">
                  <div className="md:col-span-2">
                    <div className="aspect-square relative bg-white border border-border rounded-2xl overflow-hidden">
                      <Image
                        src={featured.user.image || "https://images.unsplash.com/photo-1595959183077-51a5c378eec7?q=80&w=1000"}
                        alt={featured.user.name || "Stylist"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        priority
                      />
                    </div>
                  </div>
                  <div className="md:col-span-3">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] bg-gold/10 px-3 py-1 rounded-full text-gold font-semibold tracking-wider uppercase">Featured Stylist</span>
                    </div>
                    <h2 className="font-heading text-2xl font-bold text-charcoal">{featured.user.name}</h2>
                    <p className="text-sm text-gold font-medium mt-1">{featured.specialties[0] || "Stylist"}</p>
                    <RatingStars rating={4 + Math.min(featured.appointmentCount / 100, 1)} count={featured.appointmentCount} />
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{featured.experience} years experience</div>
                      <div className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5" />Top Rated</div>
                    </div>
                    {featured.bio && <p className="text-sm text-muted-foreground leading-relaxed mt-4">{featured.bio}</p>}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {featured.specialties.map((spec) => (
                        <span key={spec} className="text-[10px] bg-white px-3 py-1 rounded-full text-muted-foreground font-medium">{spec}</span>
                      ))}
                    </div>
                    <Button asChild className="bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold tracking-wider uppercase px-6 mt-6">
                      <Link href="/book">Book with {featured.user.name?.split(" ")[0]}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {rest.length > 0 && (
              <div>
                <div className="text-center mb-10">
                  <h2 className="font-heading text-2xl font-bold text-charcoal tracking-tight">Meet Our Team</h2>
                  <p className="text-sm text-muted-foreground mt-2">Every stylist at MecBill Tech is handpicked for their skill, passion, and dedication</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((stylist, index) => (
                    <div key={stylist.id} className="bg-white border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow group">
                      <div className="aspect-[4/3] bg-cream relative overflow-hidden">
                        <Image
                          src={stylist.user.image || `https://images.unsplash.com/photo-${
                            index === 0
                              ? "1534528741775-53994a69daeb"
                              : index === 1
                              ? "1507003211169-0a1dd7228f2d"
                              : "1544005313-94ddf0286df2"
                          }?q=80&w=1000`}
                          alt={stylist.user.name || "Stylist"}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                        <div className="absolute top-3 right-3 text-[10px] bg-white px-2.5 py-1 rounded-full text-muted-foreground font-medium shadow-sm">{stylist.experience} yrs</div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-heading font-bold text-charcoal">{stylist.user.name}</h3>
                        <p className="text-xs text-gold font-medium mt-0.5">{stylist.specialties[0] || "Stylist"}</p>
                        <RatingStars rating={4} />
                        {stylist.bio && <p className="text-sm text-muted-foreground leading-relaxed mt-3 line-clamp-3">{stylist.bio}</p>}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {stylist.specialties.map((spec) => (
                            <span key={spec} className="text-[10px] bg-cream px-2.5 py-0.5 rounded-full text-muted-foreground font-medium">{spec}</span>
                          ))}
                        </div>
                        <Button asChild className="w-full bg-charcoal text-white hover:bg-charcoal-light rounded-full text-xs font-semibold tracking-wider uppercase mt-5">
                          <Link href="/book">Book with {stylist.user.name?.split(" ")[0]}</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="bg-cream rounded-2xl p-8 md:p-12 text-center">
          <h2 className="font-heading text-2xl font-bold text-charcoal tracking-tight">Want to Join Our Team?</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">We are always looking for talented, passionate stylists who share our commitment to excellence and African beauty.</p>
          <Button asChild className="bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold tracking-wider uppercase px-6 mt-8">
            <Link href="/careers">View Open Positions <ArrowRight className="h-3.5 w-3.5 ml-1.5" /></Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
