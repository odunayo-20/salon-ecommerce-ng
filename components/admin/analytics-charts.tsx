"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { AdminAnalyticsV2 } from "@/hooks/queries";

const COLORS = ["#c9a96e", "#1a1a1a", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const statusLabels: Record<string, string> = {
  PENDING: "Pending", CONFIRMED: "Confirmed", IN_PROGRESS: "In Progress",
  COMPLETED: "Completed", CANCELLED: "Cancelled", NO_SHOW: "No Show",
  PROCESSING: "Processing", SHIPPED: "Shipped", DELIVERED: "Delivered", RETURNED: "Returned",
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

function MobilePieLabel({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }: {
  cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number;
  name: string; percent: number;
}) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function AnalyticsCharts({ data }: { data: AdminAnalyticsV2 }) {
  const isMobile = useIsMobile();

  return (
    <>
      {/* Revenue Chart */}
      <div className="bg-white border border-border rounded-xl p-4 sm:p-6">
        <h2 className="font-heading font-semibold text-charcoal text-sm sm:text-base mb-3 sm:mb-4">Revenue Trend</h2>
        <div className="h-56 sm:h-72 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.timeSeries} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: isMobile ? 9 : 11 }}
                tickFormatter={(v) => v.length > 7 ? v.slice(5) : v}
                interval={isMobile ? "preserveStartEnd" : 0}
                minTickGap={isMobile ? 30 : 0}
              />
              <YAxis
                tick={{ fontSize: isMobile ? 9 : 11 }}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
                width={isMobile ? 40 : 50}
              />
              <Tooltip
                formatter={(v) => [`₦${Number(v).toLocaleString()}`, ""]}
                labelStyle={{ fontSize: isMobile ? 10 : 12 }}
                contentStyle={{ fontSize: isMobile ? 11 : 13 }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#c9a96e" fill="#c9a96e" fillOpacity={0.15} strokeWidth={isMobile ? 1.5 : 2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders vs Appointments Bar Chart */}
      <div className="bg-white border border-border rounded-xl p-4 sm:p-6">
        <h2 className="font-heading font-semibold text-charcoal text-sm sm:text-base mb-3 sm:mb-4">Orders vs Appointments</h2>
        <div className="h-48 sm:h-64 md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.timeSeries} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: isMobile ? 9 : 11 }}
                tickFormatter={(v) => v.length > 7 ? v.slice(5) : v}
                interval={isMobile ? "preserveStartEnd" : 0}
                minTickGap={isMobile ? 30 : 0}
              />
              <YAxis tick={{ fontSize: isMobile ? 9 : 11 }} width={isMobile ? 35 : 45} />
              <Tooltip contentStyle={{ fontSize: isMobile ? 11 : 13 }} />
              <Legend
                wrapperStyle={{ fontSize: isMobile ? 10 : 12 }}
                iconSize={isMobile ? 8 : 10}
              />
              <Bar dataKey="orders" fill="#1a1a1a" radius={[3, 3, 0, 0]} />
              <Bar dataKey="appointments" fill="#c9a96e" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Charts — stack on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Order Status Pie */}
        <div className="bg-white border border-border rounded-xl p-4 sm:p-6">
          <h2 className="font-heading font-semibold text-charcoal text-sm sm:text-base mb-3 sm:mb-4">Order Status</h2>
          {data.orderStatuses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No orders</p>
          ) : (
            <div className="h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.orderStatuses.map((s) => ({ name: statusLabels[s.status] || s.status, value: s.count }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 40 : 60}
                    outerRadius={isMobile ? 70 : 100}
                    dataKey="value"
                    label={isMobile ? MobilePieLabel : ({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={!isMobile}
                  >
                    {data.orderStatuses.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: isMobile ? 11 : 13 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* Legend below pie on mobile */}
          {isMobile && data.orderStatuses.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 justify-center">
              {data.orderStatuses.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {statusLabels[s.status] || s.status}: {s.count}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Appointment Status Pie */}
        <div className="bg-white border border-border rounded-xl p-4 sm:p-6">
          <h2 className="font-heading font-semibold text-charcoal text-sm sm:text-base mb-3 sm:mb-4">Appointment Status</h2>
          {data.appointmentStatuses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No appointments</p>
          ) : (
            <div className="h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.appointmentStatuses.map((s) => ({ name: statusLabels[s.status] || s.status, value: s.count }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 40 : 60}
                    outerRadius={isMobile ? 70 : 100}
                    dataKey="value"
                    label={isMobile ? MobilePieLabel : ({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={!isMobile}
                  >
                    {data.appointmentStatuses.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: isMobile ? 11 : 13 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {isMobile && data.appointmentStatuses.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 justify-center">
              {data.appointmentStatuses.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {statusLabels[s.status] || s.status}: {s.count}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Products & Services — stack on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Products */}
        <div className="bg-white border border-border rounded-xl p-4 sm:p-6">
          <h2 className="font-heading font-semibold text-charcoal text-sm sm:text-base mb-3 sm:mb-4">Top Products</h2>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No product sales</p>
          ) : (
            <div className="space-y-2.5 sm:space-y-3">
              {data.topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-[10px] text-muted-foreground w-4 shrink-0 text-right">{i + 1}.</span>
                    <span className="text-charcoal truncate text-xs sm:text-sm">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <span className="text-muted-foreground text-[10px] sm:text-xs">{p.quantity} sold</span>
                    <span className="font-medium text-charcoal text-xs sm:text-sm">₦{p.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Services */}
        <div className="bg-white border border-border rounded-xl p-4 sm:p-6">
          <h2 className="font-heading font-semibold text-charcoal text-sm sm:text-base mb-3 sm:mb-4">Top Services</h2>
          {data.topServices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No service bookings</p>
          ) : (
            <div className="space-y-2.5 sm:space-y-3">
              {data.topServices.map((s, i) => (
                <div key={i} className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-[10px] text-muted-foreground w-4 shrink-0 text-right">{i + 1}.</span>
                    <span className="text-charcoal truncate text-xs sm:text-sm">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <span className="text-muted-foreground text-[10px] sm:text-xs">{s.bookings} bookings</span>
                    <span className="font-medium text-charcoal text-xs sm:text-sm">₦{s.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
