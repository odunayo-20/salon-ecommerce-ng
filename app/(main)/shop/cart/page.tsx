"use client";

import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const total = getTotal();
  const shipping = total >= 30000 ? 0 : 2000;
  const grandTotal = total + shipping;

  return (
    <div className="min-h-screen">
      <div className="bg-charcoal py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">Shopping Bag</h1>
          <p className="text-white/60 mt-2">{items.length} item{items.length !== 1 ? "s" : ""} in your bag</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-2">Your bag is empty</h2>
            <p className="text-muted-foreground mb-8">Explore our collection and find something you love.</p>
            <Button asChild className="bg-charcoal text-white hover:bg-charcoal-light rounded-full px-8 text-xs font-semibold tracking-wider uppercase">
              <Link href="/shop">Continue Shopping<ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white border border-border rounded-xl p-5 flex gap-4">
                  <div className="h-24 w-24 bg-cream rounded-lg shrink-0 flex items-center justify-center text-xs text-muted-foreground">Image</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-charcoal text-sm">{item.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">₦{item.price.toLocaleString()} each</p>
                      </div>
                      <button onClick={() => removeItem(item.productId, item.variantId)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-border rounded-full">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)} className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-charcoal"><Minus className="h-3 w-3" /></button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)} className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-charcoal"><Plus className="h-3 w-3" /></button>
                      </div>
                      <span className="text-sm font-semibold text-charcoal">₦{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-4">
                <Button variant="ghost" onClick={clearCart} className="text-muted-foreground text-xs">Clear Bag</Button>
                <Button asChild variant="ghost" className="text-gold text-xs"><Link href="/shop">Continue Shopping<ArrowRight className="h-3.5 w-3.5 ml-1" /></Link></Button>
              </div>
            </div>
            <div>
              <div className="bg-cream rounded-xl p-6 sticky top-24">
                <h2 className="font-heading font-semibold text-charcoal mb-4">Order Summary</h2>
                <div className="flex gap-2 mb-6">
                  <input type="text" placeholder="Coupon code" className="flex-1 bg-white border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-gold" />
                  <Button variant="outline" size="sm" className="rounded-full border-border text-xs"><Tag className="h-3.5 w-3.5 mr-1" />Apply</Button>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="text-charcoal">₦{total.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-charcoal">{shipping === 0 ? <span className="text-gold">Free</span> : `₦${shipping.toLocaleString()}`}</span></div>
                  <div className="border-t border-border pt-3 flex justify-between"><span className="font-semibold text-charcoal">Total</span><span className="font-heading text-lg font-bold text-charcoal">₦{grandTotal.toLocaleString()}</span></div>
                </div>
                {total < 30000 && <p className="text-xs text-gold mt-3 text-center">Add ₦{(30000 - total).toLocaleString()} more for free shipping!</p>}
                <Button className="w-full mt-6 bg-gold text-white hover:bg-gold-dark rounded-full py-6 text-xs font-semibold tracking-wider uppercase">Proceed to Checkout</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
