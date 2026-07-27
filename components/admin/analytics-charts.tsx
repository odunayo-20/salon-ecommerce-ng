"use client";

import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { AdminAnalyticsV2 } from "@/hooks/queries";

const COLORS = ["#c9a96e", "#1a1a1a", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const statusLabels: Record<string, string> = {
  PENDING: "Pending", CONFIRMED: "Confirmed", IN_PROGRESS: "In Progress",
  COMPLETED: "Completed", CANCELLED: "Cancelled", NO_SHOW: "No Show",
  PROCESSING: "Processing", SHIPPED: "Shipped", DELIVERED: "Delivered", RETURNED: "Returned",
};

export default function AnalyticsCharts({ data }: { data: AdminAnalyticsV2 }) {
  return (
    <>
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
    </>
  );
}
