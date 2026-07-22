"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface AnalyticsData {
  stats: {
    appointments: { total: number; month: number; change: number };
    customers: { total: number; month: number; change: number };
    revenue: { month: number; change: number };
    services: number;
    stylists: number;
    statusCounts: Record<string, number>;
  };
  recentAppointments: { id: string; reference: string; customer: string; service: string; stylist: string | null; time: string; status: string; date: string }[];
  popularServices: { name: string; bookings: number }[];
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700", CONFIRMED: "bg-blue-50 text-blue-700",
  "IN PROGRESS": "bg-purple-50 text-purple-700", COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-600",
};

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/analytics");
        const json = await res.json();
        setData(json);
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="py-20 text-center"><Loader2 className="h-8 w-8 text-gold animate-spin mx-auto" /></div>;
  if (!data) return <div className="py-20 text-center text-muted-foreground">Failed to load analytics.</div>;

  const { stats } = data;
  const fmt = (n: number) => n >= 1000000 ? `₦${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `₦${(n / 1000).toFixed(0)}K` : `₦${n.toLocaleString()}`;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-charcoal mb-6">Analytics</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Revenue (This Month)", current: fmt(stats.revenue.month), change: stats.revenue.change },
          { label: "Appointments", current: stats.appointments.month.toString(), change: stats.appointments.change, sub: `${stats.appointments.total} total` },
          { label: "Customers", current: stats.customers.month.toString(), change: stats.customers.change, sub: `${stats.customers.total} total` },
          { label: "Active Services", current: stats.services.toString(), sub: `${stats.stylists} stylists` },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className="text-2xl font-heading font-bold text-charcoal mt-1">{s.current}</p>
            {s.change !== undefined && (
              <p className={`text-xs font-medium mt-2 ${s.change > 0 ? "text-emerald-600" : s.change < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                {s.change > 0 ? "+" : ""}{s.change}% vs last month
              </p>
            )}
            {s.sub && <p className="text-[10px] text-muted-foreground mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      {data.popularServices.length > 0 && (
        <div className="bg-white border border-border rounded-xl p-6 mb-6">
          <h2 className="font-heading font-semibold text-charcoal mb-4">Popular Services</h2>
          <div className="space-y-3">
            {data.popularServices.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-charcoal">{s.name}</span>
                <span className="text-muted-foreground">{s.bookings} bookings</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.recentAppointments.length > 0 && (
        <div className="bg-white border border-border rounded-xl p-6">
          <h2 className="font-heading font-semibold text-charcoal mb-4">Recent Appointments</h2>
          <div className="space-y-3">
            {data.recentAppointments.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-charcoal font-medium">{a.customer}</p>
                  <p className="text-xs text-muted-foreground">{a.service} · {a.stylist || "Any stylist"}</p>
                </div>
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${statusColors[a.status] || "bg-gray-50 text-gray-600"}`}>{a.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
