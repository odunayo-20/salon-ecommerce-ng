"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Heart, Truck, Shield, RotateCcw, Star, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/product-card";
import { ReviewForm } from "@/components/reviews/review-form";
import { useCartStore, useWishlistStore } from "@/store";
import { useToggleWishlist } from "@/hooks/queries";
import { cn } from "@/lib/utils";

interface Product {
  id: string; name: string; slug: string; price: number; comparePrice?: number | null;
  description: string | null; images: string[]; tags: string[];
  stock: number; rating: number; reviewCount: number;
  category: { id: string; name: string; slug: string };
  reviews: { rating: number; comment: string | null; createdAt: string; user: { name: string | null } }[];
  variants: { id: string; name: string; price: number; stock: number }[];
}

interface RelatedProduct {
  id: string; name: string; slug: string; price: number; comparePrice?: number | null;
  image: string | null; reviewCount: number; stock: number;
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: session } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState<"details" | "reviews" | "shipping">("details");
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, items: wishlistItems } = useWishlistStore();
  const toggleWishlistMutation = useToggleWishlist();

  const handleWishlistToggle = () => {
    if (product) {
      toggleItem(product.id);
      if (session?.user) {
        toggleWishlistMutation.mutate(product.id);
      }
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/products?slug=${slug}`);
        if (!res.ok) { setNotFound(true); return; }
        const data = await res.json();
        setProduct(data.product);
        setRelated(data.related || []);
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    })();
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 text-gold animate-spin" /></div>;
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="font-heading text-2xl font-bold text-charcoal">Product not found</h1>
          <p className="text-muted-foreground">The product you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/shop" className="inline-block">
            <Button className="bg-charcoal text-white hover:bg-charcoal-light rounded-full px-8 text-xs font-semibold tracking-wider uppercase">Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isInWishlist = wishlistItems.includes(product.id);
  const discount = product.comparePrice ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;
  const displayImages = product.images.length > 0 ? product.images : [];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <nav className="text-sm text-muted-foreground mb-8">
          <Link href="/shop" className="hover:text-gold transition-colors">Shop</Link>
          <span className="mx-2">/</span>
          {product.category && <><Link href="/shop" className="hover:text-gold transition-colors">{product.category.name}</Link><span className="mx-2">/</span></>}
          <span className="text-charcoal">{product.name}</span>
        </nav>
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            {displayImages.length > 0 ? (
              <div className="aspect-square bg-cream rounded-2xl overflow-hidden relative">
                <Image src={displayImages[selectedImage]} alt={product.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
              </div>
            ) : (
              <div className="aspect-square bg-cream rounded-2xl flex items-center justify-center text-muted-foreground text-sm">No image</div>
            )}
            {displayImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {displayImages.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={cn("aspect-square bg-cream rounded-lg border-2 overflow-hidden relative transition-colors", selectedImage === i ? "border-gold" : "border-transparent hover:border-gold/50")}>
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="100px" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {discount > 0 && <span className="bg-gold/10 text-gold text-xs font-bold px-2.5 py-1 rounded-full">-{discount}%</span>}
                {product.stock <= 10 && product.stock > 0 && <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">Low Stock</span>}
                {product.stock === 0 && <span className="bg-red-50 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">Out of Stock</span>}
              </div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-charcoal tracking-tight">{product.name}</h1>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1">{[...Array(5)].map((_, i) => <Star key={i} className={cn("h-4 w-4", i < Math.floor(product.rating) ? "fill-gold text-gold" : "text-gray-200")} />)}</div>
                <span className="text-sm text-muted-foreground">{product.rating > 0 ? product.rating : "New"} ({product.reviewCount} reviews)</span>
              </div>
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-3xl font-heading font-bold text-charcoal">₦{product.price.toLocaleString()}</span>
                {product.comparePrice && <span className="text-lg text-muted-foreground line-through">₦{product.comparePrice.toLocaleString()}</span>}
              </div>
            </div>
            {product.description && <p className="text-muted-foreground leading-relaxed">{product.description}</p>}
            {product.variants.length > 0 && (
              <div className="bg-cream rounded-lg p-4">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Options</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.variants.map((v) => (
                    <span key={v.id} className="text-sm text-charcoal bg-white border border-border rounded-full px-3 py-1">{v.name} — ₦{v.price.toLocaleString()}</span>
                  ))}
                </div>
              </div>
            )}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => <span key={tag} className="text-[10px] bg-cream px-3 py-1 rounded-full text-muted-foreground font-medium">{tag}</span>)}
              </div>
            )}
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-full">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-charcoal"><Minus className="h-4 w-4" /></button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-charcoal"><Plus className="h-4 w-4" /></button>
              </div>
              <Button onClick={() => addItem({ productId: product.id, name: product.name, price: product.price, image: product.images?.[0] ?? undefined, quantity, maxStock: product.stock })} disabled={product.stock === 0} className="flex-1 bg-charcoal text-white hover:bg-charcoal-light rounded-full py-6 text-xs font-semibold tracking-wider uppercase">
                {product.stock === 0 ? "Out of Stock" : `Add to Bag — ₦${(product.price * quantity).toLocaleString()}`}
              </Button>
              <Button onClick={handleWishlistToggle} variant="outline" size="icon" className="h-12 w-12 rounded-full border-border">
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
            {selectedTab === "details" && <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{product.description || "No additional details available."}</p>}
            {selectedTab === "reviews" && (
              <div className="space-y-6">
                <ReviewForm productId={product.id} itemName={product.name} />
                {product.reviews.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No reviews yet. Be the first to review this product!</p>
                ) : product.reviews.map((review, i) => (
                  <div key={i} className="border-b border-border pb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-0.5">{[...Array(5)].map((_, j) => <Star key={j} className={cn("h-3 w-3", j < review.rating ? "fill-gold text-gold" : "text-gray-200")} />)}</div>
                      <span className="text-sm font-medium text-charcoal">{review.user?.name || "Customer"}</span>
                    </div>
                    {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}
            {selectedTab === "shipping" && (
              <div className="max-w-2xl space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p><strong className="text-charcoal">Shipping:</strong> Free delivery on orders over ₦30,000 within Lagos.</p>
                <p><strong className="text-charcoal">Returns:</strong> 7-day return policy for unopened products.</p>
                <p><strong className="text-charcoal">International:</strong> We ship worldwide.</p>
              </div>
            )}
          </div>
        </div>
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-heading text-2xl font-bold text-charcoal mb-6">You May Also Like</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => <ProductCard key={p.id} product={{ ...p, comparePrice: p.comparePrice ?? undefined, image: p.image ?? undefined, rating: 0 }} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
