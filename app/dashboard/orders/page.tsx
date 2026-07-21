"use client";

const orders = [
  { id: "ORD-2024-001", date: "2024-01-28", items: ["Premium Brazilian Hair Bundle", "Growth Oil Serum"], total: 49500, status: "delivered" },
  { id: "ORD-2024-002", date: "2024-01-15", items: ["Silk Press Treatment Kit"], total: 8500, status: "shipped" },
  { id: "ORD-2024-003", date: "2024-01-05", items: ["Full Lace Wig", "Edge Control Gel"], total: 87500, status: "delivered" },
];

const statusColors: Record<string, string> = { delivered: "bg-emerald-50 text-emerald-700", shipped: "bg-blue-50 text-blue-700", processing: "bg-amber-50 text-amber-700", pending: "bg-gray-50 text-gray-600" };

export default function OrdersPage() {
  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <h2 className="font-heading font-semibold text-charcoal mb-4">Order History</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">{["Order", "Date", "Items", "Status", "Total"].map((h) => <th key={h} className="text-left py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-border/50 last:border-0">
                <td className="py-3 font-medium text-charcoal">{order.id}</td>
                <td className="py-3 text-muted-foreground">{order.date}</td>
                <td className="py-3 text-muted-foreground">{order.items.join(", ")}</td>
                <td className="py-3"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${statusColors[order.status]}`}>{order.status}</span></td>
                <td className="py-3 text-right font-medium text-charcoal">₦{order.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
