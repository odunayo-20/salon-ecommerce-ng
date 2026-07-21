"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Package, Heart, Star, User, Settings, LogOut, ChevronRight, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { label: "My Appointments", href: "/dashboard", icon: Calendar },
  { label: "Orders", href: "/dashboard/orders", icon: Package },
  { label: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
  { label: "Hair Profile", href: "/dashboard/hair-profile", icon: Scissors },
  { label: "Loyalty Points", href: "/dashboard/loyalty", icon: Star },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-charcoal py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="font-heading text-2xl font-bold text-white tracking-tight">My Dashboard</h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <nav className="bg-white border border-border rounded-xl overflow-hidden">
              {sidebarLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link key={link.href} href={link.href} className={cn("flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors border-b border-border/50 last:border-0", isActive ? "bg-gold/5 text-gold border-l-2 border-l-gold" : "text-charcoal hover:bg-cream")}>
                    <link.icon className="h-4 w-4" />{link.label}
                  </Link>
                );
              })}
              <button className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors border-t border-border">
                <LogOut className="h-4 w-4" />Sign Out
              </button>
            </nav>
          </aside>
          <main className="lg:col-span-3">{children}</main>
        </div>
      </div>
    </div>
  );
}
