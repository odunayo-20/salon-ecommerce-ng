"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Scissors, Package, Calendar, Users, UserCog, Star, PenTool, BarChart3, Menu, X, FolderTree, Clock, Tag, MessageSquare, Warehouse, ClipboardList, LogOut, Globe, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useSession, signOut } from "next-auth/react";

const adminLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Services", href: "/admin/services", icon: Scissors },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Inventory", href: "/admin/inventory", icon: Warehouse },
  { label: "Appointments", href: "/admin/appointments", icon: Calendar },
  { label: "Orders", href: "/admin/orders", icon: Package },
  { label: "Coupons", href: "/admin/coupons", icon: Tag },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Consultations", href: "/admin/consultations", icon: MessageSquare },
  { label: "Stylists", href: "/admin/stylists", icon: UserCog },
  { label: "Schedules", href: "/admin/schedules", icon: Clock },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Blog", href: "/admin/blog", icon: PenTool },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Audit Log", href: "/admin/audit-log", icon: ClipboardList },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { data: session } = useSession();
  const userName = session?.user?.name || "Admin";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-charcoal/95 backdrop-blur-md py-3 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-white/85 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link href="/admin" className="flex items-center group">
            <span className="font-heading text-lg sm:text-xl font-semibold text-white tracking-tight group-hover:text-gold transition-colors">MecBill</span>
            <span className="font-heading text-lg sm:text-xl font-light text-gold ml-0.5">Admin</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell variant="admin" />
          
          {/* User Menu Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 focus:outline-none group p-1 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-xs font-bold text-gold shadow-inner transition-colors group-hover:border-gold/50">
                {userInitials || "AD"}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-white/50 group-hover:text-white transition-colors hidden sm:block" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-border rounded-xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 text-xs border-b border-border/60 mb-1">
                  <p className="font-semibold text-charcoal truncate">{userName}</p>
                  <p className="text-muted-foreground truncate mt-0.5">{session?.user?.email || "admin@mecbill.com"}</p>
                </div>
                
                <Link
                  href="/"
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-charcoal hover:bg-cream/60 hover:text-gold rounded-lg transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Globe className="h-4 w-4 text-charcoal/40" />
                  <span>Back to Website</span>
                </Link>
                
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors text-left"
                >
                  <LogOut className="h-4 w-4 text-red-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Mobile Sidebar Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:sticky top-[53px] sm:top-[57px] left-0 z-40 h-[calc(100vh-53px)] sm:h-[calc(100vh-57px)] w-64 bg-white border-r border-border/80 shadow-xl lg:shadow-none overflow-y-auto transition-transform duration-300 lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <nav className="p-3 space-y-0.5">
            {adminLinks.map((link) => {
              const isActive = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out min-h-[44px] rounded-lg",
                    isActive
                      ? "bg-gold/5 text-gold border-l-2 border-gold pl-4"
                      : "text-charcoal/80 hover:bg-cream/60 hover:text-gold hover:pl-4"
                  )}
                >
                  <link.icon
                    className={cn(
                      "h-4 w-4 transition-colors duration-200 shrink-0",
                      isActive ? "text-gold" : "text-charcoal/40 group-hover:text-gold"
                    )}
                  />
                  <span className="truncate">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl min-w-0">{children}</main>
      </div>
    </div>
  );
}
