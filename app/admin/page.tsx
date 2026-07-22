"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Calendar, Package, Users, Scissors, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stats {
  appointments: { total: number; month: number; change: number };
  customers: { total: number; month: number; change: number };
  revenue: { month: number; change: number };
  services: number;
  stylists: number;
  statusCounts: Record<string, number>;
}

interface RecentAppointment {
  id: string;
  reference: string;
  customer: string | null;
  service: string;
  stylist: string | null;
  time: string;
  status: string;
  date: string;
}

interface PopularService {
  name: string;
  bookings: number;
}

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
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<RecentAppointment[]>([]);
  const [popular, setPopular] = useState<PopularService[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/analytics");
      const data = await res.json();
      setStats(data.stats);
      setRecent(data.recentAppointments || []);
      setPopular(data.popularServices || []);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-NG", { weekday: "short", month: "short", day: "numeric" });

  if (loading) {
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
    </div>
  );
}
