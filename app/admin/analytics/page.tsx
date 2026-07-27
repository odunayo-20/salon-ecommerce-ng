"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Loader2, Download, Calendar } from "lucide-react";
import { useAdminAnalyticsV2 } from "@/hooks/queries";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AnalyticsCharts = dynamic(() => import("@/components/admin/analytics-charts"), {
  ssr: false,
  loading: () => <div className="py-20 text-center"><Loader2 className="h-8 w-8 text-gold animate-spin mx-auto" /></div>,
});

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

      <AnalyticsCharts data={data} />
    </div>
  );
}
