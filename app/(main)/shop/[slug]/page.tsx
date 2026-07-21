"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, Heart, Truck, Shield, RotateCcw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/product-card";
import { useCartStore, useWishlistStore } from "@/store";
import { cn } from "@/lib/utils";

const relatedProducts = [
  { id: "r1", name: "Growth Oil Serum", slug: "growth-oil-serum", price: 4500, image: "", rating: 4.7, reviewCount: 312, stock: 100 },
  { id: "r2", name: "Deep Conditioning Treatment", slug: "deep-conditioning", price: 3500, image: "", rating: 4.9, reviewCount: 200, stock: 80 },
  { id: "r3", name: "Edge Control Gel", slug: "edge-control", price: 2500, image: "", rating: 4.6, reviewCount: 234, stock: 120 },
];

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState<"details" | "reviews" | "shipping">("details");
  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, items: wishlistItems } = useWishlistStore();

  const product = {
    id: "p1", name: "Premium Brazilian Hair Bundle", slug: "premium-brazilian-hair",
    price: 45000, comparePrice: 55000, image: "", rating: 4.9, reviewCount: 128, stock: 25,
    description: "Sourced directly from ethical donors, meticulously processed to maintain natural softness and luster. This versatile hair can be curled, straightened, and styled to your preference.",
    hairTexture: "Body Wave", hairLength: "12\" - 30\"", hairColor: "Natural Black",
    tags: ["Brazilian", "Human Hair", "Body Wave"], images: ["", "", "", ""],
  };

  const isInWishlist = wishlistItems.includes(product.id);
  const discount = product.comparePrice ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <nav className="text-sm text-muted-foreground mb-8">
          <Link href="/shop" className="hover:text-gold transition-colors">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-charcoal">{product.name}</span>
        </nav>
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-cream rounded-2xl overflow-hidden flex items-center justify-center text-muted-foreground text-sm">Product Image</div>
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((_, i) => (
                <button key={i} className="aspect-square bg-cream rounded-lg border-2 border-transparent hover:border-gold transition-colors flex items-center justify-center text-muted-foreground text-xs">{i + 1}</button>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {discount > 0 && <span className="bg-gold/10 text-gold text-xs font-bold px-2.5 py-1 rounded-full">-{discount}%</span>}
                {product.stock <= 10 && <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">Low Stock</span>}
              </div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-charcoal tracking-tight">{product.name}</h1>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1">{[...Array(5)].map((_, i) => <Star key={i} className={cn("h-4 w-4", i < Math.floor(product.rating) ? "fill-gold text-gold" : "text-gray-200")} />)}</div>
                <span className="text-sm text-muted-foreground">{product.rating} ({product.reviewCount} reviews)</span>
              </div>
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-3xl font-heading font-bold text-charcoal">₦{product.price.toLocaleString()}</span>
                {product.comparePrice && <span className="text-lg text-muted-foreground line-through">₦{product.comparePrice.toLocaleString()}</span>}
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            <div className="grid grid-cols-2 gap-4">
              {[["Texture", product.hairTexture], ["Length", product.hairLength], ["Color", product.hairColor], ["Stock", `${product.stock} available`]].map(([label, value]) => (
                <div key={label} className="bg-cream rounded-lg p-3">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
                  <p className="text-sm font-medium text-charcoal mt-1">{value}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-full">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-charcoal"><Minus className="h-4 w-4" /></button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-charcoal"><Plus className="h-4 w-4" /></button>
              </div>
              <Button onClick={() => addItem({ productId: product.id, name: product.name, price: product.price, image: product.image, quantity, maxStock: product.stock })} className="flex-1 bg-charcoal text-white hover:bg-charcoal-light rounded-full py-6 text-xs font-semibold tracking-wider uppercase">
                Add to Bag — ₦{(product.price * quantity).toLocaleString()}
              </Button>
              <Button onClick={() => toggleItem(product.id)} variant="outline" size="icon" className="h-12 w-12 rounded-full border-border">
                <Heart className={cn("h-5 w-5", isInWishlist ? "fill-gold text-gold" : "text-charcoal")} />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-border">
              {[{ icon: Truck, label: "Free Delivery", desc: "Orders over ₦30k" }, { icon: Shield, label: "Quality Guarantee", desc: "100% authentic" }, { icon: RotateCcw, label: "Easy Returns", desc: "7-day policy" }].map((item) => (
                <div key={item.label} className="text-center">
                  <item.icon className="h-5 w-5 text-gold mx-auto" />
                  <p className="text-xs font-medium text-charcoal mt-2">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-16">
          <div className="flex gap-1 border-b border-border">
            {(["details", "reviews", "shipping"] as const).map((tab) => (
              <button key={tab} onClick={() => setSelectedTab(tab)} className={cn("px-6 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px", selectedTab === tab ? "border-gold text-gold" : "border-transparent text-muted-foreground hover:text-charcoal")}>
                {tab === "details" ? "Product Details" : tab === "reviews" ? `Reviews (${product.reviewCount})` : "Shipping & Returns"}
              </button>
            ))}
          </div>
          <div className="py-8">
            {selectedTab === "details" && <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{product.description} Each bundle weighs approximately 100g and comes with a satisfaction guarantee.</p>}
            {selectedTab === "reviews" && <div className="space-y-6">{[1, 2, 3].map((i) => (<div key={i} className="border-b border-border pb-6"><div className="flex items-center gap-2 mb-2"><div className="flex gap-0.5">{[...Array(5)].map((_, j) => <Star key={j} className="h-3 w-3 fill-gold text-gold" />)}</div><span className="text-sm font-medium text-charcoal">Customer {i}</span></div><p className="text-sm text-muted-foreground">Absolutely love this hair! The quality is amazing and it came beautifully packaged.</p></div>))}</div>}
            {selectedTab === "shipping" && <div className="max-w-2xl space-y-4 text-sm text-muted-foreground leading-relaxed"><p><strong className="text-charcoal">Shipping:</strong> Free delivery on orders over ₦30,000 within Lagos.</p><p><strong className="text-charcoal">Returns:</strong> 7-day return policy for unopened products.</p><p><strong className="text-charcoal">International:</strong> We ship worldwide.</p></div>}
          </div>
        </div>
        <div className="mt-16">
          <h2 className="font-heading text-2xl font-bold text-charcoal mb-6">You May Also Like</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
