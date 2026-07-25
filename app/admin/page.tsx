"use client";

import Link from "next/link";
import { Calendar, Package, Users, Scissors, Loader2, Warehouse, ClipboardList, BarChart3, Tag, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminAnalyticsV2 } from "@/hooks/queries";

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  IN_PROGRESS: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-gray-50 text-gray-600",
  CANCELLED: "bg-red-50 text-red-600",
  NO_SHOW: "bg-red-50 text-red-600",
  PROCESSING: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-purple-50 text-purple-700",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  RETURNED: "bg-orange-50 text-orange-600",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pending", CONFIRMED: "Confirmed", IN_PROGRESS: "In Progress",
  COMPLETED: "Completed", CANCELLED: "Cancelled", NO_SHOW: "No Show",
  PROCESSING: "Processing", SHIPPED: "Shipped", DELIVERED: "Delivered", RETURNED: "Returned",
};

export default function AdminDashboard() {
  const { data, isLoading } = useAdminAnalyticsV2();

  const summary = data?.summary ?? null;
  const topServices = data?.topServices ?? [];
  const aptStatuses = data?.appointmentStatuses ?? [];
  const orderStatuses = data?.orderStatuses ?? [];

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
      {summary && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Revenue", value: `₦${(summary.totalRevenue / 1000).toFixed(0)}K`, icon: Package },
            { label: "Orders", value: summary.totalOrders.toLocaleString(), icon: Package },
            { label: "Appointments", value: summary.totalAppointments.toLocaleString(), icon: Calendar },
            { label: "Customers", value: summary.totalCustomers.toLocaleString(), sub: `+${summary.newCustomers} new`, icon: Users },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-border rounded-xl p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-heading font-bold text-charcoal mt-1">{stat.value}</p>
              {stat.sub && <p className="text-xs text-emerald-600 mt-1">{stat.sub}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Alert Cards */}
      {summary && (summary.pendingOrders > 0 || summary.lowStockCount > 0) && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {summary.expiringOrders > 0 && (
            <Link href="/admin/orders?status=PENDING" className="bg-amber-50 border border-amber-200 rounded-xl p-4 hover:shadow-sm transition-shadow flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">{summary.expiringOrders} order{summary.expiringOrders !== 1 ? "s" : ""} expiring soon</p>
                <p className="text-xs text-amber-600 mt-0.5">Within the next 10 minutes</p>
              </div>
            </Link>
          )}
          {summary.pendingOrders > 0 && (
            <Link href="/admin/orders?status=PENDING" className="bg-white border border-border rounded-xl p-4 hover:shadow-sm transition-shadow flex items-start gap-3">
              <Package className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-charcoal">{summary.pendingOrders} pending order{summary.pendingOrders !== 1 ? "s" : ""}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Awaiting payment confirmation</p>
              </div>
            </Link>
          )}
          {summary.lowStockCount > 0 && (
            <Link href="/admin/inventory?lowStock=true" className="bg-red-50 border border-red-200 rounded-xl p-4 hover:shadow-sm transition-shadow flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">{summary.lowStockCount} product{summary.lowStockCount !== 1 ? "s" : ""} low on stock</p>
                <p className="text-xs text-red-600 mt-0.5">Needs restocking</p>
              </div>
            </Link>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Top Services */}
        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-charcoal">Top Services</h2>
            <Link href="/admin/services" className="text-xs text-gold font-semibold">Manage</Link>
          </div>
          {topServices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No booking data yet</p>
          ) : (
            <div className="space-y-3">
              {topServices.slice(0, 5).map((service) => (
                <div key={service.name} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-charcoal">{service.name}</span>
                      <span className="text-xs text-muted-foreground">{service.bookings} bookings · ₦{service.revenue.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-cream rounded-full h-1.5">
                      <div className="bg-gold h-1.5 rounded-full" style={{ width: `${(service.bookings / (topServices[0]?.bookings || 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Breakdown */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h2 className="font-heading font-semibold text-charcoal mb-4">Status Breakdown</h2>
          <div className="space-y-4">
            {aptStatuses.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Appointments</p>
                <div className="grid grid-cols-3 gap-2">
                  {aptStatuses.map((s) => (
                    <div key={s.status} className="bg-cream rounded-lg p-2 text-center">
                      <span className={cn("inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider mb-0.5", statusColors[s.status])}>{statusLabels[s.status] || s.status}</span>
                      <p className="text-lg font-heading font-bold text-charcoal">{s.count}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {orderStatuses.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Orders</p>
                <div className="grid grid-cols-3 gap-2">
                  {orderStatuses.map((s) => (
                    <div key={s.status} className="bg-cream rounded-lg p-2 text-center">
                      <span className={cn("inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider mb-0.5", statusColors[s.status])}>{statusLabels[s.status] || s.status}</span>
                      <p className="text-lg font-heading font-bold text-charcoal">{s.count}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {aptStatuses.length === 0 && orderStatuses.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
