import Link from "next/link";
import { Globe, Hash, MessageCircle, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight">
                Join the MecBill Community
              </h3>
              <p className="text-white/60 mt-2 text-sm">
                Get exclusive offers, hair care tips, and first access to new products.
              </p>
            </div>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-white/10 border border-white/10 rounded-full px-6 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-gold transition-colors"
              />
              <Button className="bg-gold text-white hover:bg-gold-dark rounded-full px-8 text-xs font-semibold tracking-wider uppercase">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
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
                  className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold tracking-wider uppercase text-white/80 mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-gold transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="grid md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/10">
          <div className="flex items-center gap-3 text-sm text-white/50">
            <MapPin className="h-4 w-4 text-gold shrink-0" />
            <span>123 Victoria Island, Lagos, Nigeria</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/50">
            <Phone className="h-4 w-4 text-gold shrink-0" />
            <a href="tel:+2348000000000" className="hover:text-gold transition-colors">
              +234 800 000 0000
            </a>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/50">
            <Mail className="h-4 w-4 text-gold shrink-0" />
            <a
              href="mailto:hello@mecbilltechsalon.com"
              className="hover:text-gold transition-colors"
            >
              hello@mecbilltechsalon.com
            </a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} MecBill Tech Salon. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <Link href="/privacy" className="hover:text-gold transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-gold transition-colors">
              Terms
            </Link>
            <Link href="/sitemap" className="hover:text-gold transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
