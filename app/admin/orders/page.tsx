"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2, Eye, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminOrders, useUpdateAdminOrder, type AdminOrder } from "@/hooks/queries";

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700", PROCESSING: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-purple-50 text-purple-700", DELIVERED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-600", RETURNED: "bg-orange-50 text-orange-600",
};
const statusLabels: Record<string, string> = {
  PENDING: "Pending", PROCESSING: "Processing", SHIPPED: "Shipped",
  DELIVERED: "Delivered", CANCELLED: "Cancelled", RETURNED: "Returned",
};

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { data, isLoading } = useAdminOrders({ status: filterStatus, search }, 60_000);
  const orders = data?.orders ?? [];
  const updateOrder = useUpdateAdminOrder();

  useEffect(() => { if (successMsg) { const t = setTimeout(() => setSuccessMsg(""), 3000); return () => clearTimeout(t); } }, [successMsg]);

  const updateStatus = (id: string, status: string) => {
    setUpdatingId(id);
    updateOrder.mutate(
      { id, status },
      {
        onSuccess: () => {
          setSuccessMsg(`Order ${status.toLowerCase()}`);
          if (selected?.id === id) { setShowDetail(false); setSelected(null); }
        },
        onError: (err) => { setErrorMsg(err instanceof Error ? err.message : "Failed"); },
        onSettled: () => { setUpdatingId(null); },
      }
    );
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage customer orders</p>
      </div>

      {successMsg && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between"><span>{successMsg}</span><button onClick={() => setSuccessMsg("")} className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center"><X className="h-4 w-4" /></button></div>}
      {errorMsg && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between"><span>{errorMsg}</span><button onClick={() => setErrorMsg("")} className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center"><X className="h-4 w-4" /></button></div>}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order number or customer..." className="w-full bg-white border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" />
        </div>
        <div className="flex gap-1 bg-white border border-border rounded-lg p-1 overflow-x-auto">
          {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={cn("px-3 py-2.5 rounded-md text-xs font-medium transition-all capitalize min-h-[44px] whitespace-nowrap", filterStatus === s ? "bg-charcoal text-white" : "text-muted-foreground hover:text-charcoal")}>{s === "all" ? "All" : statusLabels[s.toUpperCase()] || s}</button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center"><Loader2 className="h-6 w-6 text-gold animate-spin mx-auto" /></div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center"><Package className="h-10 w-10 text-border mx-auto mb-3" /><p className="text-muted-foreground">No orders found</p></div>
      ) : (
        <>
          <div className="sm:hidden space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="bg-white border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-xs font-medium text-charcoal">{o.orderNumber}</p>
                    <p className="text-sm text-charcoal mt-0.5">{o.customerProfile.user.name}</p>
                  </div>
                  <button onClick={() => { setSelected(o); setShowDetail(true); }} className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-charcoal hover:bg-cream"><Eye className="h-4 w-4" /></button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDate(o.createdAt)}</span>
                  <span>·</span>
                  <span>{o.items.length} items</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-charcoal">₦{o.total.toLocaleString()}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full", o.payments[0]?.status === "PAID" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{o.payments[0]?.status || "NONE"}</span>
                    <span className={cn("inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider", statusColors[o.status])}>{statusLabels[o.status] || o.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden sm:block bg-white border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-cream/50">
                  {["Order", "Customer", "Date", "Items", "Total", "Payment", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-border/50 last:border-0 hover:bg-cream/30">
                      <td className="px-5 py-4 font-mono text-xs font-medium text-charcoal">{o.orderNumber}</td>
                      <td className="px-5 py-4 text-sm text-charcoal">{o.customerProfile.user.name}</td>
                      <td className="px-5 py-4 text-muted-foreground text-sm">{formatDate(o.createdAt)}</td>
                      <td className="px-5 py-4 text-muted-foreground">{o.items.length}</td>
                      <td className="px-5 py-4 font-medium text-charcoal">₦{o.total.toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <span className={cn("text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full", o.payments[0]?.status === "PAID" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{o.payments[0]?.status || "NONE"}</span>
                      </td>
                      <td className="px-5 py-4"><span className={cn("inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider", statusColors[o.status])}>{statusLabels[o.status] || o.status}</span></td>
                      <td className="px-5 py-4">
                        <button onClick={() => { setSelected(o); setShowDetail(true); }} className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-charcoal hover:bg-cream"><Eye className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {showDetail && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowDetail(false)} />
          <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-heading text-lg font-semibold text-charcoal">Order Details</h2>
                <p className="text-xs text-muted-foreground font-mono">{selected.orderNumber}</p>
              </div>
              <button onClick={() => setShowDetail(false)} className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-charcoal hover:bg-cream"><X className="h-5 w-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="flex items-center gap-3">
                <span className={cn("inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider", statusColors[selected.status])}>{statusLabels[selected.status]}</span>
              </div>

              <div className="bg-cream rounded-lg p-4">
                <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-2">Items</p>
                {selected.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-1.5 text-sm">
                    <div className="h-8 w-8 bg-white rounded shrink-0 overflow-hidden flex items-center justify-center">
                      {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : <Package className="h-3 w-3 text-border" />}
                    </div>
                    <span className="text-charcoal flex-1">{item.name} × {item.quantity}</span>
                    <span className="font-medium text-charcoal">₦{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t border-border mt-2 pt-2 flex justify-between text-sm">
                  <span className="font-semibold text-charcoal">Total</span>
                  <span className="font-heading font-bold text-charcoal">₦{selected.total.toLocaleString()}</span>
                </div>
              </div>

              {selected.shippingAddress && (
                <div><p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">Shipping Address</p><p className="text-sm text-muted-foreground bg-cream rounded-lg p-3">{selected.shippingAddress}</p></div>
              )}

              <div className="flex flex-wrap gap-2">
                {selected.status === "PENDING" && <Button onClick={() => updateStatus(selected.id, "PROCESSING")} disabled={updatingId === selected.id} className="bg-blue-600 text-white hover:bg-blue-700 rounded-full text-xs font-semibold tracking-wider uppercase min-h-[44px]">Process</Button>}
                {selected.status === "PROCESSING" && <Button onClick={() => updateStatus(selected.id, "SHIPPED")} disabled={updatingId === selected.id} className="bg-purple-600 text-white hover:bg-purple-700 rounded-full text-xs font-semibold tracking-wider uppercase min-h-[44px]">Ship</Button>}
                {selected.status === "SHIPPED" && <Button onClick={() => updateStatus(selected.id, "DELIVERED")} disabled={updatingId === selected.id} className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-full text-xs font-semibold tracking-wider uppercase min-h-[44px]">Delivered</Button>}
                {["PENDING", "PROCESSING"].includes(selected.status) && (
                  <Button onClick={() => updateStatus(selected.id, "CANCELLED")} disabled={updatingId === selected.id} variant="outline" className="rounded-full text-xs font-semibold tracking-wider uppercase text-red-500 border-red-200 hover:bg-red-50 min-h-[44px]">Cancel</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
