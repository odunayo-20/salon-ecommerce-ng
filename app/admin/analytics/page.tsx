"use client";

import { useState } from "react";
import { Loader2, Download, Calendar } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useAdminAnalyticsV2 } from "@/hooks/queries";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COLORS = ["#c9a96e", "#1a1a1a", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const statusLabels: Record<string, string> = {
  PENDING: "Pending", CONFIRMED: "Confirmed", IN_PROGRESS: "In Progress",
  COMPLETED: "Completed", CANCELLED: "Cancelled", NO_SHOW: "No Show",
  PROCESSING: "Processing", SHIPPED: "Shipped", DELIVERED: "Delivered", RETURNED: "Returned",
};

export default function AdminAnalyticsPage() {
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 5); return d.toISOString().split("T")[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [granularity, setGranularity] = useState<"daily" | "weekly" | "monthly">("daily");

  const { data, isLoading } = useAdminAnalyticsV2({ from, to, granularity });

  const exportCSV = () => {
    if (!data?.timeSeries?.length) return;
    const header = "Date,Revenue,Orders,Appointments\n";
    const rows = data.timeSeries.map((r) => `${r.date},${r.revenue},${r.orders},${r.appointments}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `analytics-${from}-to-${to}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <div className="py-20 text-center"><Loader2 className="h-8 w-8 text-gold animate-spin mx-auto" /></div>;
  if (!data) return <div className="py-20 text-center text-muted-foreground">Failed to load analytics.</div>;

  const fmt = (n: number) => n >= 1000000 ? `₦${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `₦${(n / 1000).toFixed(0)}K` : `₦${n.toLocaleString()}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold text-charcoal">Analytics</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-border rounded-lg px-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="text-xs py-1.5 focus:outline-none" />
            <span className="text-muted-foreground text-xs">to</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="text-xs py-1.5 focus:outline-none" />
          </div>
          <div className="flex bg-white border border-border rounded-lg overflow-hidden">
            {(["daily", "weekly", "monthly"] as const).map((g) => (
              <button key={g} onClick={() => setGranularity(g)} className={cn("px-3 py-1.5 text-xs font-medium capitalize transition-colors", granularity === g ? "bg-gold text-white" : "text-muted-foreground hover:bg-cream")}>{g}</button>
            ))}
          </div>
          <Button onClick={exportCSV} variant="outline" size="sm" className="rounded-full text-xs"><Download className="h-3 w-3 mr-1" />Export CSV</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: fmt(data.summary.totalRevenue) },
          { label: "Order Revenue", value: fmt(data.summary.orderRevenue), sub: `${data.summary.totalOrders} orders` },
          { label: "Appointment Revenue", value: fmt(data.summary.appointmentRevenue), sub: `${data.summary.totalAppointments} bookings` },
          { label: "Customers", value: data.summary.totalCustomers.toString(), sub: `${data.summary.newCustomers} new` },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className="text-2xl font-heading font-bold text-charcoal mt-1">{s.value}</p>
            {s.sub && <p className="text-[10px] text-muted-foreground mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white border border-border rounded-xl p-6">
        <h2 className="font-heading font-semibold text-charcoal mb-4">Revenue Trend</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.timeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.length > 7 ? v.slice(5) : v} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
              <Tooltip formatter={(v) => [`₦${Number(v).toLocaleString()}`, ""]} labelStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#c9a96e" fill="#c9a96e" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders vs Appointments Bar Chart */}
      <div className="bg-white border border-border rounded-xl p-6">
        <h2 className="font-heading font-semibold text-charcoal mb-4">Orders vs Appointments</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.timeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.length > 7 ? v.slice(5) : v} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#1a1a1a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="appointments" fill="#c9a96e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Order Status Pie */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h2 className="font-heading font-semibold text-charcoal mb-4">Order Status</h2>
          {data.orderStatuses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No orders</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.orderStatuses.map((s) => ({ name: statusLabels[s.status] || s.status, value: s.count }))} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {data.orderStatuses.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Appointment Status Pie */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h2 className="font-heading font-semibold text-charcoal mb-4">Appointment Status</h2>
          {data.appointmentStatuses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No appointments</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.appointmentStatuses.map((s) => ({ name: statusLabels[s.status] || s.status, value: s.count }))} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {data.appointmentStatuses.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h2 className="font-heading font-semibold text-charcoal mb-4">Top Products</h2>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No product sales</p>
          ) : (
            <div className="space-y-3">
              {data.topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-muted-foreground w-5">{i + 1}.</span>
                    <span className="text-charcoal truncate">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-muted-foreground text-xs">{p.quantity} sold</span>
                    <span className="font-medium text-charcoal">₦{p.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Services */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h2 className="font-heading font-semibold text-charcoal mb-4">Top Services</h2>
          {data.topServices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No service bookings</p>
          ) : (
            <div className="space-y-3">
              {data.topServices.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-muted-foreground w-5">{i + 1}.</span>
                    <span className="text-charcoal truncate">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-muted-foreground text-xs">{s.bookings} bookings</span>
                    <span className="font-medium text-charcoal">₦{s.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
