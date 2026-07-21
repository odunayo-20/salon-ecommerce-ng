"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Eye, X, ChevronDown } from "lucide-react";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customer: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: string;
  payment: string;
}

const initialOrders: Order[] = [
  { id: "ORD-001", customer: "Adaeze O.", date: "2024-01-28", items: [{ name: "Knotless Braids", quantity: 1, price: 25000 }, { name: "Edge Control Gel", quantity: 1, price: 2500 }], total: 49500, status: "Delivered", payment: "Stripe" },
  { id: "ORD-002", customer: "Folake M.", date: "2024-01-25", items: [{ name: "Full Lace Wig", quantity: 1, price: 85000 }], total: 85000, status: "Shipped", payment: "Flutterwave" },
  { id: "ORD-003", customer: "Ngozi A.", date: "2024-01-22", items: [{ name: "Silk Press", quantity: 1, price: 12000 }, { name: "Growth Oil Serum", quantity: 1, price: 4500 }, { name: "Acrylic Nails", quantity: 1, price: 5000 }], total: 17500, status: "Processing", payment: "Card" },
  { id: "ORD-004", customer: "Blessing E.", date: "2024-01-20", items: [{ name: "Full Lace Wig", quantity: 1, price: 25000 }], total: 25000, status: "Pending", payment: "Bank Transfer" },
];

const statusOptions = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const statusColors: Record<string, string> = {
  Delivered: "bg-emerald-50 text-emerald-700",
  Shipped: "bg-blue-50 text-blue-700",
  Processing: "bg-amber-50 text-amber-700",
  Pending: "bg-gray-50 text-gray-600",
  Cancelled: "bg-red-50 text-red-600",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(
    (o) => o.id.toLowerCase().includes(searchQuery.toLowerCase()) || o.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateStatus = (orderId: string, newStatus: string) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-charcoal">Orders</h1>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by order or customer..." className="bg-cream border border-border rounded-full pl-9 pr-4 py-2 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold w-64" />
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-cream/50">
              {["Order", "Customer", "Date", "Items", "Total", "Payment", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((o) => (
              <tr key={o.id} className="border-b border-border/50 last:border-0 hover:bg-cream/30">
                <td className="px-5 py-4 font-medium text-charcoal">{o.id}</td>
                <td className="px-5 py-4 text-muted-foreground">{o.customer}</td>
                <td className="px-5 py-4 text-muted-foreground">{o.date}</td>
                <td className="px-5 py-4 text-muted-foreground">{o.items.length}</td>
                <td className="px-5 py-4 font-medium text-charcoal">₦{o.total.toLocaleString()}</td>
                <td className="px-5 py-4 text-muted-foreground">{o.payment}</td>
                <td className="px-5 py-4">
                  <div className="relative">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className={`appearance-none text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 pr-7 rounded-full border-0 cursor-pointer focus:outline-none ${statusColors[o.status]}`}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </td>
                <td className="px-5 py-4">
                  <button onClick={() => setViewingOrder(o)} className="text-gold hover:text-gold-dark text-xs font-medium flex items-center gap-1">
                    <Eye className="w-3 h-3" /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewingOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-2xl max-w-lg w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-lg font-bold text-charcoal">Order {viewingOrder.id}</h2>
              <button onClick={() => setViewingOrder(null)} className="text-muted-foreground hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Customer</span>
                <span className="text-charcoal font-medium">{viewingOrder.customer}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="text-charcoal">{viewingOrder.date}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment</span>
                <span className="text-charcoal">{viewingOrder.payment}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${statusColors[viewingOrder.status]}`}>{viewingOrder.status}</span>
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Items</h3>
              <div className="space-y-2">
                {viewingOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm bg-cream/50 rounded-lg px-4 py-2">
                    <span className="text-charcoal">{item.name} × {item.quantity}</span>
                    <span className="font-medium text-charcoal">₦{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm font-bold mt-3 pt-3 border-t border-border">
                <span className="text-charcoal">Total</span>
                <span className="text-gold">₦{viewingOrder.total.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={() => setViewingOrder(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
