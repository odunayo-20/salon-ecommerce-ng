"use client";

import Link from "next/link";
import { Calendar, Package, Users, Scissors, Loader2, Warehouse, ClipboardList, BarChart3, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminAnalytics } from "@/hooks/queries";

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  IN_PROGRESS: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-gray-50 text-gray-600",
  CANCELLED: "bg-red-50 text-red-600",
  NO_SHOW: "bg-red-50 text-red-600",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pending", CONFIRMED: "Confirmed", IN_PROGRESS: "In Progress",
  COMPLETED: "Completed", CANCELLED: "Cancelled", NO_SHOW: "No Show",
};

export default function AdminDashboard() {
  const { data, isLoading } = useAdminAnalytics(30_000);

  const stats = data?.stats ?? null;
  const recent = data?.recentAppointments ?? [];
  const popular = data?.popularServices ?? [];

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-NG", { weekday: "short", month: "short", day: "numeric" });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-charcoal tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Revenue (This Month)", value: `₦${(stats.revenue.month / 1000).toFixed(0)}K`, change: stats.revenue.change, icon: Package },
            { label: "Appointments", value: stats.appointments.month.toString(), change: stats.appointments.change, icon: Calendar },
            { label: "Customers", value: stats.customers.total.toLocaleString(), change: stats.customers.change, icon: Users },
            { label: "Active Services", value: stats.services.toString(), icon: Scissors },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-border rounded-xl p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-heading font-bold text-charcoal mt-1">{stat.value}</p>
              {stat.change !== undefined && (
                <p className={cn("text-xs font-medium mt-2", stat.change >= 0 ? "text-emerald-600" : "text-red-500")}>
                  {stat.change >= 0 ? "+" : ""}{stat.change}% vs last month
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Appointments */}
        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-charcoal">Recent Appointments</h2>
            <Link href="/admin/appointments" className="text-xs text-gold font-semibold">View All</Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No appointments yet</p>
          ) : (
            <div className="space-y-3">
              {recent.map((apt) => (
                <div key={apt.id} className="flex items-center gap-3 p-3 bg-cream rounded-lg">
                  <div className="h-9 w-9 rounded-full bg-charcoal/5 flex items-center justify-center text-xs font-bold text-charcoal shrink-0">
                    {(apt.customer || "?").charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal truncate">{apt.customer}</p>
                    <p className="text-xs text-muted-foreground">{apt.service} · {apt.time}</p>
                  </div>
                  <span className={cn("text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full shrink-0", statusColors[apt.status])}>{statusLabels[apt.status] || apt.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popular Services */}
        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-charcoal">Popular Services</h2>
            <Link href="/admin/services" className="text-xs text-gold font-semibold">Manage</Link>
          </div>
          {popular.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No booking data yet</p>
          ) : (
            <div className="space-y-3">
              {popular.map((service) => (
                <div key={service.name} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-charcoal">{service.name}</span>
                      <span className="text-xs text-muted-foreground">{service.bookings} bookings</span>
                    </div>
                    <div className="w-full bg-cream rounded-full h-1.5">
                      <div className="bg-gold h-1.5 rounded-full" style={{ width: `${(service.bookings / (popular[0]?.bookings || 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status Breakdown */}
      {stats && Object.keys(stats.statusCounts).length > 0 && (
        <div className="bg-white border border-border rounded-xl p-6">
          <h2 className="font-heading font-semibold text-charcoal mb-4">Appointment Status Breakdown</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(stats.statusCounts).map(([status, count]) => (
              <div key={status} className="bg-cream rounded-lg p-3 text-center">
                <span className={cn("inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-1", statusColors[status])}>{statusLabels[status] || status}</span>
                <p className="text-xl font-heading font-bold text-charcoal">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Inventory", href: "/admin/inventory", icon: Warehouse, color: "text-amber-600" },
          { label: "Audit Log", href: "/admin/audit-log", icon: ClipboardList, color: "text-purple-600" },
          { label: "Analytics", href: "/admin/analytics", icon: BarChart3, color: "text-blue-600" },
          { label: "Coupons", href: "/admin/coupons", icon: Tag, color: "text-emerald-600" },
        ].map((link) => (
          <Link key={link.href} href={link.href} className="bg-white border border-border rounded-xl p-4 hover:shadow-sm transition-shadow group">
            <link.icon className={cn("h-5 w-5 mb-2", link.color)} />
            <p className="text-sm font-medium text-charcoal group-hover:text-gold transition-colors">{link.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
