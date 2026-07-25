"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Search, X, Loader2, Eye, Package, CreditCard, Banknote, Truck,
  MapPin, FileText, Tag, Star, Clock, CheckCircle, CircleDot, AlertCircle,
  Download, CheckSquare, Square, ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminOrders, useUpdateAdminOrder, useBulkUpdateOrders, type AdminOrder } from "@/hooks/queries";

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700", PROCESSING: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-purple-50 text-purple-700", DELIVERED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-600", RETURNED: "bg-orange-50 text-orange-600",
};
const statusLabels: Record<string, string> = {
  PENDING: "Pending", PROCESSING: "Processing", SHIPPED: "Shipped",
  DELIVERED: "Delivered", CANCELLED: "Cancelled", RETURNED: "Returned",
};
const methodMeta: Record<string, { label: string; icon: typeof CreditCard; cls: string }> = {
  STRIPE: { label: "Stripe (Card)", icon: CreditCard, cls: "text-purple-600 bg-purple-50" },
  PAYSTACK: { label: "Paystack", icon: Banknote, cls: "text-blue-600 bg-blue-50" },
  CASH: { label: "Cash on Delivery", icon: Truck, cls: "text-amber-600 bg-amber-50" },
};
const allStatuses = ["all", "pending", "processing", "shipped", "delivered", "cancelled", "returned"];
const timelineSteps = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkStatus, setBulkStatus] = useState("");

  const { data, isLoading } = useAdminOrders({ status: filterStatus, search, page }, 60_000);
  const orders = data?.orders ?? [];
  const pagination = data?.pagination;
  const updateOrder = useUpdateAdminOrder();
  const bulkUpdate = useBulkUpdateOrders();

  useEffect(() => { if (successMsg) { const t = setTimeout(() => setSuccessMsg(""), 3000); return () => clearTimeout(t); } }, [successMsg]);

  const updateStatus = (id: string, status: string, extra?: { trackingNumber?: string; notes?: string }) => {
    setUpdatingId(id);
    updateOrder.mutate(
      { id, status, ...extra },
      {
        onSuccess: (updated) => {
          setSuccessMsg(`Order marked as ${statusLabels[status] || status}`);
          if (updated?.order) setSelected(updated.order as AdminOrder);
          else { setShowDetail(false); setSelected(null); }
        },
        onError: (err) => { setErrorMsg(err instanceof Error ? err.message : "Failed"); },
        onSettled: () => { setUpdatingId(null); },
      }
    );
  };

  const handleBulkUpdate = () => {
    if (!bulkStatus || selectedIds.size === 0) return;
    setUpdatingId("bulk");
    bulkUpdate.mutate(
      { orderIds: Array.from(selectedIds), status: bulkStatus },
      {
        onSuccess: (result) => {
          setSuccessMsg(`${result?.updated || 0} orders updated to ${statusLabels[bulkStatus] || bulkStatus}`);
          setSelectedIds(new Set());
          setBulkMode(false);
          setBulkStatus("");
        },
        onError: (err) => { setErrorMsg(err instanceof Error ? err.message : "Bulk update failed"); },
        onSettled: () => { setUpdatingId(null); },
      }
    );
  };

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === orders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map((o) => o.id)));
    }
  }, [selectedIds.size, orders]);

  const handleExport = () => {
    const params = new URLSearchParams();
    if (filterStatus !== "all") params.set("status", filterStatus);
    if (search) params.set("search", search);
    window.open(`/api/admin/orders/export?${params}`, "_blank");
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
  const formatDateTime = (d: string) => new Date(d).toLocaleString("en-NG", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-charcoal tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="rounded-full text-xs font-semibold tracking-wider uppercase min-h-[44px] px-4">
            <Download className="h-3.5 w-3.5 mr-1.5" />Export CSV
          </Button>
          <Button variant={bulkMode ? "default" : "outline"} size="sm" onClick={() => { setBulkMode(!bulkMode); setSelectedIds(new Set()); }} className={cn("rounded-full text-xs font-semibold tracking-wider uppercase min-h-[44px] px-4", bulkMode && "bg-charcoal text-white")}>
            <CheckSquare className="h-3.5 w-3.5 mr-1.5" />Bulk Edit
          </Button>
        </div>
      </div>

      {successMsg && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between"><span>{successMsg}</span><button onClick={() => setSuccessMsg("")} className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center"><X className="h-4 w-4" /></button></div>}
      {errorMsg && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between"><span>{errorMsg}</span><button onClick={() => setErrorMsg("")} className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center"><X className="h-4 w-4" /></button></div>}

      {/* Bulk action bar */}
      {bulkMode && selectedIds.size > 0 && (
        <div className="bg-charcoal text-white rounded-lg px-4 py-3 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold">
            <option value="">Select status...</option>
            {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <Button size="sm" disabled={!bulkStatus || updatingId === "bulk"} onClick={handleBulkUpdate} className="bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold min-h-[36px]">
            {updatingId === "bulk" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setBulkMode(false); setSelectedIds(new Set()); }} className="text-white/70 hover:text-white rounded-full text-xs min-h-[36px]">Cancel</Button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by order number, customer name, or email..." className="w-full bg-white border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" />
        </div>
        <div className="flex gap-1 bg-white border border-border rounded-lg p-1 overflow-x-auto">
          {allStatuses.map((s) => (
            <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }} className={cn("px-3 py-2.5 rounded-md text-xs font-medium transition-all capitalize min-h-[44px] whitespace-nowrap", filterStatus === s ? "bg-charcoal text-white" : "text-muted-foreground hover:text-charcoal")}>{s === "all" ? "All" : statusLabels[s.toUpperCase()] || s}</button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center"><Loader2 className="h-6 w-6 text-gold animate-spin mx-auto" /></div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center"><Package className="h-10 w-10 text-border mx-auto mb-3" /><p className="text-muted-foreground">No orders found</p></div>
      ) : (
        <>
          {/* Mobile */}
          <div className="sm:hidden space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="bg-white border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {bulkMode && (
                      <button onClick={() => toggleSelect(o.id)} className="shrink-0">
                        {selectedIds.has(o.id) ? <CheckSquare className="h-4 w-4 text-gold" /> : <Square className="h-4 w-4 text-border" />}
                      </button>
                    )}
                    <div>
                      <p className="font-mono text-xs font-medium text-charcoal">{o.orderNumber}</p>
                      <p className="text-sm text-charcoal mt-0.5">{o.customerProfile?.user?.name || "—"}</p>
                    </div>
                  </div>
                  <button onClick={() => { setSelected(o); setShowDetail(true); }} className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-charcoal hover:bg-cream"><Eye className="h-4 w-4" /></button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDate(o.createdAt)}</span>
                  <span>·</span>
                  <span>{o.items.length} items</span>
                  {o.payments[0] && (
                    <>
                      <span>·</span>
                      <span className={cn("text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full", methodMeta[o.payments[0].method]?.cls || "bg-gray-50 text-gray-600")}>
                        {methodMeta[o.payments[0].method]?.label || o.payments[0].method}
                      </span>
                    </>
                  )}
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

          {/* Desktop Table */}
          <div className="hidden sm:block bg-white border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-cream/50">
                  {bulkMode && <th className="px-3 py-3 w-10"><button onClick={toggleSelectAll}>{selectedIds.size === orders.length ? <CheckSquare className="h-4 w-4 text-gold" /> : <Square className="h-4 w-4 text-border" />}</button></th>}
                  {["Order", "Customer", "Date", "Items", "Total", "Payment", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className={cn("border-b border-border/50 last:border-0 hover:bg-cream/30", selectedIds.has(o.id) && "bg-gold/5")}>
                      {bulkMode && <td className="px-3 py-4"><button onClick={() => toggleSelect(o.id)}>{selectedIds.has(o.id) ? <CheckSquare className="h-4 w-4 text-gold" /> : <Square className="h-4 w-4 text-border" />}</button></td>}
                      <td className="px-5 py-4 font-mono text-xs font-medium text-charcoal">{o.orderNumber}</td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-charcoal">{o.customerProfile?.user?.name || "—"}</p>
                        <p className="text-[10px] text-muted-foreground">{o.customerProfile?.user?.email || ""}</p>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground text-sm">{formatDate(o.createdAt)}</td>
                      <td className="px-5 py-4 text-muted-foreground">{o.items.length}</td>
                      <td className="px-5 py-4 font-medium text-charcoal">₦{o.total.toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          {o.payments[0] && (
                            <span className={cn("text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full w-fit", methodMeta[o.payments[0].method]?.cls || "bg-gray-50 text-gray-600")}>
                              {methodMeta[o.payments[0].method]?.label || o.payments[0].method}
                            </span>
                          )}
                          <span className={cn("text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full w-fit", o.payments[0]?.status === "PAID" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{o.payments[0]?.status || "NONE"}</span>
                        </div>
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
            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>Page {pagination.page} of {pagination.pages} ({pagination.total} orders)</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="min-h-[32px] px-3 rounded-full text-xs"><ChevronLeft className="h-3.5 w-3.5" /></Button>
                  <Button variant="outline" size="sm" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)} className="min-h-[32px] px-3 rounded-full text-xs"><ChevronRight className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Detail Modal */}
      {showDetail && selected && (
        <DetailModal
          order={selected}
          updatingId={updatingId}
          onClose={() => { setShowDetail(false); setSelected(null); }}
          onUpdate={updateStatus}
          formatDateTime={formatDateTime}
        />
      )}
    </div>
  );
}

function DetailModal({
  order,
  updatingId,
  onClose,
  onUpdate,
  formatDateTime,
}: {
  order: AdminOrder;
  updatingId: string | null;
  onClose: () => void;
  onUpdate: (id: string, status: string, extra?: { trackingNumber?: string; notes?: string }) => void;
  formatDateTime: (d: string) => string;
}) {
  const [trackingInput, setTrackingInput] = useState(order.trackingNumber || "");
  const [notesInput, setNotesInput] = useState(order.notes || "");
  const [savingFields, setSavingFields] = useState(false);

  const payment = order.payments[0];
  const methodInfo = payment ? methodMeta[payment.method] : null;
  const MethodIcon = methodInfo?.icon || CreditCard;
  const currentStep = timelineSteps.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED" || order.status === "RETURNED";

  const saveFields = async (extra: { trackingNumber?: string; notes?: string }) => {
    setSavingFields(true);
    try {
      await onUpdate(order.id, order.status, extra);
    } finally {
      setSavingFields(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-heading text-lg font-semibold text-charcoal">Order Details</h2>
            <p className="text-xs text-muted-foreground font-mono">{order.orderNumber}</p>
          </div>
          <button onClick={onClose} className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-charcoal hover:bg-cream"><X className="h-5 w-5" /></button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider", statusColors[order.status])}>{statusLabels[order.status]}</span>
            {methodInfo && (
              <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold", methodInfo.cls)}>
                <MethodIcon className="h-3 w-3" />{methodInfo.label}
              </span>
            )}
            {payment && (
              <span className={cn("inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase", payment.status === "PAID" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
                {payment.status}
              </span>
            )}
          </div>

          {order.status !== "RETURNED" && (
            <div className="bg-cream rounded-lg p-4">
              <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-3 flex items-center gap-1.5"><Clock className="h-3 w-3" />Order Timeline</p>
              <div className="flex items-center justify-between">
                {timelineSteps.map((step, i) => {
                  const reached = isCancelled ? step === "PENDING" : i <= currentStep;
                  const isCurrent = !isCancelled && order.status === step;
                  return (
                    <div key={step} className="flex flex-col items-center flex-1">
                      <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all", reached ? "bg-gold border-gold text-white" : "bg-white border-border text-muted-foreground", isCurrent && "ring-2 ring-gold/30")}>
                        {reached ? <CheckCircle className="h-3.5 w-3.5" /> : <CircleDot className="h-3.5 w-3.5" />}
                      </div>
                      <span className={cn("text-[10px] mt-1 font-medium", reached ? "text-charcoal" : "text-muted-foreground")}>{statusLabels[step]}</span>
                      {step === "SHIPPED" && order.shippedAt && <span className="text-[9px] text-muted-foreground">{formatDateTime(order.shippedAt)}</span>}
                      {step === "DELIVERED" && order.deliveredAt && <span className="text-[9px] text-muted-foreground">{formatDateTime(order.deliveredAt)}</span>}
                    </div>
                  );
                })}
              </div>
              {isCancelled && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Order was cancelled{order.deliveredAt ? ` at ${formatDateTime(order.deliveredAt)}` : ""}
                </div>
              )}
            </div>
          )}

          {order.customerProfile?.user && (
            <div className="bg-cream rounded-lg p-4">
              <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-2">Customer</p>
              <p className="text-sm font-medium text-charcoal">{order.customerProfile.user.name || "—"}</p>
              {order.customerProfile.user.email && <p className="text-xs text-muted-foreground">{order.customerProfile.user.email}</p>}
              {order.customerProfile.user.phone && <p className="text-xs text-muted-foreground">{order.customerProfile.user.phone}</p>}
            </div>
          )}

          <div className="bg-cream rounded-lg p-4">
            <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-2">Items</p>
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-1.5 text-sm">
                <div className="h-8 w-8 bg-white rounded shrink-0 overflow-hidden flex items-center justify-center">
                  {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : <Package className="h-3 w-3 text-border" />}
                </div>
                <span className="text-charcoal flex-1">{item.name} × {item.quantity}</span>
                <span className="font-medium text-charcoal">₦{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t border-border mt-2 pt-2 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="text-charcoal">₦{order.subtotal.toLocaleString()}</span></div>
              {order.shippingCost > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-charcoal">₦{order.shippingCost.toLocaleString()}</span></div>}
              {order.discount > 0 && <div className="flex justify-between"><span className="text-green-600">Discount</span><span className="text-green-600">-₦{order.discount.toLocaleString()}</span></div>}
              {order.pointsRedeemed > 0 && <div className="flex justify-between"><span className="text-green-600">Points</span><span className="text-green-600">-{order.pointsRedeemed.toLocaleString()} pts</span></div>}
              <div className="flex justify-between border-t border-border pt-1"><span className="font-semibold text-charcoal">Total</span><span className="font-heading font-bold text-charcoal">₦{order.total.toLocaleString()}</span></div>
            </div>
          </div>

          {order.couponCode && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-green-600 shrink-0" />
              <span className="text-xs font-medium text-green-700">Coupon: {order.couponCode}</span>
            </div>
          )}

          {(order.pointsRedeemed > 0 || order.loyaltyPointsEarned > 0) && (
            <div className="bg-gold/5 border border-gold/20 rounded-lg p-3 flex items-center gap-2">
              <Star className="h-3.5 w-3.5 text-gold shrink-0" />
              <span className="text-xs text-charcoal">
                {order.pointsRedeemed > 0 && <span className="font-medium">Redeemed {order.pointsRedeemed.toLocaleString()} pts</span>}
                {order.pointsRedeemed > 0 && order.loyaltyPointsEarned > 0 && <span> · </span>}
                {order.loyaltyPointsEarned > 0 && <span className="font-medium">Earned {order.loyaltyPointsEarned.toLocaleString()} pts</span>}
              </span>
            </div>
          )}

          {order.shippingAddress && (
            <div>
              <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-1 flex items-center gap-1.5"><MapPin className="h-3 w-3" />Shipping Address</p>
              <p className="text-sm text-muted-foreground bg-cream rounded-lg p-3">{order.shippingAddress}</p>
            </div>
          )}

          {/* Editable Tracking Number */}
          <div>
            <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-1 flex items-center gap-1.5"><Truck className="h-3 w-3" />Tracking Number</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="Enter tracking number"
                className="flex-1 bg-cream border border-border rounded-lg px-3 py-2 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold"
              />
              {trackingInput !== (order.trackingNumber || "") && (
                <Button size="sm" variant="outline" disabled={savingFields} onClick={() => saveFields({ trackingNumber: trackingInput || undefined })} className="rounded-full text-xs min-h-[36px] px-3">
                  {savingFields ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                </Button>
              )}
            </div>
          </div>

          {/* Editable Notes */}
          <div>
            <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-1 flex items-center gap-1.5"><FileText className="h-3 w-3" />Notes</p>
            <textarea
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="Add internal notes..."
              rows={3}
              className="w-full bg-cream border border-border rounded-lg px-3 py-2 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold resize-none"
            />
            {notesInput !== (order.notes || "") && (
              <Button size="sm" variant="outline" disabled={savingFields} onClick={() => saveFields({ notes: notesInput })} className="rounded-full text-xs min-h-[36px] px-3 mt-2">
                {savingFields ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save Notes"}
              </Button>
            )}
          </div>

          <p className="text-[10px] text-muted-foreground">Created {formatDateTime(order.createdAt)}</p>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            {order.status === "PENDING" && <Button onClick={() => onUpdate(order.id, "PROCESSING")} disabled={updatingId === order.id} className="bg-blue-600 text-white hover:bg-blue-700 rounded-full text-xs font-semibold tracking-wider uppercase min-h-[44px]">{updatingId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mark Processing"}</Button>}
            {order.status === "PROCESSING" && <Button onClick={() => onUpdate(order.id, "SHIPPED")} disabled={updatingId === order.id} className="bg-purple-600 text-white hover:bg-purple-700 rounded-full text-xs font-semibold tracking-wider uppercase min-h-[44px]">{updatingId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mark Shipped"}</Button>}
            {order.status === "SHIPPED" && <Button onClick={() => onUpdate(order.id, "DELIVERED")} disabled={updatingId === order.id} className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-full text-xs font-semibold tracking-wider uppercase min-h-[44px]">{updatingId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mark Delivered"}</Button>}
            {["PENDING", "PROCESSING"].includes(order.status) && (
              <Button onClick={() => onUpdate(order.id, "CANCELLED")} disabled={updatingId === order.id} variant="outline" className="rounded-full text-xs font-semibold tracking-wider uppercase text-red-500 border-red-200 hover:bg-red-50 min-h-[44px]">{updatingId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel Order"}</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
