"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Scissors, Package, Calendar, Users, UserCog, Star, PenTool, BarChart3, Bell, Menu, X, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

const adminLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Services", href: "/admin/services", icon: Scissors },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Appointments", href: "/admin/appointments", icon: Calendar },
  { label: "Orders", href: "/admin/orders", icon: Package },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Stylists", href: "/admin/stylists", icon: UserCog },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Blog", href: "/admin/blog", icon: PenTool },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-charcoal py-4 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-white">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link href="/admin" className="flex items-center">
            <span className="font-heading text-xl font-semibold text-white tracking-tight">MecBill</span>
            <span className="font-heading text-xl font-light text-gold ml-0.5">Admin</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white relative">
            <Bell className="h-5 w-5" /><span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-gold" />
          </Button>
          <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center text-xs font-bold text-gold">MA</div>
        </div>
      </div>
      <div className="flex">
        <aside className={cn("fixed lg:sticky top-[60px] left-0 z-40 h-[calc(100vh-60px)] w-64 bg-white border-r border-border overflow-y-auto transition-transform lg:translate-x-0", sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
          <nav className="p-4 space-y-1">
            {adminLinks.map((link) => {
              const isActive = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
              return (
                <Link key={link.href} href={link.href} onClick={() => setSidebarOpen(false)} className={cn("flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors", isActive ? "bg-gold/10 text-gold" : "text-charcoal hover:bg-cream")}>
                  <link.icon className="h-4 w-4" />{link.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 p-6 lg:p-8 max-w-7xl">{children}</main>
      </div>
    </div>
  );
}
