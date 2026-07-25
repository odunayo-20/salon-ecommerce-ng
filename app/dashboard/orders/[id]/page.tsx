"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useOrderDetail, useCancelOrder, type OrderDetail,
} from "@/hooks/queries";
import {
  ArrowLeft, Package, CreditCard, Banknote, Truck, MapPin,
  Tag, Star, Clock, CheckCircle, CircleDot, AlertCircle,
  Loader2, ExternalLink,
} from "lucide-react";

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
  CASH: { label: "Pay on Delivery", icon: Truck, cls: "text-amber-600 bg-amber-50" },
};

const timelineSteps = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

function getTimelineData(order: OrderDetail) {
  const statusIdx = timelineSteps.indexOf(order.status as typeof timelineSteps[number]);
  const isTerminal = order.status === "CANCELLED" || order.status === "RETURNED";
  const currentIdx = isTerminal ? -1 : statusIdx;

  const steps = timelineSteps.map((step, i) => {
    const reached = currentIdx >= i;
    const isCurrent = order.status === step;
    let timestamp: string | null = null;

    if (step === "PENDING") timestamp = order.createdAt;
    else if (step === "SHIPPED") timestamp = order.shippedAt;
    else if (step === "DELIVERED") timestamp = order.deliveredAt;

    return { step, reached, isCurrent, timestamp };
  });

  return { steps, isTerminal };
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString("en-NG", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-NG", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function DetailSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-32 bg-cream rounded-2xl" />
      <div className="h-48 bg-cream rounded-2xl" />
      <div className="h-24 bg-cream rounded-2xl" />
      <div className="h-24 bg-cream rounded-2xl" />
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { data, isLoading, error } = useOrderDetail(id);
  const cancelOrder = useCancelOrder();
  const [cancelling, setCancelling] = useState(false);

  const order = data?.order;

  const handleCancel = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      await cancelOrder.mutateAsync(order.id);
    } finally {
      setCancelling(false);
    }
  };

  const payment = order?.payments?.[0];
  const methodInfo = payment ? methodMeta[payment.method] : null;
  const MethodIcon = methodInfo?.icon || CreditCard;
  const timeline = order ? getTimelineData(order) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/dashboard/orders")}
          className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-charcoal hover:bg-cream"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="font-heading font-semibold text-charcoal text-lg sm:text-xl">
            {order ? `Order ${order.orderNumber}` : "Order Details"}
          </h2>
          {order && (
            <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
          )}
        </div>
      </div>

      {isLoading ? (
        <DetailSkeleton />
      ) : error ? (
        <div className="bg-white border border-border rounded-2xl p-10 text-center">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">Failed to load order details</p>
          <Link href="/dashboard/orders">
            <Button variant="outline" className="rounded-full text-xs font-semibold tracking-wider uppercase">
              View Orders
            </Button>
          </Link>
        </div>
      ) : !order ? (
        <div className="bg-white border border-border rounded-2xl p-10 text-center">
          <Package className="h-10 w-10 text-border mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">Order not found</p>
          <Link href="/dashboard/orders">
            <Button variant="outline" className="rounded-full text-xs font-semibold tracking-wider uppercase">
              View Orders
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Status & Payment Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider", statusColors[order.status])}>
              {statusLabels[order.status]}
            </span>
            {methodInfo && (
              <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold", methodInfo.cls)}>
                <MethodIcon className="h-3 w-3" />{methodInfo.label}
              </span>
            )}
            {payment && (
              <span className={cn(
                "inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase",
                payment.status === "PAID" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              )}>
                {payment.status === "PAID" ? "Paid" : payment.status}
              </span>
            )}
          </div>

          {/* ─── Timeline ──────────────────────────────── */}
          {order.status !== "RETURNED" && (
            <div className="bg-white border border-border rounded-2xl p-5 sm:p-6">
              <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-5 flex items-center gap-1.5">
                <Clock className="h-3 w-3" />Order Timeline
              </p>

              {/* Desktop: horizontal */}
              <div className="hidden sm:block">
                <div className="relative flex items-start">
                  {timeline!.steps.map((s, i) => {
                    const isLast = i === timeline!.steps.length - 1;
                    return (
                      <div key={s.step} className="flex-1 relative">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all z-10",
                            s.reached
                              ? "bg-gold border-gold text-white"
                              : "bg-white border-border text-muted-foreground",
                            s.isCurrent && "ring-2 ring-gold/30 ring-offset-2"
                          )}>
                            {s.reached ? <CheckCircle className="h-4 w-4" /> : <CircleDot className="h-4 w-4" />}
                          </div>
                          <span className={cn("text-[11px] mt-2 font-medium text-center", s.reached ? "text-charcoal" : "text-muted-foreground")}>
                            {statusLabels[s.step]}
                          </span>
                          {s.timestamp && (
                            <span className="text-[9px] text-muted-foreground mt-0.5 text-center">
                              {formatDateTime(s.timestamp)}
                            </span>
                          )}
                        </div>
                        {!isLast && (
                          <div className={cn(
                            "absolute top-[18px] left-[calc(50%+18px)] right-[calc(-50%+18px)] h-0.5",
                            timeline!.steps[i + 1]?.reached ? "bg-gold" : "bg-border"
                          )} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile: vertical */}
              <div className="sm:hidden space-y-0">
                {timeline!.steps.map((s, i) => {
                  const isLast = i === timeline!.steps.length - 1;
                  return (
                    <div key={s.step} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 z-10",
                          s.reached
                            ? "bg-gold border-gold text-white"
                            : "bg-white border-border text-muted-foreground",
                          s.isCurrent && "ring-2 ring-gold/30 ring-offset-1"
                        )}>
                          {s.reached ? <CheckCircle className="h-3.5 w-3.5" /> : <CircleDot className="h-3.5 w-3.5" />}
                        </div>
                        {!isLast && (
                          <div className={cn("w-0.5 flex-1 min-h-[24px]", timeline!.steps[i + 1]?.reached ? "bg-gold" : "bg-border")} />
                        )}
                      </div>
                      <div className="pb-5 pt-1">
                        <p className={cn("text-sm font-medium", s.reached ? "text-charcoal" : "text-muted-foreground")}>
                          {statusLabels[s.step]}
                        </p>
                        {s.timestamp && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {formatDateTime(s.timestamp)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {timeline!.isTerminal && (
                <div className="mt-4 flex items-center gap-1.5 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  Order was {order.status === "CANCELLED" ? "cancelled" : "returned"}
                  {order.deliveredAt ? ` on ${formatDateTime(order.deliveredAt)}` : ""}
                </div>
              )}
            </div>
          )}

          {/* Tracking Number */}
          {order.trackingNumber && (
            <div className="bg-white border border-border rounded-2xl p-5 flex items-center gap-3">
              <Truck className="h-5 w-5 text-gold shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-charcoal uppercase tracking-wider">Tracking Number</p>
                <p className="text-sm font-mono text-charcoal mt-0.5">{order.trackingNumber}</p>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="bg-white border border-border rounded-2xl p-5 sm:p-6">
            <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-3">Items</p>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-cream rounded-lg shrink-0 overflow-hidden flex items-center justify-center">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} width={48} height={48} className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-4 w-4 text-border" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/shop/${item.slug}`} className="text-sm font-medium text-charcoal hover:text-gold transition-colors flex items-center gap-1">
                      {item.name}
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                    </Link>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium text-charcoal shrink-0">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-border mt-4 pt-4 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-charcoal">₦{order.subtotal.toLocaleString()}</span>
              </div>
              {order.shippingCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-charcoal">₦{order.shippingCost.toLocaleString()}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-green-600">Discount</span>
                  <span className="text-green-600">-₦{order.discount.toLocaleString()}</span>
                </div>
              )}
              {order.pointsRedeemed > 0 && (
                <div className="flex justify-between">
                  <span className="text-green-600">Points Discount</span>
                  <span className="text-green-600">-{order.pointsRedeemed.toLocaleString()} pts</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2">
                <span className="font-semibold text-charcoal">Total</span>
                <span className="font-heading font-bold text-charcoal text-lg">₦{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Coupon */}
          {order.couponCode && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-2">
              <Tag className="h-4 w-4 text-green-600 shrink-0" />
              <span className="text-sm font-medium text-green-700">Coupon: {order.couponCode}</span>
            </div>
          )}

          {/* Loyalty Points */}
          {(order.pointsRedeemed > 0 || order.loyaltyPointsEarned > 0) && (
            <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 flex items-center gap-2">
              <Star className="h-4 w-4 text-gold shrink-0" />
              <span className="text-sm text-charcoal">
                {order.pointsRedeemed > 0 && (
                  <span className="font-medium">Redeemed {order.pointsRedeemed.toLocaleString()} pts</span>
                )}
                {order.pointsRedeemed > 0 && order.loyaltyPointsEarned > 0 && <span> · </span>}
                {order.loyaltyPointsEarned > 0 && (
                  <span className="font-medium">Earned {order.loyaltyPointsEarned.toLocaleString()} pts</span>
                )}
              </span>
            </div>
          )}

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white border border-border rounded-2xl p-5">
              <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />Shipping Address
              </p>
              <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
            </div>
          )}

          {/* Payment Info */}
          {payment && (
            <div className="bg-white border border-border rounded-2xl p-5">
              <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CreditCard className="h-3 w-3" />Payment Details
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="text-charcoal">{methodInfo?.label || payment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference</span>
                  <span className="text-charcoal font-mono text-xs">{payment.reference}</span>
                </div>
                {payment.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paid</span>
                    <span className="text-charcoal">{formatDateTime(payment.paidAt)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {(order.status === "PENDING" || order.status === "PROCESSING") && (
              <Button
                variant="outline"
                disabled={cancelling}
                onClick={handleCancel}
                className="rounded-full text-xs font-semibold tracking-wider uppercase text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 min-h-[44px] px-6"
              >
                {cancelling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Cancel Order
              </Button>
            )}
            <Link href="/shop">
              <Button variant="outline" className="rounded-full text-xs font-semibold tracking-wider uppercase min-h-[44px] px-6">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
