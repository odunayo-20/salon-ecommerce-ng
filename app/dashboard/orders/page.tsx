"use client";

import Link from "next/link";
import { useState } from "react";
import { Package, Star, Loader2, CreditCard, Banknote, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDashboardOrders, useCancelOrder } from "@/hooks/queries";

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
  STRIPE: { label: "Stripe", icon: CreditCard, cls: "text-purple-600 bg-purple-50" },
  PAYSTACK: { label: "Paystack", icon: Banknote, cls: "text-blue-600 bg-blue-50" },
  CASH: { label: "Cash", icon: Truck, cls: "text-amber-600 bg-amber-50" },
};

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="space-y-2">
              <div className="h-3.5 w-32 bg-cream rounded animate-pulse" />
              <div className="h-3 w-24 bg-cream rounded animate-pulse" />
            </div>
            <div className="h-5 w-16 bg-cream rounded-full animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-40 bg-cream rounded animate-pulse" />
              <div className="h-3.5 w-16 bg-cream rounded animate-pulse" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-32 bg-cream rounded animate-pulse" />
              <div className="h-3.5 w-14 bg-cream rounded animate-pulse" />
            </div>
          </div>
          <div className="border-t border-border mt-3 pt-3 flex justify-between">
            <div className="h-3.5 w-12 bg-cream rounded animate-pulse" />
            <div className="h-3.5 w-20 bg-cream rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardOrdersPage() {
  const { data, isLoading: loading } = useDashboardOrders(60_000);
  const orders = data?.orders ?? [];
  const cancelOrder = useCancelOrder();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = async (orderId: string) => {
    setCancellingId(orderId);
    try {
      await cancelOrder.mutateAsync(orderId);
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold text-charcoal text-lg sm:text-xl">My Orders</h2>
        <Link href="/shop"><Button variant="outline" className="rounded-full text-xs font-semibold tracking-wider uppercase min-h-[44px] px-4">Shop More</Button></Link>
      </div>

      {loading ? (
        <OrdersSkeleton />
      ) : orders.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-10 sm:p-12 text-center">
          <Package className="h-10 w-10 text-border mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">No orders yet</p>
          <Link href="/shop"><Button className="bg-charcoal text-white hover:bg-charcoal/90 rounded-full text-xs font-semibold tracking-wider uppercase px-6 min-h-[44px]">Start Shopping</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-border rounded-xl p-4 sm:p-5">
              <div className="flex items-start sm:items-center justify-between mb-3 gap-2">
                <div className="min-w-0">
                  <p className="font-mono text-xs font-medium text-charcoal">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {(() => {
                    const pm = order.payments?.[0];
                    if (pm && methodMeta[pm.method]) {
                      const m = methodMeta[pm.method];
                      const Icon = m.icon;
                      return (
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold", m.cls)}>
                          <Icon className="h-2.5 w-2.5" />{m.label}
                        </span>
                      );
                    }
                    return null;
                  })()}
                  <span className={cn("inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider", statusColors[order.status])}>{statusLabels[order.status]}</span>
                </div>
              </div>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-charcoal truncate">{item.name} × {item.quantity}</span>
                      {order.status === "DELIVERED" && (
                        <Link href={`/shop/${item.slug}#reviews`} className="shrink-0 min-h-[44px] min-w-[44px] p-2 flex items-center justify-center text-gold hover:text-gold/80 transition-colors" title="Write a review">
                          <Star className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                    <span className="font-medium text-charcoal shrink-0">₦{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-3 pt-3 flex justify-between items-center">
                <span className="text-sm font-semibold text-charcoal">Total</span>
                <div className="flex items-center gap-3">
                  <span className="font-heading font-bold text-charcoal">₦{order.total.toLocaleString()}</span>
                  {(order.status === "PENDING" || order.status === "PROCESSING") && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={cancellingId === order.id}
                      onClick={() => handleCancel(order.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-full text-[10px] font-semibold uppercase tracking-wider min-h-[32px] px-3"
                    >
                      {cancellingId === order.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Cancel"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
