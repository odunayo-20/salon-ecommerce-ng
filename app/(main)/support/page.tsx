"use client";

import { useState } from "react";
import { Search, Calendar, Package, CreditCard, ShoppingBag, ArrowRight, MessageCircle, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const quickHelp = [
  {
    title: "Booking Help",
    description: "Reschedule, cancel, or modify your appointment",
    icon: Calendar,
    href: "/faq",
  },
  {
    title: "Shipping & Returns",
    description: "Track orders and learn about our return policy",
    icon: Package,
    href: "/shipping",
  },
  {
    title: "Account & Payments",
    description: "Payment methods, plans, and billing questions",
    icon: CreditCard,
    href: "/faq",
  },
  {
    title: "Product Questions",
    description: "Browse products and get recommendations",
    icon: ShoppingBag,
    href: "/shop",
  },
];

const contactOptions = [
  {
    title: "Live Chat",
    subtitle: "Chat with us",
    detail: "Available Mon-Fri 9AM-6PM",
    icon: MessageCircle,
    buttonLabel: "Start Chat",
    href: "#",
  },
  {
    title: "Email",
    subtitle: "support@mecbilltechsalon.com",
    detail: "Response within 24 hours",
    icon: Mail,
    buttonLabel: "Send Email",
    href: "mailto:support@mecbilltechsalon.com",
  },
  {
    title: "Phone",
    subtitle: "+234 800 000 0000",
    detail: "Mon-Fri 9AM-6PM",
    icon: Phone,
    buttonLabel: "Call Now",
    href: "tel:+2348000000000",
  },
];

const popularArticles = [
  { title: "How do I book an appointment?", href: "/faq" },
  { title: "What payment methods do you accept?", href: "/faq" },
  { title: "How do I maintain my braids?", href: "/faq" },
  { title: "Do you offer refunds?", href: "/faq" },
];

export default function SupportPage() {
  const [search, setSearch] = useState("");
  const [helpful, setHelpful] = useState<boolean | null>(null);

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-charcoal py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">
            Help Center
          </h1>
          <p className="text-white/60 mt-2">
            How can we assist you today?
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for help..."
              className="w-full bg-white border border-border rounded-full pl-12 pr-6 py-3 text-sm text-charcoal placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-bold text-charcoal tracking-tight mb-6">
            Quick Help
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickHelp.map((item) => (
              <Link key={item.title} href={item.href}>
                <div className="bg-white border border-border rounded-2xl p-6 hover:border-gold/40 transition-colors cursor-pointer group">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-charcoal group-hover:text-gold transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-bold text-charcoal tracking-tight mb-6">
            Contact Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contactOptions.map((option) => (
              <div
                key={option.title}
                className="bg-white border border-border rounded-2xl p-6 text-center"
              >
                <div className="h-14 w-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <option.icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="font-heading font-bold text-charcoal mb-1">
                  {option.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-1">
                  {option.subtitle}
                </p>
                <p className="text-xs text-muted-foreground/70 mb-4">
                  {option.detail}
                </p>
                <Link href={option.href}>
                  <Button className="bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold tracking-wider uppercase px-6">
                    {option.buttonLabel}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-bold text-charcoal tracking-tight mb-6">
            Popular Articles
          </h2>
          <div className="bg-white border border-border rounded-2xl divide-y divide-border overflow-hidden">
            {popularArticles.map((article) => (
              <Link key={article.title} href={article.href}>
                <div className="flex items-center justify-between px-6 py-4 hover:bg-cream/50 transition-colors cursor-pointer group">
                  <span className="text-sm font-medium text-charcoal group-hover:text-gold transition-colors">
                    {article.title}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-gold transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Was this helpful?
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setHelpful(true)}
              className={`rounded-full text-xs font-semibold tracking-wider uppercase px-6 ${
                helpful === true ? "bg-charcoal text-white border-charcoal" : "border-border text-charcoal"
              }`}
            >
              Yes
            </Button>
            <Button
              variant="outline"
              onClick={() => setHelpful(false)}
              className={`rounded-full text-xs font-semibold tracking-wider uppercase px-6 ${
                helpful === false ? "bg-charcoal text-white border-charcoal" : "border-border text-charcoal"
              }`}
            >
              No
            </Button>
          </div>
          {helpful !== null && (
            <p className="text-xs text-muted-foreground mt-3">
              {helpful ? "Glad we could help!" : "We'll work on improving this page."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
