"use client";

const orders = [
  { id: "ORD-001", customer: "Adaeze O.", date: "2024-01-28", items: 2, total: 49500, status: "delivered", payment: "Stripe" },
  { id: "ORD-002", customer: "Folake M.", date: "2024-01-25", items: 1, total: 85000, status: "shipped", payment: "Flutterwave" },
  { id: "ORD-003", customer: "Ngozi A.", date: "2024-01-22", items: 3, total: 17500, status: "processing", payment: "Card" },
  { id: "ORD-004", customer: "Blessing E.", date: "2024-01-20", items: 1, total: 25000, status: "pending", payment: "Bank Transfer" },
];

const statusColors: Record<string, string> = { delivered: "bg-emerald-50 text-emerald-700", shipped: "bg-blue-50 text-blue-700", processing: "bg-amber-50 text-amber-700", pending: "bg-gray-50 text-gray-600" };

export default function AdminOrdersPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-charcoal mb-6">Orders</h1>
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-cream/50">{["Order", "Customer", "Date", "Items", "Total", "Payment", "Status"].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-border/50 last:border-0 hover:bg-cream/30">
                <td className="px-5 py-4 font-medium text-charcoal">{o.id}</td>
                <td className="px-5 py-4 text-muted-foreground">{o.customer}</td>
                <td className="px-5 py-4 text-muted-foreground">{o.date}</td>
                <td className="px-5 py-4 text-muted-foreground">{o.items}</td>
                <td className="px-5 py-4 font-medium text-charcoal">₦{o.total.toLocaleString()}</td>
                <td className="px-5 py-4 text-muted-foreground">{o.payment}</td>
                <td className="px-5 py-4"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${statusColors[o.status]}`}>{o.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
