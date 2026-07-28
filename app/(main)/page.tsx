"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, Sparkles, Award, Users, Loader2, Check, Globe, ShieldCheck, Truck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/shop/product-card";
import { ServiceCard } from "@/components/booking/service-card";
import { ReviewCarousel } from "@/components/ui/review-carousel";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { useServices, useProducts, useFeaturedReviews } from "@/hooks/queries";

const faqItems = [
  { question: "How do I book an appointment?", answer: "You can book directly through our website by selecting your service, preferred stylist, and available time slot. A deposit is required to secure your booking. You can also reach us on WhatsApp for personalized assistance." },
  { question: "What is your cancellation policy?", answer: "We require at least 24 hours notice for cancellations or rescheduling. Deposits are non-refundable within 24 hours of the appointment. Contact us as soon as possible if you need to make changes." },
  { question: "Do you offer hair consultations?", answer: "Yes! We offer free virtual consultations where you can share your hair concerns, desired styles, and reference images. Our experts will recommend the best services and products for your hair type." },
  { question: "What hair products do you use?", answer: "We use only premium, professional-grade products selected for their quality and effectiveness. We also carry our own curated collection of hair care products available in our shop." },
  { question: "Do you sell hair extensions and wigs?", answer: "Yes, we offer a premium collection of human hair extensions, braiding hair, wigs, closures, and frontals. All our hair is ethically sourced and quality-tested. Shop online or visit the salon." },
];

const stats = [
  { icon: Users, value: "10,000+", label: "Happy Clients" },
  { icon: Award, value: "8+", label: "Years Experience" },
  { icon: Sparkles, value: "50+", label: "Services Offered" },
  { icon: Star, value: "4.9", label: "Average Rating" },
];

interface ApiReview {
  id: string; name: string; rating: number; comment: string;
  service?: string | null; date: string; avatar?: string | null;
}

const fallbackReviews: ApiReview[] = [
  { id: "1", name: "Adaeze O.", rating: 5, comment: "MecBill Tech transformed my hair completely! The knotless braids were painless and so natural-looking. I've never felt more confident.", service: "Knotless Braids", date: "2024-01-15" },
  { id: "2", name: "Sarah K. — London", rating: 5, comment: "Ordered online and the hair extensions arrived beautifully packaged. The quality is exceptional — silky, tangle-free, and exactly as described. Will order again!", service: "Hair Extensions", date: "2024-02-20" },
  { id: "3", name: "Mariam T. — Dubai", rating: 5, comment: "I was nervous ordering internationally but the process was seamless. The lace wig looks stunning and the customer support was incredibly responsive.", service: "Lace Wig", date: "2024-03-10" },
  { id: "4", name: "Blessing E.", rating: 5, comment: "The wig installation was perfection. They took their time, customized everything, and the result was absolutely flawless. Premium service!", service: "Wig Installation", date: "2024-01-28" },
  { id: "5", name: "Amara D. — Toronto", rating: 5, comment: "The braiding hair I bought shipped fast and arrived in perfect condition. You can feel the quality difference immediately. Highly recommended!", service: "Braiding Hair", date: "2024-04-05" },
];

export default function HomePage() {
  const { data: svcData, isLoading: svcLoading } = useServices({ isActive: "true", isPopular: "true", limit: 4 });
  const { data: prodData, isLoading: prodLoading } = useProducts({ isActive: "true", isFeatured: "true", limit: 4 });
  const { data: revData, isLoading: revLoading } = useFeaturedReviews(10);

  const services = svcData?.services ?? [];
  const products = prodData?.products ?? [];
  const reviews = revData?.reviews?.length ? revData.reviews : fallbackReviews;

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [newsletterMsg, setNewsletterMsg] = useState("");

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail, source: "homepage" }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewsletterStatus("success");
        setNewsletterMsg(data.message);
        setNewsletterEmail("");
      } else {
        setNewsletterStatus("error");
        setNewsletterMsg(data.error || "Something went wrong");
      }
    } catch {
      setNewsletterStatus("error");
      setNewsletterMsg("Something went wrong");
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-charcoal overflow-hidden">
        {/* Real background image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1920"
            alt="Premium salon experience"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/96 via-charcoal/85 to-charcoal/40 z-10" />
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-0 w-full">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-gold text-xs font-semibold tracking-[0.2em] uppercase mb-6">
              <span className="w-8 h-px bg-gold" />
              Premium Hair &amp; Beauty
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight">
              Luxury Hair Experiences<br className="hidden sm:block" /> Crafted For Your <span className="text-gold">Confidence</span>
            </h1>
            <p className="mt-6 text-white/65 text-lg md:text-xl leading-relaxed max-w-lg">
              Professional natural hair care, protective styling, premium extensions and beauty services, in-salon or delivered worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <Button asChild size="lg" className="bg-gold text-white hover:bg-gold-dark rounded-full px-10 py-6 text-xs font-semibold tracking-wider uppercase shadow-lg shadow-gold/20">
                <Link href="/book">Book Appointment<ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/20 text-white bg-white/10 hover:border-white/40 rounded-full px-10 py-6 text-xs font-semibold tracking-wider uppercase transition-all">
                <Link href="/shop">Shop Hair Collection</Link>
              </Button>
            </div>

            {/* Social proof + trust */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-12 pt-8 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[
                    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=80&h=80&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=80&h=80&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80&h=80&fit=crop&q=80",
                  ].map((src, i) => (
                    <div key={i} className="h-9 w-9 rounded-full border-2 border-charcoal overflow-hidden relative">
                      <Image src={src} alt="Happy client" fill className="object-cover" sizes="36px" />
                    </div>
                  ))}
                </div>
                <div className="text-xs text-white/70">
                  <span className="text-white font-semibold">500+</span> 5-star reviews
                </div>
              </div>
              {/* International trust badges */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-white/50 text-[10px] tracking-wider uppercase font-semibold">
                  <span className="text-base">🌍</span> Ships Worldwide
                </div>
                <span className="text-white/20">|</span>
                <div className="flex items-center gap-1.5 text-white/50 text-[10px] tracking-wider uppercase font-semibold">
                  <span className="text-base">🔒</span> Secure Checkout
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {stats.map((stat) => (
              <div key={stat.label} className="py-8 md:py-12 text-center">
                <stat.icon className="h-5 w-5 text-gold mx-auto mb-3" />
                <p className="font-heading text-2xl md:text-3xl font-bold text-charcoal">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1 tracking-wider uppercase">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works — key for remote/international clients */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-gold text-xs font-semibold tracking-[0.2em] uppercase">Simple Process</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mt-2 tracking-tight">How It Works</h2>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto text-sm">Whether you're local or ordering from abroad, getting started is effortless.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line — desktop only */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            {[
              { step: "01", icon: MessageCircle, title: "Book or Browse", desc: "Book an in-salon appointment online or browse our curated hair collection and place an order; we ship worldwide." },
              { step: "02", icon: ShieldCheck, title: "Secure & Confirm", desc: "Pay securely via card or bank transfer. You'll receive an instant confirmation and order tracking details." },
              { step: "03", icon: Truck, title: "Experience & Receive", desc: "Visit us for your appointment or receive your order delivered to your door, anywhere in the world." },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="relative mb-6">
                  <div className="h-20 w-20 rounded-full bg-cream border border-border flex items-center justify-center group-hover:border-gold/50 group-hover:bg-gold/5 transition-all duration-300">
                    <item.icon className="h-8 w-8 text-gold" />
                  </div>
                  <span className="absolute -top-1 -right-1 text-[10px] font-bold text-gold bg-white border border-gold/30 rounded-full h-5 w-5 flex items-center justify-center">{item.step}</span>
                </div>
                <h3 className="font-heading font-semibold text-charcoal text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-gold text-xs font-semibold tracking-[0.2em] uppercase">Our Services</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mt-2 tracking-tight">Popular Services</h2>
            </div>
            <Button asChild variant="ghost" className="text-gold hover:text-gold-dark self-start md:self-auto">
              <Link href="/book">View All Services<ArrowRight className="h-4 w-4 ml-1.5" /></Link>
            </Button>
          </div>
          {svcLoading ? (
            <div className="py-12 text-center"><Loader2 className="h-6 w-6 text-gold animate-spin mx-auto" /></div>
          ) : services.length === 0 ? (
            <div className="py-12 text-center"><p className="text-muted-foreground text-sm">No services available yet.</p></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service) => (
                <ServiceCard key={service.id} service={{
                  ...service,
                  description: service.description ?? undefined,
                  isPopular: service.isPopular ?? undefined,
                }} category={service.category?.type === "service" ? service.category.slug : undefined} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-gold text-xs font-semibold tracking-[0.2em] uppercase">Hair Collection</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mt-2 tracking-tight">Featured Products</h2>
            </div>
            <Button asChild variant="ghost" className="text-gold hover:text-gold-dark self-start md:self-auto">
              <Link href="/shop">Shop All Products<ArrowRight className="h-4 w-4 ml-1.5" /></Link>
            </Button>
          </div>
          {prodLoading ? (
            <div className="py-12 text-center"><Loader2 className="h-6 w-6 text-gold animate-spin mx-auto" /></div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center"><p className="text-muted-foreground text-sm">No products available yet.</p></div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={{
                  id: p.id, name: p.name, slug: p.slug, price: p.price,
                  comparePrice: p.comparePrice ?? undefined,
                  image: p.images?.[0] ?? undefined, rating: p.rating ?? 0,
                  reviewCount: p.reviewCount, stock: p.stock,
                }} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Client Reviews */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-gold text-xs font-semibold tracking-[0.2em] uppercase">Testimonials</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mt-2 tracking-tight">What Our Clients Say</h2>
          </div>
          <ReviewCarousel reviews={reviews.map((r) => ({ ...r, service: r.service ?? undefined, avatar: r.avatar ?? undefined }))} />
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-gold text-xs font-semibold tracking-[0.2em] uppercase">Why MecBill Tech</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mt-2 tracking-tight">Premium Hair Experiences, <br className="hidden md:block" />Unmatched Results</h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">We don&apos;t just style hair, we transform confidence. Every service at MecBill Tech Salon is delivered with precision, care, and a commitment to excellence that sets us apart.</p>
              <div className="space-y-6 mt-10">
                {[
                  { title: "Expert Stylists", desc: "Our team undergoes continuous training in the latest techniques and trends." },
                  { title: "Premium Products", desc: "We exclusively use professional-grade, ethically sourced products." },
                  { title: "Personalized Experience", desc: "Every client receives a consultation tailored to their unique hair needs." },
                  { title: "Luxury Environment", desc: "A sophisticated salon space designed for your comfort and relaxation." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-6 w-6 rounded-full bg-gold/10 flex items-center justify-center shrink-0 mt-0.5"><Sparkles className="h-3 w-3 text-gold" /></div>
                    <div><h3 className="font-semibold text-charcoal">{item.title}</h3><p className="text-sm text-muted-foreground mt-1">{item.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] relative bg-cream rounded-2xl overflow-hidden border border-border">
                <Image
                  src="https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=1000"
                  alt="MecBill Tech Salon Styling"
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-5 shadow-xl max-w-[200px] border border-border">
                <div className="flex items-center gap-1">{[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-gold text-gold" />)}</div>
                <p className="text-xs text-muted-foreground mt-1">Rated 4.9/5 by 500+ clients</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-charcoal to-charcoal/90" />
        <div className="absolute inset-0 opacity-10">
          <Image
            src="https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?q=80&w=1920"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-gold text-xs font-semibold tracking-[0.2em] uppercase">Stay Connected</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mt-2 tracking-tight">Join the MecBill Community</h2>
          <p className="text-white/60 mt-3 max-w-lg mx-auto">Get exclusive offers, hair care tips, and first access to new products, wherever you are in the world.</p>
          <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 mt-8 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Your email address"
              value={newsletterEmail}
              onChange={(e) => { setNewsletterEmail(e.target.value); setNewsletterStatus("idle"); }}
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-full focus:bg-white/15 focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
              required
            />
            <Button type="submit" disabled={newsletterStatus === "loading"} className="bg-gold text-white hover:bg-gold-dark rounded-full px-8 text-xs font-semibold tracking-wider uppercase shadow-lg shadow-gold/20 shrink-0">
              {newsletterStatus === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
            </Button>
          </form>
          {newsletterStatus === "success" && <p className="text-sm text-emerald-400 mt-4 flex items-center justify-center gap-1"><Check className="h-4 w-4" />{newsletterMsg}</p>}
          {newsletterStatus === "error" && <p className="text-sm text-red-400 mt-4">{newsletterMsg}</p>}
          <p className="text-white/30 text-xs mt-4">No spam, ever. Unsubscribe at any time.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-gold text-xs font-semibold tracking-[0.2em] uppercase">FAQ</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mt-2 tracking-tight">Frequently Asked Questions</h2>
          </div>
          <FAQAccordion items={faqItems} />
        </div>
      </section>

      {/* Global Trust Strip */}
      <section className="py-12 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {[
              { icon: Globe, label: "Ships to 50+ Countries" },
              { icon: ShieldCheck, label: "Secure Payments" },
              { icon: Truck, label: "Fast International Delivery" },
              { icon: Star, label: "4.9 ★ Trusted Worldwide" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 text-charcoal/70">
                <item.icon className="h-5 w-5 text-gold shrink-0" />
                <span className="text-sm font-medium tracking-wide">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block text-gold text-xs font-semibold tracking-[0.2em] uppercase mb-4">Book or Order Today</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">Ready for Your <span className="text-gold">Transformation</span>?</h2>
          <p className="text-white/60 mt-4 max-w-lg mx-auto">Visit us in-salon or shop our premium hair collection, delivered to your door, wherever you are.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Button asChild size="lg" className="bg-gold text-white hover:bg-gold-dark rounded-full px-10 py-6 text-xs font-semibold tracking-wider uppercase shadow-lg shadow-gold/20">
              <Link href="/book">Book Appointment<ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/25 text-white bg-white/10 hover:border-white/40 rounded-full px-10 py-6 text-xs font-semibold tracking-wider uppercase transition-all">
              <Link href="/consultation">Free Consultation</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
