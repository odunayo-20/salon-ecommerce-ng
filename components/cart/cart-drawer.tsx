"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore, useUIStore } from "@/store";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function CartDrawer() {
  const { items, removeItem, updateQuantity, getTotal, coupon, getDiscount } = useCartStore();
  const { isCartOpen, setCartOpen } = useUIStore();
  const total = getTotal();
  const discount = getDiscount();
  const afterDiscount = Math.max(total - discount, 0);

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="w-full sm:max-w-sm p-0 flex flex-col">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-gold" />
            Shopping Bag ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground mb-4">Your bag is empty</p>
            <Button asChild size="sm" className="bg-charcoal text-white hover:bg-charcoal-light rounded-full px-6 text-xs" onClick={() => setCartOpen(false)}>
              <Link href="/shop">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="h-16 w-16 bg-cream rounded-lg shrink-0 overflow-hidden flex items-center justify-center">
                    {item.image ? <Image src={item.image} alt={item.name} width={64} height={64} className="h-full w-full object-cover" /> : <span className="text-[10px] text-muted-foreground">IMG</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium text-charcoal line-clamp-1">{item.name}</h4>
                      <button onClick={() => removeItem(item.productId, item.variantId)} className="text-muted-foreground hover:text-red-500 shrink-0">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">₦{item.price.toLocaleString()} each</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-border rounded-full">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)} className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-charcoal"><Minus className="h-3 w-3" /></button>
                        <span className="w-7 text-center text-xs font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)} className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-charcoal"><Plus className="h-3 w-3" /></button>
                      </div>
                      <span className="text-sm font-semibold text-charcoal">₦{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border px-6 py-4 space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="text-charcoal">₦{total.toLocaleString()}</span></div>
                {discount > 0 && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-green-600 font-medium">-₦{discount.toLocaleString()}</span></div>
                )}
                {afterDiscount < 30000 && <p className="text-[10px] text-gold">Add ₦{(30000 - afterDiscount).toLocaleString()} more for free shipping!</p>}
              </div>
              <Button asChild className="w-full bg-gold text-white hover:bg-gold-dark rounded-full py-5 text-xs font-semibold tracking-wider uppercase" onClick={() => setCartOpen(false)}>
                <Link href="/shop/checkout">Checkout — ₦{afterDiscount.toLocaleString()}</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full text-xs text-charcoal hover:text-gold" onClick={() => setCartOpen(false)}>
                <Link href="/shop/cart">View Full Cart</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
