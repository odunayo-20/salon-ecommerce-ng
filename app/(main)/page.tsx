"use client";

import Link from "next/link";
import { ArrowRight, Star, Sparkles, Clock, Award, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/product-card";
import { ServiceCard } from "@/components/booking/service-card";
import { BeforeAfterSlider } from "@/components/ui/before-after-slider";
import { ReviewCarousel } from "@/components/ui/review-carousel";
import { InstagramGallery } from "@/components/home/instagram-gallery";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { useServices, useProducts, useFeaturedReviews } from "@/hooks/queries";

const faqItems = [
  { question: "How do I book an appointment?", answer: "You can book directly through our website by selecting your service, preferred stylist, and available time slot. A deposit is required to secure your booking. You can also reach us on WhatsApp for personalized assistance." },
  { question: "What is your cancellation policy?", answer: "We require at least 24 hours notice for cancellations or rescheduling. Deposits are non-refundable within 24 hours of the appointment. Contact us as soon as possible if you need to make changes." },
  { question: "Do you offer hair consultations?", answer: "Yes! We offer free virtual consultations where you can share your hair concerns, desired styles, and reference images. Our experts will recommend the best services and products for your hair type." },
  { question: "What hair products do you use?", answer: "We use only premium, professional-grade products selected for their quality and effectiveness. We also carry our own curated collection of hair care products available in our shop." },
  { question: "Do you sell hair extensions and wigs?", answer: "Yes, we offer a premium collection of human hair extensions, braiding hair, wigs, closures, and frontals. All our hair is ethically sourced and quality-tested. Shop online or visit the salon." },
];

const instagramImages = [
  { src: "", alt: "Hairstyle transformation", href: "https://instagram.com" },
  { src: "", alt: "Braids styling", href: "https://instagram.com" },
  { src: "", alt: "Natural hair care", href: "https://instagram.com" },
  { src: "", alt: "Wig installation", href: "https://instagram.com" },
  { src: "", alt: "Salon interior", href: "https://instagram.com" },
  { src: "", alt: "Hair products", href: "https://instagram.com" },
];

const stats = [
  { icon: Users, value: "10,000+", label: "Happy Clients" },
  { icon: Award, value: "8+", label: "Years Experience" },
  { icon: Sparkles, value: "50+", label: "Services Offered" },
  { icon: Clock, value: "98%", label: "Satisfaction Rate" },
];

interface ApiReview {
  id: string; name: string; rating: number; comment: string;
  service?: string | null; date: string; avatar?: string | null;
}

const fallbackReviews: ApiReview[] = [
  { id: "1", name: "Adaeze O.", rating: 5, comment: "MecBill Tech transformed my hair completely! The knotless braids were painless and so natural-looking. I've never felt more confident.", service: "Knotless Braids", date: "2024-01-15" },
  { id: "2", name: "Folake M.", rating: 5, comment: "The silk press I got here is the best I've ever had. My hair was silky smooth for weeks. The stylists truly know what they're doing.", service: "Silk Press", date: "2024-02-20" },
  { id: "3", name: "Ngozi A.", rating: 5, comment: "I've been coming here for months and my natural hair has never been healthier. Their hair treatments are exceptional.", service: "Natural Hair Treatment", date: "2024-03-10" },
  { id: "4", name: "Blessing E.", rating: 5, comment: "The wig installation was perfection. They took their time, customized everything, and the result was absolutely flawless. Premium service!", service: "Wig Installation", date: "2024-01-28" },
];

export default function HomePage() {
  const { data: svcData, isLoading: svcLoading } = useServices({ isActive: "true", isPopular: "true", limit: 4 });
  const { data: prodData, isLoading: prodLoading } = useProducts({ isActive: "true", isFeatured: "true", limit: 4 });
  const { data: revData, isLoading: revLoading } = useFeaturedReviews(10);

  const services = svcData?.services ?? [];
  const products = prodData?.products ?? [];
  const reviews = revData?.reviews?.length ? revData.reviews : fallbackReviews;
  const loading = svcLoading || prodLoading || revLoading;

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-charcoal overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/95 via-charcoal/80 to-charcoal/60 z-10" />
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-br from-charcoal via-charcoal-light/20 to-charcoal" />
        </div>
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-0">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-gold text-xs font-semibold tracking-[0.2em] uppercase mb-6">
              <span className="w-8 h-px bg-gold" />
              Premium Hair & Beauty
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight">
              Luxury Hair Experiences Crafted For Your <span className="text-gold">Confidence</span>
            </h1>
            <p className="mt-6 text-white/60 text-lg md:text-xl leading-relaxed max-w-lg">
              Professional natural hair care, protective styling, premium extensions and beauty services designed around you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <Button asChild size="lg" className="bg-gold text-white hover:bg-gold-dark rounded-full px-10 py-6 text-xs font-semibold tracking-wider uppercase">
                <Link href="/book">Book Appointment<ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 rounded-full px-10 py-6 text-xs font-semibold tracking-wider uppercase">
                <Link href="/shop">Shop Hair Collection</Link>
              </Button>
            </div>
            <div className="flex items-center gap-8 mt-12 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-8 w-8 rounded-full bg-white/20 border-2 border-charcoal flex items-center justify-center text-[10px] text-white font-bold">{String.fromCharCode(65 + i)}</div>
                  ))}
                </div>
                <div className="text-xs text-white/60"><span className="text-white font-semibold">500+</span> 5-star reviews</div>
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
          {loading ? (
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

      {/* Before/After Transformations */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-gold text-xs font-semibold tracking-[0.2em] uppercase">Transformations</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mt-2 tracking-tight">Real Results, Real Confidence</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">See the incredible transformations our clients experience</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <BeforeAfterSlider beforeImage="" afterImage="" beforeAlt="Before braids" afterAlt="After braids" />
            <BeforeAfterSlider beforeImage="" afterImage="" beforeAlt="Before treatment" afterAlt="After treatment" />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 md:py-28">
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
          {loading ? (
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
      <section className="py-20 md:py-28 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-gold text-xs font-semibold tracking-[0.2em] uppercase">Testimonials</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mt-2 tracking-tight">What Our Clients Say</h2>
          </div>
          <ReviewCarousel reviews={reviews.map((r) => ({ ...r, service: r.service ?? undefined, avatar: r.avatar ?? undefined }))} />
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-gold text-xs font-semibold tracking-[0.2em] uppercase">Why MecBill Tech</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mt-2 tracking-tight">Premium Hair Experiences, <br className="hidden md:block" />Unmatched Results</h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">We don&apos;t just style hair — we transform confidence. Every service at MecBill Tech Salon is delivered with precision, care, and a commitment to excellence that sets us apart.</p>
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
              <div className="aspect-[4/5] bg-cream rounded-2xl overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-gold/20 to-cream flex items-center justify-center"><span className="text-muted-foreground text-sm">Salon Image</span></div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-5 shadow-xl max-w-[200px]">
                <div className="flex items-center gap-1">{[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-gold text-gold" />)}</div>
                <p className="text-xs text-muted-foreground mt-1">Rated 4.9/5 by 500+ clients</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Gallery */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-gold text-xs font-semibold tracking-[0.2em] uppercase">@mecbilltechsalon</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mt-2 tracking-tight">Follow Our Journey</h2>
          </div>
          <InstagramGallery images={instagramImages} />
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

      {/* CTA */}
      <section className="py-20 md:py-28 bg-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">Ready for Your <span className="text-gold">Transformation</span>?</h2>
          <p className="text-white/60 mt-4 max-w-lg mx-auto">Book your appointment today and experience the MecBill Tech difference.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Button asChild size="lg" className="bg-gold text-white hover:bg-gold-dark rounded-full px-10 py-6 text-xs font-semibold tracking-wider uppercase">
              <Link href="/book">Book Appointment<ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 rounded-full px-10 py-6 text-xs font-semibold tracking-wider uppercase">
              <Link href="/consultation">Free Consultation</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
