"use client";

import Link from "next/link";
import { Sparkles, Lightbulb, Users, Heart, Award, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const values = [
  {
    icon: Award,
    title: "Excellence",
    description: "Every service is delivered with meticulous attention to detail. We never compromise on quality, from the products we use to the techniques we employ.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We stay ahead of trends, blending traditional African hair care wisdom with modern techniques to bring you the best in beauty care.",
  },
  {
    icon: Users,
    title: "Community",
    description: "More than a salon, we are a sisterhood. We celebrate each client's unique beauty and foster a space where everyone belongs.",
  },
  {
    icon: Heart,
    title: "Integrity",
    description: "Transparent pricing, honest consultations, and genuine care. We build trust with every interaction and stand behind every service we provide.",
  },
];

const stats = [
  { value: "8+", label: "Years of Excellence" },
  { value: "15,000+", label: "Happy Clients" },
  { value: "50+", label: "Expert Stylists" },
  { value: "2", label: "Prime Locations" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-charcoal py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">About MecBill Tech</h1>
          <p className="text-white/60 mt-2">Celebrating and enhancing natural African beauty since 2018</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-[10px] bg-gold/10 px-3 py-1 rounded-full text-gold font-semibold tracking-wider uppercase inline-block mb-4">Our Story</div>
            <h2 className="font-heading text-2xl font-bold text-charcoal tracking-tight">From a Small Salon to Lagos&apos; Premier Hair Brand</h2>
            <div className="space-y-4 mt-6 text-sm text-muted-foreground leading-relaxed">
              <p>
                Founded in 2018 in the heart of Lagos, MecBill Tech Salon began as a small salon with a big dream: to create a luxury hair and beauty experience rooted in African heritage. What started as a one-chair operation fueled by passion has grown into one of West Africa&apos;s most respected beauty brands.
              </p>
              <p>
                Our founder, Mrs. MecBill, envisioned a space where every woman could walk in and leave feeling like the best version of herself. From our signature braiding techniques to our innovative natural hair treatments, every service we offer reflects our deep commitment to the beauty of African hair.
              </p>
              <p>
                Today, with two premium locations in Victoria Island and Lekki, we continue to raise the standard of luxury hair care across Nigeria and beyond.
              </p>
            </div>
          </div>
          <div className="aspect-square bg-cream rounded-2xl flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-3" />
              <p className="text-sm">Brand Story Image</p>
            </div>
          </div>
        </div>

        <div className="bg-cream rounded-2xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="font-heading text-2xl font-bold text-charcoal tracking-tight">Our Mission & Vision</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-border rounded-2xl p-8">
              <div className="h-10 w-10 bg-gold/10 rounded-full flex items-center justify-center mb-4">
                <Star className="h-5 w-5 text-gold" />
              </div>
              <h3 className="font-heading text-lg font-bold text-charcoal mb-3">Our Mission</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To celebrate and enhance natural African beauty through world-class hair and beauty services, empowering every client to embrace their unique identity with confidence and pride.
              </p>
            </div>
            <div className="bg-white border border-border rounded-2xl p-8">
              <div className="h-10 w-10 bg-gold/10 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="h-5 w-5 text-gold" />
              </div>
              <h3 className="font-heading text-lg font-bold text-charcoal mb-3">Our Vision</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To be West Africa&apos;s most trusted luxury hair brand — a symbol of excellence, innovation, and authentic African beauty that inspires a new generation of confident women.
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="text-center mb-12">
            <h2 className="font-heading text-2xl font-bold text-charcoal tracking-tight">What We Stand For</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">The core principles that guide everything we do at MecBill Tech</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title} className="bg-white border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="h-10 w-10 bg-gold/10 rounded-full flex items-center justify-center mb-4">
                  <value.icon className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-heading font-bold text-charcoal mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-charcoal rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-heading text-3xl md:text-4xl font-bold text-gold">{stat.value}</p>
                <p className="text-sm text-white/60 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <div className="aspect-square bg-cream rounded-2xl flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-3" />
                <p className="text-sm">Founder Photo</p>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="text-[10px] bg-gold/10 px-3 py-1 rounded-full text-gold font-semibold tracking-wider uppercase inline-block mb-4">Meet Our Founder</div>
            <h2 className="font-heading text-2xl font-bold text-charcoal tracking-tight">Mrs. MecBill</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mt-4">
              A visionary entrepreneur with an unwavering passion for African hair care, Mrs. MecBill founded the brand from her deep love for celebrating natural beauty. Her journey from a single chair to building one of Lagos&apos; most respected beauty brands is a testament to her dedication, creativity, and belief that every woman deserves to feel extraordinary.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-4">
              Under her leadership, MecBill Tech Salon has grown from a neighbourhood secret to a luxury destination, earning the trust and loyalty of over 15,000 clients and counting. Her hands-on approach and commitment to excellence set the tone for every experience within the brand.
            </p>
          </div>
        </div>

        <div className="bg-cream rounded-2xl p-8 md:p-12 text-center">
          <h2 className="font-heading text-2xl font-bold text-charcoal tracking-tight">Ready to Experience MecBill?</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">Whether you need a fresh style, premium products, or expert advice, we are here to help you look and feel your absolute best.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button asChild className="bg-charcoal text-white hover:bg-charcoal-light rounded-full text-xs font-semibold tracking-wider uppercase px-6">
              <Link href="/book">Book an Appointment</Link>
            </Button>
            <Button asChild className="bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold tracking-wider uppercase px-6">
              <Link href="/shop">Shop Products <ArrowRight className="h-3.5 w-3.5 ml-1.5" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
