"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
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
  const router = useRouter();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-charcoal py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="font-heading text-2xl font-bold text-white tracking-tight">My Dashboard</h1>
          {session?.user?.name && (
            <p className="text-white/60 mt-1 text-sm">Welcome back, {session.user.name.split(" ")[0]}</p>
          )}
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
