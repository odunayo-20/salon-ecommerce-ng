"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, Hash, MessageCircle, MapPin, Phone, Mail, ChevronDown } from "lucide-react";
import { NewsletterForm } from "./newsletter-form";
import { cn } from "@/lib/utils";

const footerLinks = {
  services: [
    { label: "Braids", href: "/book/hair/braids" },
    { label: "Knotless Braids", href: "/book/hair/knotless-braids" },
    { label: "Wig Installation", href: "/book/hair/wig-installation" },
    { label: "Silk Press", href: "/book/hair/silk-press" },
    { label: "Loc Maintenance", href: "/book/hair/loc-maintenance" },
    { label: "Nail Services", href: "/book/nails/acrylic" },
  ],
  shop: [
    { label: "Hair Extensions", href: "/shop/hair-extensions" },
    { label: "Wigs", href: "/shop/wigs" },
    { label: "Hair Care", href: "/shop/hair-care" },
    { label: "Beauty Products", href: "/shop/beauty" },
    { label: "Gift Cards", href: "/shop/gift-cards" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Our Stylists", href: "/stylists" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  support: [
    { label: "FAQ", href: "/faq" },
    { label: "Shipping Policy", href: "/shipping" },
    { label: "Return Policy", href: "/returns" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

const socialLinks = [
  { icon: Hash, href: "https://instagram.com", label: "Instagram" },
  { icon: Globe, href: "https://facebook.com", label: "Facebook" },
  { icon: MessageCircle, href: "https://twitter.com", label: "Twitter" },
];

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* Mobile: collapsible */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between md:pointer-events-none py-3 md:py-0 border-b border-white/10 md:border-0"
      >
        <h4 className="text-xs font-semibold tracking-wider uppercase text-white/80">
          {title}
        </h4>
        <ChevronDown className={cn("h-4 w-4 text-white/40 transition-transform md:hidden", open && "rotate-180")} />
      </button>
      <ul className={cn("space-y-2.5 mt-3", !open && "hidden md:block")}>
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-white/50 hover:text-gold transition-colors inline-flex min-h-[36px] items-center"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
            <div>
              <h3 className="font-heading text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">
                Join the MecBill Community
              </h3>
              <p className="text-white/60 mt-2 text-sm">
                Get exclusive offers, hair care tips, and first access to new products.
              </p>
            </div>
            <NewsletterForm source="footer" />
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-0 md:gap-8">
          {/* Brand */}
          <div className="mb-6 md:mb-0">
            <Link href="/" className="inline-block">
              <span className="font-heading text-2xl font-semibold tracking-tight">
                MecBill
              </span>
              <span className="font-heading text-2xl font-light text-gold ml-0.5">
                Tech
              </span>
            </Link>
            <p className="text-white/50 text-sm mt-4 leading-relaxed">
              Premium hair and beauty experiences crafted for your confidence.
            </p>
            <div className="flex gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <FooterColumn key={category} title={category} links={links} />
          ))}
        </div>

        {/* Contact */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-10 sm:mt-12 pt-8 border-t border-white/10">
          <div className="flex items-center gap-3 text-sm text-white/50">
            <MapPin className="h-4 w-4 text-gold shrink-0" />
            <span>123 Victoria Island, Lagos, Nigeria</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/50">
            <Phone className="h-4 w-4 text-gold shrink-0" />
            <a href="tel:+2348000000000" className="hover:text-gold transition-colors inline-flex min-h-[44px] items-center">
              +234 800 000 0000
            </a>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/50">
            <Mail className="h-4 w-4 text-gold shrink-0" />
            <a
              href="mailto:hello@mecbilltechsalon.com"
              className="hover:text-gold transition-colors inline-flex min-h-[44px] items-center"
            >
              hello@mecbilltechsalon.com
            </a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} MecBill Tech Salon. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <Link href="/privacy" className="hover:text-gold transition-colors inline-flex min-h-[44px] items-center">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-gold transition-colors inline-flex min-h-[44px] items-center">
              Terms
            </Link>
            <Link href="/sitemap" className="hover:text-gold transition-colors inline-flex min-h-[44px] items-center">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
