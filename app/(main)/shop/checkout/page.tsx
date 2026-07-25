"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CreditCard, Truck, Shield, ArrowLeft, Star, Gift, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, getTotal, clearCart, coupon, getDiscount } = useCartStore();
  const total = getTotal();
  const discount = getDiscount();
  const afterDiscount = Math.max(total - discount, 0);
  const shipping = afterDiscount >= 30000 ? 0 : 2000;

  const [loyaltyBalance, setLoyaltyBalance] = useState(0);
  const [pointsInput, setPointsInput] = useState("");
  const [pointsRedeemed, setPointsRedeemed] = useState(0);
  const [loyaltyLoading, setLoyaltyLoading] = useState(true);

  const maxRedeemable = Math.floor(afterDiscount * 0.5);
  const effectiveRedeemed = Math.min(pointsRedeemed, maxRedeemable, loyaltyBalance);
  const grandTotal = Math.max(afterDiscount + shipping - effectiveRedeemed, 0);

  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank_transfer" | "pay_on_delivery">("card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user) {
      fetch("/api/loyalty/balance")
        .then((r) => r.json())
        .then((d) => setLoyaltyBalance(d.balance || 0))
        .catch(() => {})
        .finally(() => setLoyaltyLoading(false));
    }
  }, [session]);

  const handlePointsChange = (value: string) => {
    const num = parseInt(value) || 0;
    setPointsInput(value);
    setPointsRedeemed(num);
  };

  const applyMaxPoints = () => {
    const max = Math.min(loyaltyBalance, maxRedeemable);
    setPointsInput(String(max));
    setPointsRedeemed(max);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="bg-charcoal py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">Checkout</h1>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <p className="text-muted-foreground mb-4">Your cart is empty.</p>
          <Link href="/shop"><Button className="bg-charcoal text-white hover:bg-charcoal-light rounded-full px-8 text-xs font-semibold tracking-wider uppercase">Continue Shopping</Button></Link>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="bg-charcoal py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">Checkout</h1>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <p className="text-muted-foreground mb-4">Please sign in to complete your purchase.</p>
          <Link href="/auth/signin?callbackUrl=/shop/checkout"><Button className="bg-charcoal text-white hover:bg-charcoal-light rounded-full px-8 text-xs font-semibold tracking-wider uppercase">Sign In</Button></Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim()) { setError("Please enter a shipping address"); return; }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            variantId: item.variantId,
          })),
          shippingAddress: shippingAddress.trim(),
          notes: notes.trim() || undefined,
          paymentMethod,
          couponCode: coupon?.code || undefined,
          pointsRedeemed: effectiveRedeemed,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");

      if (paymentMethod === "pay_on_delivery") {
        clearCart();
        router.push(`/shop/order/success?orderId=${data.order.id}`);
        return;
      }

      const payRes = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: data.payment.id, orderId: data.order.id }),
      });

      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.error || "Failed to initiate payment");

      // Cart is NOT cleared here — it's cleared on payment success callback
      // This ensures the cart survives if the user closes the browser

      if (payData.checkoutUrl) {
        window.location.href = payData.checkoutUrl;
      } else {
        router.push(`/shop/order/success?orderId=${data.order.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-charcoal py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link href="/shop/cart" className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />Back to cart
          </Link>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">Checkout</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="h-5 w-5 text-gold" />
                <h2 className="font-heading font-semibold text-charcoal">Shipping Address</h2>
              </div>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter your full delivery address (street, city, state, phone number)"
                rows={3}
                className="w-full bg-cream border border-border rounded-lg px-4 py-3 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold resize-none"
              />
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-gold" />
                <h2 className="font-heading font-semibold text-charcoal">Payment Method</h2>
              </div>
              <div className="space-y-3">
                {([
                  { value: "card" as const, label: "Pay with Card", desc: "Debit or credit card via Paystack", icon: "💳" },
                  { value: "bank_transfer" as const, label: "Bank Transfer", desc: "Pay via bank transfer via Paystack", icon: "🏦" },
                  { value: "pay_on_delivery" as const, label: "Pay on Delivery", desc: "Pay when your order arrives", icon: " cash" },
                ]).map((option) => (
                  <button key={option.value} onClick={() => setPaymentMethod(option.value)} className={cn("w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left", paymentMethod === option.value ? "border-gold bg-gold/5" : "border-border hover:border-gold/30")}>
                    <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0", paymentMethod === option.value ? "border-gold" : "border-border")}>
                      {paymentMethod === option.value && <div className="h-2.5 w-2.5 rounded-full bg-gold" />}
                    </div>
                    <span className="text-xl">{option.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-charcoal">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white border border-border rounded-xl p-6">
              <h2 className="font-heading font-semibold text-charcoal mb-4">Order Notes (Optional)</h2>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special instructions for your order..." rows={2} className="w-full bg-cream border border-border rounded-lg px-4 py-3 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold resize-none" />
            </div>
          </div>

          {/* Right - Order Summary */}
          <div>
            <div className="bg-white border border-border rounded-xl p-6 sticky top-24">
              <h2 className="font-heading font-semibold text-charcoal mb-4">Order Summary</h2>
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-cream rounded-lg shrink-0 overflow-hidden flex items-center justify-center">
                      {item.image ? <Image src={item.image} alt={item.name} width={48} height={48} className="h-full w-full object-cover" /> : <span className="text-[10px] text-muted-foreground">IMG</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-charcoal truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-semibold text-charcoal shrink-0">₦{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="text-charcoal">₦{total.toLocaleString()}</span></div>
                {discount > 0 && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Discount ({coupon?.code})</span><span className="text-green-600 font-medium">-₦{discount.toLocaleString()}</span></div>
                )}
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-charcoal">{shipping === 0 ? <span className="text-gold">Free</span> : `₦${shipping.toLocaleString()}`}</span></div>

                {/* Loyalty Points Redemption */}
                {!loyaltyLoading && loyaltyBalance > 0 && (
                  <div className="bg-gold/5 border border-gold/20 rounded-lg p-3 mt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-gold" />
                      <span className="text-xs font-semibold text-charcoal">Loyalty Points</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">{loyaltyBalance.toLocaleString()} available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        max={Math.min(loyaltyBalance, maxRedeemable)}
                        value={pointsInput}
                        onChange={(e) => handlePointsChange(e.target.value)}
                        placeholder="0"
                        className="h-8 text-xs bg-white border-border rounded-full flex-1"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 text-[10px] rounded-full border-gold text-gold hover:bg-gold/10"
                        onClick={applyMaxPoints}
                      >
                        Max
                      </Button>
                    </div>
                    {effectiveRedeemed > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-green-600">
                        <Check className="h-3 w-3" />
                        Redeeming {effectiveRedeemed.toLocaleString()} pts (-₦{effectiveRedeemed.toLocaleString()})
                      </div>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">Max 50% of subtotal. 1 pt = ₦1 off.</p>
                  </div>
                )}

                {effectiveRedeemed > 0 && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Points Discount</span><span className="text-green-600 font-medium">-₦{effectiveRedeemed.toLocaleString()}</span></div>
                )}
                <div className="border-t border-border pt-2 flex justify-between"><span className="font-semibold text-charcoal">Total</span><span className="font-heading text-lg font-bold text-charcoal">₦{grandTotal.toLocaleString()}</span></div>
              </div>

              <div className="flex items-center gap-2 mt-4 text-[10px] text-muted-foreground">
                <Shield className="h-3 w-3" />Secure payment powered by Paystack
              </div>

              {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

              <Button onClick={handlePlaceOrder} disabled={isSubmitting} className="w-full mt-4 bg-gold text-white hover:bg-gold-dark rounded-full py-6 text-xs font-semibold tracking-wider uppercase disabled:opacity-50">
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : `Pay ₦${grandTotal.toLocaleString()}`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
