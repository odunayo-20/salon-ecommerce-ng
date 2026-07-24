"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, Loader2 } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  shippingAddress: string | null;
  items: { name: string; quantity: number; price: number; image?: string }[];
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }

    const fetchOrder = async () => {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        const found = data.orders?.find((o: Order) => o.id === orderId);
        setOrder(found || null);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };

    fetchOrder();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-charcoal py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">Order Confirmed!</h1>
          <p className="text-white/60 mt-2">Thank you for your purchase.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white border border-border rounded-2xl p-8 text-center space-y-6">
          <CheckCircle className="h-16 w-16 text-gold mx-auto" />
          <h2 className="font-heading text-2xl font-bold text-charcoal">Thank You!</h2>

          {loading ? (
            <Loader2 className="h-6 w-6 text-gold animate-spin mx-auto" />
          ) : order ? (
            <>
              <p className="text-sm text-muted-foreground">Order <span className="font-mono font-semibold text-charcoal">{order.orderNumber}</span></p>
              <div className="max-w-sm mx-auto space-y-3 text-left">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-border/50">
                    <div className="h-10 w-10 bg-cream rounded shrink-0 overflow-hidden flex items-center justify-center">
                      {item.image ? <Image src={item.image} alt={item.name} width={40} height={40} className="h-full w-full object-cover" /> : <Package className="h-3 w-3 text-border" />}
                    </div>
                    <span className="text-sm text-charcoal flex-1">{item.name} × {item.quantity}</span>
                    <span className="text-sm font-medium text-charcoal">₦{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 border-t border-border pt-2">
                  <span className="text-sm font-semibold text-charcoal">Total</span>
                  <span className="text-lg font-heading font-bold text-charcoal">₦{order.total.toLocaleString()}</span>
                </div>
              </div>
              {order.shippingAddress && (
                <div className="bg-cream rounded-lg p-4 text-left">
                  <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">Shipping To</p>
                  <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">A confirmation email has been sent to your email address.</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Your order has been placed successfully.</p>
          )}

          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/dashboard/orders">
              <Button className="bg-charcoal text-white hover:bg-charcoal-light rounded-full px-8 text-xs font-semibold tracking-wider uppercase">
                <Package className="h-4 w-4 mr-2" />View Orders
              </Button>
            </Link>
            <Link href="/shop">
              <Button variant="outline" className="rounded-full px-8 text-xs font-semibold tracking-wider uppercase">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
