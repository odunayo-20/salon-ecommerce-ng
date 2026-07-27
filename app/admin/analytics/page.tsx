"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Loader2, Download, Calendar, ChevronDown } from "lucide-react";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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

  if (isLoading || !mounted) return <div className="py-20 text-center"><Loader2 className="h-8 w-8 text-gold animate-spin mx-auto" /></div>;
  if (!data) return <div className="py-20 text-center text-muted-foreground">Failed to load analytics.</div>;

  const fmt = (n: number) => n >= 1000000 ? `₦${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `₦${(n / 1000).toFixed(0)}K` : `₦${n.toLocaleString()}`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="font-heading text-xl sm:text-2xl font-bold text-charcoal">Analytics</h1>
      </div>

      {/* Controls — stack on mobile */}
      <div className="bg-white border border-border rounded-xl p-3 sm:p-4 space-y-3">
        {/* Date Range */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
            <Calendar className="h-3.5 w-3.5" />
            <span className="font-medium">Range</span>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="flex-1 bg-cream border border-border rounded-lg px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-gold min-w-0"
            />
            <span className="text-muted-foreground text-xs shrink-0">to</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="flex-1 bg-cream border border-border rounded-lg px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-gold min-w-0"
            />
          </div>
        </div>

        {/* Granularity + Export */}
        <div className="flex items-center gap-2">
          <div className="flex bg-cream border border-border rounded-lg overflow-hidden flex-1 sm:flex-none">
            {(["daily", "weekly", "monthly"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGranularity(g)}
                className={cn(
                  "flex-1 sm:flex-none px-3 py-2 text-xs font-medium capitalize transition-colors min-h-[44px]",
                  granularity === g ? "bg-gold text-white" : "text-muted-foreground hover:text-charcoal"
                )}
              >
                {g}
              </button>
            ))}
          </div>
          <Button onClick={exportCSV} variant="outline" size="sm" className="rounded-full text-xs min-h-[44px] px-3 sm:px-4 shrink-0">
            <Download className="h-3 w-3 mr-1.5" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards — 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Revenue", value: fmt(data.summary.totalRevenue) },
          { label: "Order Revenue", value: fmt(data.summary.orderRevenue), sub: `${data.summary.totalOrders} orders` },
          { label: "Appointment Revenue", value: fmt(data.summary.appointmentRevenue), sub: `${data.summary.totalAppointments} bookings` },
          { label: "Customers", value: data.summary.totalCustomers.toString(), sub: `${data.summary.newCustomers} new` },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-border rounded-xl p-3 sm:p-5">
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className="text-lg sm:text-2xl font-heading font-bold text-charcoal mt-1">{s.value}</p>
            {s.sub && <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 sm:mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      <AnalyticsCharts data={data} />
    </div>
  );
}
