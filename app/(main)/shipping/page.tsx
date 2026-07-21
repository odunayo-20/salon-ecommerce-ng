"use client";

import { Package, Truck, Globe, Clock, Mail, Phone } from "lucide-react";
import Link from "next/link";

const sections = [
  {
    icon: Truck,
    title: "Shipping within Lagos",
    items: [
      { label: "Standard Delivery (1-2 business days)", price: "₦1,500" },
      { label: "Express Delivery (Same day, order before 12PM)", price: "₦3,000" },
      { label: "Free shipping on orders over ₦50,000", price: "Free" },
    ],
  },
  {
    icon: Package,
    title: "Shipping within Nigeria (Outside Lagos)",
    items: [
      { label: "Standard Delivery (3-5 business days)", price: "₦2,500" },
      { label: "Express Delivery (1-2 business days)", price: "₦5,000" },
      { label: "Free shipping on orders over ₦100,000", price: "Free" },
    ],
  },
  {
    icon: Globe,
    title: "International Shipping",
    items: [
      { label: "Currently available to select African countries", price: "" },
      { label: "Delivery: 7-14 business days", price: "" },
      { label: "Rates calculated at checkout", price: "" },
      { label: "Customer responsible for customs duties", price: "" },
    ],
  },
  {
    icon: Clock,
    title: "Order Processing",
    items: [
      { label: "Orders placed Mon-Fri before 2PM are processed same day", price: "" },
      { label: "Weekend orders processed on Monday", price: "" },
      { label: "You'll receive a tracking number via email/SMS", price: "" },
    ],
  },
];

const deliveryPartners = ["GIG Logistics", "Kwik Delivery", "DHL (international)"];

export default function ShippingPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-charcoal py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">Shipping Policy</h1>
          <p className="text-white/60 mt-2">Delivery information for your orders</p>
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
            <ul className="space-y-3">
              {section.items.map((item) => (
                <li key={item.label} className="flex items-start justify-between gap-4">
                  <span className="text-sm text-muted-foreground leading-relaxed">{item.label}</span>
                  {item.price && (
                    <span className="text-sm font-semibold text-charcoal whitespace-nowrap">{item.price}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="border-l-2 border-gold pl-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 bg-gold/10 rounded-full flex items-center justify-center">
              <Truck className="h-4.5 w-4.5 text-gold" />
            </div>
            <h2 className="font-heading text-xl font-bold text-charcoal">Delivery Partners</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {deliveryPartners.map((partner) => (
              <span key={partner} className="text-[10px] bg-cream px-3 py-1 rounded-full text-muted-foreground font-medium">
                {partner}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-cream rounded-2xl p-8 md:p-12">
          <h2 className="font-heading text-2xl font-bold text-charcoal tracking-tight mb-4">Questions About Shipping?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Our support team is ready to help with any shipping inquiries. Reach out to us and we&apos;ll get back to you within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="mailto:support@mecbilltechsalon.com" className="inline-flex items-center gap-2 text-sm text-charcoal font-medium hover:text-gold transition-colors">
              <Mail className="h-4 w-4" />
              support@mecbilltechsalon.com
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
