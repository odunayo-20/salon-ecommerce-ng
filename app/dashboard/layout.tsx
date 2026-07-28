"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Calendar, Package, Heart, Star, LogOut, ChevronRight, Scissors, Menu, X, User } from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { label: "My Appointments", href: "/dashboard", icon: Calendar },
  { label: "Orders", href: "/dashboard/orders", icon: Package },
  { label: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
  { label: "Hair Profile", href: "/dashboard/hair-profile", icon: Scissors },
  { label: "Loyalty Points", href: "/dashboard/loyalty", icon: Star },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-charcoal py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-white tracking-tight">My Dashboard</h1>
            {session?.user?.name && (
              <p className="text-white/60 mt-1 text-xs sm:text-sm">Welcome back, {session.user.name.split(" ")[0]}</p>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-white/80 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile horizontal nav */}
      <div className="lg:hidden bg-white border-b border-border sticky top-0 z-30">
        <div className="overflow-x-auto scrollbar-none">
          <div className="flex gap-1 px-4 py-2 min-w-max">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                    isActive ? "bg-gold text-white" : "text-charcoal hover:bg-cream"
                  )}
                >
                  <link.icon className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <span className="font-heading font-semibold text-charcoal">Menu</span>
              <button onClick={() => setSidebarOpen(false)} className="text-muted-foreground hover:text-charcoal min-h-[44px] min-w-[44px] flex items-center justify-center">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto">
              {sidebarLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors border-b border-border/50 last:border-0",
                      isActive ? "bg-gold/5 text-gold border-l-2 border-l-gold" : "text-charcoal hover:bg-cream"
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                    <ChevronRight className="h-3 w-3 ml-auto" />
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors border-t border-border"
            >
              <LogOut className="h-4 w-4" />Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Desktop layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
          <aside className="hidden lg:block lg:col-span-1">
            <nav className="bg-white border border-border rounded-xl overflow-hidden">
              {sidebarLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link key={link.href} href={link.href} className={cn("flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors border-b border-border/50 last:border-0", isActive ? "bg-gold/5 text-gold border-l-2 border-l-gold" : "text-charcoal hover:bg-cream")}>
                    <link.icon className="h-4 w-4" />{link.label}<ChevronRight className="h-3 w-3 ml-auto" />
                  </Link>
                );
              })}
              <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors border-t border-border">
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
