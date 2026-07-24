"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore, useWishlistStore } from "@/store";
import { useWishlist, useToggleWishlist } from "@/hooks/queries";
import { cn } from "@/lib/utils";

function WishlistSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 border border-border rounded-lg">
          <div className="h-16 w-16 bg-cream rounded-lg shrink-0 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-40 bg-cream rounded animate-pulse" />
            <div className="h-3 w-20 bg-cream rounded animate-pulse" />
          </div>
          <div className="h-9 w-20 bg-cream rounded-full animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default function WishlistPage() {
  const { data, isLoading } = useWishlist();
  const toggleWishlistMutation = useToggleWishlist();
  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem } = useWishlistStore();
  const items = data?.wishlist ?? [];

  const handleRemove = (productId: string) => {
    toggleItem(productId);
    toggleWishlistMutation.mutate(productId);
  };

  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <h2 className="font-heading font-semibold text-charcoal mb-4">My Wishlist</h2>
      {isLoading ? (
        <WishlistSkeleton />
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Your wishlist is empty</p>
          <Button asChild className="mt-4 bg-charcoal text-white rounded-full min-h-[44px] px-6">
            <Link href="/shop">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const avgRating = item.product.reviews.length > 0
              ? item.product.reviews.reduce((sum, r) => sum + r.rating, 0) / item.product.reviews.length
              : 0;
            const discount = item.product.comparePrice
              ? Math.round(((item.product.comparePrice - item.product.price) / item.product.comparePrice) * 100)
              : 0;

            return (
              <div key={item.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                <Link href={`/shop/${item.product.slug}`} className="h-16 w-16 bg-cream rounded-lg shrink-0 relative overflow-hidden">
                  {item.product.image ? (
                    <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="64px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Image</div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/shop/${item.product.slug}`}>
                    <h3 className="text-sm font-medium text-charcoal hover:text-gold transition-colors line-clamp-1">{item.product.name}</h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-semibold text-charcoal">₦{item.product.price.toLocaleString()}</span>
                    {item.product.comparePrice && (
                      <span className="text-xs text-muted-foreground line-through">₦{item.product.comparePrice.toLocaleString()}</span>
                    )}
                    {discount > 0 && <span className="text-[10px] bg-gold/10 text-gold font-bold px-1.5 py-0.5 rounded-full">-{discount}%</span>}
                  </div>
                  {avgRating > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn("h-3 w-3", i < Math.floor(avgRating) ? "fill-gold text-gold" : "text-gray-200")} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    className="bg-charcoal text-white hover:bg-gold hover:text-white rounded-full min-h-[44px] px-4 text-xs"
                    onClick={() =>
                      addItem({
                        productId: item.product.id,
                        name: item.product.name,
                        price: item.product.price,
                        image: item.product.image ?? undefined,
                        quantity: 1,
                        maxStock: item.product.stock,
                      })
                    }
                    disabled={item.product.stock === 0}
                  >
                    <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                    {item.product.stock === 0 ? "Out of Stock" : "Add to Bag"}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 text-muted-foreground hover:text-red-500"
                    onClick={() => handleRemove(item.product.id)}
                  >
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
