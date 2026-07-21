"use client";

import { CheckCircle, XCircle, RotateCcw, CreditCard, RefreshCw, ShieldCheck, Mail, Phone } from "lucide-react";

const eligibleItems = [
  "Unused, unopened products in original packaging",
  "Defective or damaged products upon arrival",
  "Wrong item received",
];

const nonReturnable = [
  "Opened or used hair products",
  "Custom-made wigs or units",
  "Gift cards",
  "Sale/clearance items (unless defective)",
  "Beauty tools that have been used",
];

const returnSteps = [
  "Contact our support team via email or phone",
  "Provide your order number and reason for return",
  "Receive a Return Authorization (RA) number",
  "Ship item back with RA number clearly marked",
  "Refund processed within 5-7 business days",
];

const refundInfo = [
  "Refunds issued to original payment method",
  "Processing time: 5-7 business days after we receive the return",
  "Shipping fees are non-refundable (unless the return is due to our error)",
  "Damaged items: Full refund including shipping",
];

const sections = [
  {
    icon: CheckCircle,
    title: "Eligible for Return",
    items: eligibleItems,
    note: "Return window: 14 days from delivery date",
  },
  {
    icon: XCircle,
    title: "Non-Returnable Items",
    items: nonReturnable,
    note: null,
  },
  {
    icon: RotateCcw,
    title: "How to Initiate a Return",
    items: returnSteps,
    note: null,
    numbered: true,
  },
  {
    icon: CreditCard,
    title: "Refund Process",
    items: refundInfo,
    note: null,
  },
];

export default function ReturnsPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-charcoal py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">Return & Refund Policy</h1>
          <p className="text-white/60 mt-2">Our hassle-free return process</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        <p className="text-sm text-muted-foreground">Last updated: January 2024</p>

        {sections.map((section) => (
          <div key={section.title} className="border-l-2 border-gold pl-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 bg-gold/10 rounded-full flex items-center justify-center">
                <section.icon className="h-4.5 w-4.5 text-gold" />
              </div>
              <h2 className="font-heading text-xl font-bold text-charcoal">{section.title}</h2>
            </div>
            {section.numbered ? (
              <ol className="space-y-3">
                {section.items.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 h-6 w-6 bg-gold/10 rounded-full flex items-center justify-center text-[10px] font-bold text-gold">
                      {index + 1}
                    </span>
                    <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="flex-shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-gold" />
                    <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            )}
            {section.note && (
              <p className="mt-4 text-sm font-semibold text-charcoal">{section.note}</p>
            )}
          </div>
        ))}

        <div className="border-l-2 border-gold pl-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 bg-gold/10 rounded-full flex items-center justify-center">
              <RefreshCw className="h-4.5 w-4.5 text-gold" />
            </div>
            <h2 className="font-heading text-xl font-bold text-charcoal">Exchanges</h2>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-gold" />
              <span className="text-sm text-muted-foreground leading-relaxed">Available for defective items only</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-gold" />
              <span className="text-sm text-muted-foreground leading-relaxed">Subject to stock availability</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-gold" />
              <span className="text-sm text-muted-foreground leading-relaxed">Contact support within 14 days</span>
            </li>
          </ul>
        </div>

        <div className="border-l-2 border-gold pl-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 bg-gold/10 rounded-full flex items-center justify-center">
              <ShieldCheck className="h-4.5 w-4.5 text-gold" />
            </div>
            <h2 className="font-heading text-xl font-bold text-charcoal">Damaged Items</h2>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-gold" />
              <span className="text-sm text-muted-foreground leading-relaxed">Report within 48 hours of delivery</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-gold" />
              <span className="text-sm text-muted-foreground leading-relaxed">Provide photos of damage</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-gold" />
              <span className="text-sm text-muted-foreground leading-relaxed">We&apos;ll arrange free pickup and send a replacement or full refund</span>
            </li>
          </ul>
        </div>

        <div className="bg-cream rounded-2xl p-8 md:p-12">
          <h2 className="font-heading text-2xl font-bold text-charcoal tracking-tight mb-4">Questions About Returns?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Our return support team is here to make the process as smooth as possible. Get in touch with us for any return or refund inquiries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="mailto:returns@mecbilltechsalon.com" className="inline-flex items-center gap-2 text-sm text-charcoal font-medium hover:text-gold transition-colors">
              <Mail className="h-4 w-4" />
              returns@mecbilltechsalon.com
            </a>
            <a href="tel:+2348000000000" className="inline-flex items-center gap-2 text-sm text-charcoal font-medium hover:text-gold transition-colors">
              <Phone className="h-4 w-4" />
              +234 800 000 0000
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
