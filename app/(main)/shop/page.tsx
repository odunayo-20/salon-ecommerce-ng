"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Grid3X3, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/shop/product-card";
import { cn } from "@/lib/utils";

const shopCategories = [
  { name: "All", slug: "all" },
  { name: "Hair Extensions", slug: "hair-extensions" },
  { name: "Wigs", slug: "wigs" },
  { name: "Closures & Frontals", slug: "closures-frontals" },
  { name: "Hair Care", slug: "hair-care" },
  { name: "Beauty", slug: "beauty" },
];

const allProducts = [
  { id: "p1", name: "Premium Brazilian Hair Bundle", slug: "premium-brazilian-hair", price: 45000, comparePrice: 55000, image: "", rating: 4.9, reviewCount: 128, stock: 25, category: "hair-extensions" },
  { id: "p2", name: "Raw Cambodian Hair Bundle", slug: "raw-cambodian-bundle", price: 65000, image: "", rating: 4.8, reviewCount: 89, stock: 15, category: "hair-extensions" },
  { id: "p3", name: "Full Lace Wig - Body Wave", slug: "full-lace-wig-body-wave", price: 85000, comparePrice: 95000, image: "", rating: 5, reviewCount: 234, stock: 10, category: "wigs" },
  { id: "p4", name: "Lace Front Wig - Straight", slug: "lace-front-wig-straight", price: 55000, image: "", rating: 4.7, reviewCount: 167, stock: 20, category: "wigs" },
  { id: "p5", name: "5x5 HD Closure", slug: "5x5-hd-closure", price: 25000, image: "", rating: 4.8, reviewCount: 95, stock: 30, category: "closures-frontals" },
  { id: "p6", name: "13x4 HD Frontal", slug: "13x4-hd-frontal", price: 35000, image: "", rating: 4.6, reviewCount: 78, stock: 18, category: "closures-frontals" },
  { id: "p7", name: "Growth Oil Serum", slug: "growth-oil-serum", price: 4500, image: "", rating: 4.7, reviewCount: 312, stock: 100, category: "hair-care" },
  { id: "p8", name: "Deep Conditioning Treatment", slug: "deep-conditioning", price: 3500, comparePrice: 4500, image: "", rating: 4.9, reviewCount: 200, stock: 80, category: "hair-care" },
  { id: "p9", name: "Silk Press Treatment Kit", slug: "silk-press-kit", price: 8500, image: "", rating: 4.8, reviewCount: 156, stock: 40, category: "hair-care" },
  { id: "p10", name: "Nail Polish Collection Set", slug: "nail-polish-set", price: 6000, image: "", rating: 4.5, reviewCount: 89, stock: 50, category: "beauty" },
  { id: "p11", name: "Edge Control Gel", slug: "edge-control", price: 2500, image: "", rating: 4.6, reviewCount: 234, stock: 120, category: "hair-care" },
  { id: "p12", name: "Kanekalon Braiding Hair", slug: "kanekalon-braiding", price: 3500, image: "", rating: 4.4, reviewCount: 178, stock: 200, category: "hair-extensions" },
];

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [gridSize, setGridSize] = useState<3 | 4>(3);

  const filtered = allProducts.filter((p) => {
    if (activeCategory !== "all" && p.category !== activeCategory) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen">
      <div className="bg-charcoal py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">Hair Collection</h1>
          <p className="text-white/60 mt-2">Premium hair extensions, wigs, and care products</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-cream border-border rounded-full" />
          </div>
          <div className="flex gap-2">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 bg-cream border border-border rounded-full text-sm text-charcoal focus:outline-none focus:border-gold">
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <div className="hidden md:flex border border-border rounded-full overflow-hidden">
              <button onClick={() => setGridSize(3)} className={cn("px-3 py-2 transition-colors", gridSize === 3 ? "bg-charcoal text-white" : "bg-cream text-muted-foreground")}>
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button onClick={() => setGridSize(4)} className={cn("px-3 py-2 transition-colors", gridSize === 4 ? "bg-charcoal text-white" : "bg-cream text-muted-foreground")}>
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
          {shopCategories.map((cat) => (
            <button key={cat.slug} onClick={() => setActiveCategory(cat.slug)} className={cn("px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap border shrink-0 transition-all", activeCategory === cat.slug ? "bg-charcoal text-white border-charcoal" : "bg-white text-charcoal border-border hover:border-charcoal")}>
              {cat.name}
            </button>
          ))}
        </div>
        <div className={cn("grid gap-4 md:gap-6", gridSize === 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 lg:grid-cols-3")}>
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No products found.</p>
            <Button onClick={() => { setActiveCategory("all"); setSearchQuery(""); }} variant="ghost" className="mt-4 text-gold">Clear Filters</Button>
          </div>
        )}
      </div>
    </div>
  );
}
