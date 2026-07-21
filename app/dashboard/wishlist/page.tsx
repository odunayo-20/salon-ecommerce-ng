"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const wishlistItems = [
  { id: "w1", name: "Premium Brazilian Hair Bundle", price: 45000, image: "" },
  { id: "w2", name: "Growth Oil Serum", price: 4500, image: "" },
  { id: "w3", name: "Full Lace Wig - Body Wave", price: 85000, image: "" },
];

export default function WishlistPage() {
  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <h2 className="font-heading font-semibold text-charcoal mb-4">My Wishlist</h2>
      {wishlistItems.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Your wishlist is empty</p>
          <Button asChild size="sm" className="mt-4 bg-charcoal text-white rounded-full text-xs"><Link href="/shop">Browse Products</Link></Button>
        </div>
      ) : (
        <div className="space-y-3">
          {wishlistItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
              <div className="h-16 w-16 bg-cream rounded-lg shrink-0 flex items-center justify-center text-xs text-muted-foreground">Image</div>
              <div className="flex-1"><h3 className="text-sm font-medium text-charcoal">{item.name}</h3><p className="text-sm text-muted-foreground mt-0.5">₦{item.price.toLocaleString()}</p></div>
              <Button size="sm" className="bg-charcoal text-white rounded-full text-xs">Add to Bag</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
