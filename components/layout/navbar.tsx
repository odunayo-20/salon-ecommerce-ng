"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  ShoppingBag,
  User,
  Heart,
  Phone,
  ChevronDown,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore, useUIStore } from "@/store";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  {
    label: "Services",
    href: "/book",
    children: [
      { label: "Braids", href: "/book/hair/braids" },
      { label: "Knotless Braids", href: "/book/hair/knotless-braids" },
      { label: "Loc Maintenance", href: "/book/hair/loc-maintenance" },
      { label: "Wig Installation", href: "/book/hair/wig-installation" },
      { label: "Natural Hair Treatment", href: "/book/hair/natural-hair-treatment" },
      { label: "Silk Press", href: "/book/hair/silk-press" },
      { label: "Nails", href: "/book/nails" },
    ],
  },
  {
    label: "Shop",
    href: "/shop",
    children: [
      { label: "Hair Extensions", href: "/shop/hair-extensions" },
      { label: "Wigs", href: "/shop/wigs" },
      { label: "Hair Care", href: "/shop/hair-care" },
      { label: "Beauty", href: "/shop/beauty" },
    ],
  },
  { label: "Consultation", href: "/consultation" },
  { label: "Blog", href: "/blog" },
  { label: "Locations", href: "/locations" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const itemCount = useCartStore((s) => s.getItemCount());
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
    setShowAccountMenu(false);
  }, [pathname, setMobileMenuOpen]);

  return (
    <>
      {/* Top Bar */}
      <div className="hidden md:block bg-charcoal text-white">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between text-xs tracking-wider">
          <div className="flex items-center gap-6">
            <a
              href="tel:+2348000000000"
              className="flex items-center gap-1.5 hover:text-gold transition-colors"
            >
              <Phone className="h-3 w-3" />
              <span>+234 800 000 0000</span>
            </a>
            <span className="text-white/40">|</span>
            <span className="text-white/70">Mon - Sat: 9AM - 7PM</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/consultation" className="hover:text-gold transition-colors">
              Free Consultation
            </Link>
            <span className="text-white/40">|</span>
            <Link href="/book" className="hover:text-gold transition-colors">
              Book Now
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-[0_1px_0_0_oklch(0.91_0.008_85)]"
            : "bg-white"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger render={<Button variant="ghost" size="icon" className="text-charcoal" />}>
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] p-0">
                  <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-border">
                      <Link
                        href="/"
                        className="font-heading text-2xl font-semibold text-charcoal tracking-tight"
                      >
                        MecBill
                      </Link>
                    </div>
                    <nav className="flex-1 overflow-y-auto p-6">
                      <div className="space-y-1">
                        {navLinks.map((link) => (
                          <div key={link.href}>
                            <Link
                              href={link.href}
                              className={cn(
                                "block py-3 text-sm font-medium transition-colors border-b border-border/50",
                                pathname === link.href
                                  ? "text-gold"
                                  : "text-charcoal hover:text-gold"
                              )}
                            >
                              {link.label}
                            </Link>
                            {link.children && (
                              <div className="pl-4">
                                {link.children.map((child) => (
                                  <Link
                                    key={child.href}
                                    href={child.href}
                                    className={cn(
                                      "block py-2 text-sm transition-colors",
                                      pathname === child.href
                                        ? "text-gold"
                                        : "text-muted-foreground hover:text-gold"
                                    )}
                                  >
                                    {child.label}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </nav>
                    <div className="p-6 border-t border-border">
                      {session ? (
                        <div className="space-y-3">
                          <div className="text-sm">
                            <p className="font-medium text-charcoal">{session.user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                          </div>
                          <Button asChild className="w-full bg-charcoal text-white hover:bg-charcoal-light">
                            <Link href="/dashboard">Dashboard</Link>
                          </Button>
                          <button onClick={async () => { setMobileMenuOpen(false); await signOut({ redirect: false }); router.push("/"); router.refresh(); }} className="w-full text-sm text-red-500 py-2">Sign Out</button>
                        </div>
                      ) : (
                        <Button asChild className="w-full bg-charcoal text-white hover:bg-charcoal-light">
                          <Link href="/auth/signin">Sign In</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="font-heading text-2xl md:text-3xl font-semibold text-charcoal tracking-tight">
                MecBill
              </span>
              <span className="font-heading text-2xl md:text-3xl font-light text-gold ml-0.5">
                Tech
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => link.children && setOpenDropdown(link.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors rounded-full",
                      pathname === link.href || pathname.startsWith(link.href + "/")
                        ? "text-gold"
                        : "text-charcoal hover:text-gold"
                    )}
                  >
                    {link.label}
                    {link.children && (
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 transition-transform",
                          openDropdown === link.label && "rotate-180"
                        )}
                      />
                    )}
                  </Link>

                  {/* Dropdown */}
                  {link.children && openDropdown === link.label && (
                    <div className="absolute top-full left-0 pt-2 z-50">
                      <div className="bg-white rounded-xl shadow-lg border border-border p-2 min-w-[220px]">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "block px-4 py-2.5 text-sm rounded-lg transition-colors",
                              pathname === child.href
                                ? "bg-gold/10 text-gold font-medium"
                                : "text-charcoal hover:bg-cream hover:text-gold"
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex text-charcoal hover:text-gold"
                asChild
              >
                <Link href="/dashboard/wishlist">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Wishlist</span>
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-charcoal hover:text-gold relative"
                asChild
              >
                <Link href="/shop/cart">
                  <span className="relative inline-flex">
                    <ShoppingBag className="h-5 w-5" />
                    {mounted && itemCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 h-4 w-4 rounded-full bg-gold text-white text-[10px] font-bold flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </span>
                  <span className="sr-only">Cart</span>
                </Link>
              </Button>

              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex text-charcoal hover:text-gold"
                  onClick={() => session ? setShowAccountMenu(!showAccountMenu) : router.push("/auth/signin")}
                >
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="" className="h-6 w-6 rounded-full object-cover" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  <span className="sr-only">Account</span>
                </Button>
                {showAccountMenu && session && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowAccountMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 z-50">
                      <div className="bg-white rounded-xl shadow-lg border border-border p-2 min-w-[200px]">
                        <div className="px-3 py-2 border-b border-border/50 mb-1">
                          <p className="text-sm font-medium text-charcoal">{session.user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                        </div>
                        <Link href="/dashboard" onClick={() => setShowAccountMenu(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-charcoal hover:bg-cream rounded-lg transition-colors">
                          <LayoutDashboard className="h-4 w-4" />Dashboard
                        </Link>
                        {session.user.role === "ADMIN" && (
                          <Link href="/admin" onClick={() => setShowAccountMenu(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-charcoal hover:bg-cream rounded-lg transition-colors">
                            <LayoutDashboard className="h-4 w-4" />Admin Panel
                          </Link>
                        )}
                        <button onClick={async () => { setShowAccountMenu(false); await signOut({ redirect: false }); router.push("/"); router.refresh(); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <LogOut className="h-4 w-4" />Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Button
                asChild
                className="hidden md:inline-flex bg-charcoal text-white hover:bg-charcoal-light px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase"
              >
                <Link href="/book">Book Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());

  useEffect(() => { setMounted(true); }, []);

  const items = [
    { icon: Phone, label: "Book", href: "/book" },
    { icon: ShoppingBag, label: "Shop", href: "/shop", badge: mounted ? itemCount : 0 },
    { icon: Heart, label: "Wishlist", href: "/dashboard/wishlist" },
    { icon: User, label: "Account", href: "/dashboard" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border">
      <nav className="flex items-center justify-around h-16">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 py-2 relative transition-colors",
                isActive ? "text-gold" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 h-4 w-4 rounded-full bg-gold text-white text-[9px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function StickyBookingButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "hidden md:block fixed bottom-6 right-6 z-50 transition-all duration-300",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      <Button
        asChild
        className="bg-charcoal text-white hover:bg-charcoal-light px-8 py-6 rounded-full shadow-2xl text-xs font-semibold tracking-wider uppercase"
      >
        <Link href="/book">Book Appointment</Link>
      </Button>
    </div>
  );
}
