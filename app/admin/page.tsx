"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Scissors,
  Package,
  Calendar,
  Users,
  UserCog,
  Star,
  PenTool,
  BarChart3,
  Settings,
  ChevronRight,
  Bell,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const adminLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
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

const mockAnalytics = {
  revenue: { total: 2450000, change: 12.5, period: "vs last month" },
  appointments: { total: 156, change: 8.3, period: "vs last month" },
  customers: { total: 892, change: 15.2, period: "vs last month" },
  products: { total: 342, change: -2.1, period: "vs last month" },
};

const recentAppointments = [
  { id: "APT-201", customer: "Adaeze O.", service: "Knotless Braids", stylist: "Amara J.", time: "10:00 AM", status: "confirmed" },
  { id: "APT-202", customer: "Folake M.", service: "Silk Press", stylist: "Chioma O.", time: "11:30 AM", status: "in_progress" },
  { id: "APT-203", customer: "Ngozi A.", service: "Wig Installation", stylist: "Chioma O.", time: "1:00 PM", status: "pending" },
  { id: "APT-204", customer: "Blessing E.", service: "Gel Manicure", stylist: "Zainab O.", time: "2:30 PM", status: "confirmed" },
];

const popularServices = [
  { name: "Knotless Braids", bookings: 89, revenue: 2225000 },
  { name: "Wig Installation", bookings: 67, revenue: 1005000 },
  { name: "Silk Press", bookings: 56, revenue: 672000 },
  { name: "Natural Hair Treatment", bookings: 45, revenue: 360000 },
];

const topProducts = [
  { name: "Premium Brazilian Hair", sold: 128, revenue: 5760000 },
  { name: "Growth Oil Serum", sold: 234, revenue: 1053000 },
  { name: "Full Lace Wig", sold: 45, revenue: 3825000 },
  { name: "Silk Press Kit", sold: 89, revenue: 756500 },
];

const statusColors: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700",
  in_progress: "bg-blue-50 text-blue-700",
  pending: "bg-amber-50 text-amber-700",
  completed: "bg-gray-50 text-gray-600",
};

export default function AdminDashboard() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream">
      {/* Admin Header */}
      <div className="bg-charcoal py-4 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/admin" className="flex items-center">
            <span className="font-heading text-xl font-semibold text-white tracking-tight">
              MecBill
            </span>
            <span className="font-heading text-xl font-light text-gold ml-0.5">
              Admin
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-gold" />
          </Button>
          <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center text-xs font-bold text-gold">
            MA
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:sticky top-[60px] left-0 z-40 h-[calc(100vh-60px)] w-64 bg-white border-r border-border overflow-y-auto transition-transform lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <nav className="p-4 space-y-1">
            {adminLinks.map((link) => {
              const isActive =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gold/10 text-gold"
                      : "text-charcoal hover:bg-cream"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-bold text-charcoal tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome back. Here&apos;s what&apos;s happening today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Revenue", value: `₦${(mockAnalytics.revenue.total / 1000000).toFixed(1)}M`, change: mockAnalytics.revenue.change, positive: true, period: "vs last month" },
              { label: "Appointments", value: mockAnalytics.appointments.total.toString(), change: mockAnalytics.appointments.change, positive: true, period: "vs last month" },
              { label: "Customers", value: mockAnalytics.customers.total.toLocaleString(), change: mockAnalytics.customers.change, positive: true, period: "vs last month" },
              { label: "Products Sold", value: mockAnalytics.products.total.toString(), change: mockAnalytics.products.change, positive: false, period: "vs last month" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-border rounded-xl p-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-2xl font-heading font-bold text-charcoal mt-1">
                  {stat.value}
                </p>
                <p
                  className={cn(
                    "text-xs font-medium mt-2",
                    stat.positive ? "text-emerald-600" : "text-red-500"
                  )}
                >
                  {stat.positive ? "+" : ""}
                  {stat.change}% {stat.period}
                </p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Appointments */}
            <div className="bg-white border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-charcoal">
                  Today&apos;s Appointments
                </h2>
                <Link href="/admin/appointments" className="text-xs text-gold">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {recentAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-3 p-3 bg-cream rounded-lg"
                  >
                    <div className="h-9 w-9 rounded-full bg-charcoal/5 flex items-center justify-center text-xs font-bold text-charcoal">
                      {apt.customer.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal truncate">
                        {apt.customer}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {apt.service} · {apt.time}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full",
                        statusColors[apt.status]
                      )}
                    >
                      {apt.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Services */}
            <div className="bg-white border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-charcoal">
                  Popular Services
                </h2>
                <Link href="/admin/services" className="text-xs text-gold">
                  Manage
                </Link>
              </div>
              <div className="space-y-3">
                {popularServices.map((service) => (
                  <div key={service.name} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-charcoal">
                          {service.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {service.bookings} bookings
                        </span>
                      </div>
                      <div className="w-full bg-cream rounded-full h-1.5">
                        <div
                          className="bg-gold h-1.5 rounded-full"
                          style={{
                            width: `${(service.bookings / popularServices[0].bookings) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-charcoal">
                Best Selling Products
              </h2>
              <Link href="/admin/products" className="text-xs text-gold">
                Manage
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Product
                    </th>
                    <th className="text-right py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Units Sold
                    </th>
                    <th className="text-right py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product) => (
                    <tr
                      key={product.name}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-3 font-medium text-charcoal">{product.name}</td>
                      <td className="py-3 text-right text-muted-foreground">
                        {product.sold}
                      </td>
                      <td className="py-3 text-right font-medium text-charcoal">
                        ₦{product.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
