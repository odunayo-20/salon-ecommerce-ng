"use client";

const analytics = {
  revenue: { current: 2450000, previous: 2180000 },
  appointments: { current: 156, previous: 144 },
  customers: { current: 892, previous: 774 },
  products: { current: 342, previous: 349 },
};

const monthlyRevenue = [
  { month: "Aug", revenue: 1800000 },
  { month: "Sep", revenue: 1950000 },
  { month: "Oct", revenue: 2100000 },
  { month: "Nov", revenue: 2200000 },
  { month: "Dec", revenue: 2180000 },
  { month: "Jan", revenue: 2450000 },
];

const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue));

export default function AdminAnalyticsPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-charcoal mb-6">Analytics</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Revenue", current: `₦${(analytics.revenue.current / 1000000).toFixed(1)}M`, change: +12.5 },
          { label: "Appointments", current: analytics.appointments.current.toString(), change: +8.3 },
          { label: "Customers", current: analytics.customers.current.toLocaleString(), change: +15.2 },
          { label: "Products Sold", current: analytics.products.current.toString(), change: -2.1 },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className="text-2xl font-heading font-bold text-charcoal mt-1">{s.current}</p>
            <p className={`text-xs font-medium mt-2 ${s.change > 0 ? "text-emerald-600" : "text-red-500"}`}>
              {s.change > 0 ? "+" : ""}{s.change}% vs last month
            </p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-border rounded-xl p-6">
        <h2 className="font-heading font-semibold text-charcoal mb-6">Monthly Revenue</h2>
        <div className="flex items-end gap-3 h-48">
          {monthlyRevenue.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-[10px] text-muted-foreground">₦{(m.revenue / 1000000).toFixed(1)}M</span>
              <div className="w-full bg-gold/20 rounded-t-md relative" style={{ height: `${(m.revenue / maxRevenue) * 120}px` }}>
                <div className="absolute inset-x-0 bottom-0 bg-gold rounded-t-md" style={{ height: "100%" }} />
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">{m.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
