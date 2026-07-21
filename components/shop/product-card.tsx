"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore, useWishlistStore } from "@/store";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number;
    image?: string;
    rating?: number;
    reviewCount?: number;
    stock: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, items: wishlistItems } = useWishlistStore();
  const isWishlisted = wishlistItems.includes(product.id);
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <div className="group relative">
      {/* Image */}
      <div className="relative aspect-[3/4] bg-cream rounded-xl overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="bg-gold text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              -{discount}%
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="bg-charcoal/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Low Stock
            </span>
          )}
        </div>

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <Button
            size="sm"
            className="flex-1 bg-white text-charcoal hover:bg-gold hover:text-white rounded-full text-xs font-semibold h-9"
            onClick={() =>
              addItem({
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1,
                maxStock: product.stock,
              })
            }
            disabled={product.stock === 0}
          >
            <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
            Add to Bag
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-full bg-white/90"
            asChild
          >
            <Link href={`/shop/${product.slug}`}>
              <Eye className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {/* Wishlist */}
        <button
          onClick={() => toggleItem(product.id)}
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isWishlisted ? "fill-gold text-gold" : "text-charcoal"
            )}
          />
        </button>
      </div>

      {/* Info */}
      <div className="mt-3 space-y-1">
        <Link href={`/shop/${product.slug}`}>
          <h3 className="text-sm font-medium text-charcoal hover:text-gold transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-charcoal">
            ₦{product.price.toLocaleString()}
          </span>
          {product.comparePrice && (
            <span className="text-xs text-muted-foreground line-through">
              ₦{product.comparePrice.toLocaleString()}
            </span>
          )}
        </div>
        {product.rating && (
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3 w-3",
                  i < Math.floor(product.rating!)
                    ? "fill-gold text-gold"
                    : "text-gray-200"
                )}
              />
            ))}
            <span className="text-[11px] text-muted-foreground ml-1">
              ({product.reviewCount || 0})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
