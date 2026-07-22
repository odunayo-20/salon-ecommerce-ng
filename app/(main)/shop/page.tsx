"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Grid3X3, LayoutGrid, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/shop/product-card";
import { cn } from "@/lib/utils";

interface ShopCategory { id: string; name: string; slug: string; }
interface ShopProduct {
  id: string; name: string; slug: string; price: number; comparePrice?: number | null;
  images: string[]; stock: number; category: { id: string; name: string; slug: string };
  reviewCount: number; rating?: number; isFeatured: boolean; isActive: boolean;
}

export default function ShopPage() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [gridSize, setGridSize] = useState<3 | 4>(3);

  const fetchData = useCallback(async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/products?isActive=true&limit=100"),
        fetch("/api/categories?type=product"),
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      setProducts(prodData.products || []);
      setCategories(catData.categories || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = products.filter((p) => {
    if (activeCategory !== "all" && p.category?.slug !== activeCategory) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    return 0;
  });

  const allCategories = [{ id: "", name: "All", slug: "all" }, ...categories];

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
          {allCategories.map((cat) => (
            <button key={cat.slug} onClick={() => setActiveCategory(cat.slug)} className={cn("px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap border shrink-0 transition-all", activeCategory === cat.slug ? "bg-charcoal text-white border-charcoal" : "bg-white text-charcoal border-border hover:border-charcoal")}>
              {cat.name}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="h-8 w-8 text-gold animate-spin mx-auto" /><p className="text-muted-foreground mt-4 text-sm">Loading products...</p></div>
        ) : (
          <>
            <div className={cn("grid gap-4 md:gap-6", gridSize === 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 lg:grid-cols-3")}>
              {filtered.map((product) => (
                <ProductCard key={product.id} product={{
                  id: product.id, name: product.name, slug: product.slug,
                  price: product.price, comparePrice: product.comparePrice ?? undefined,
                  image: product.images?.[0] ?? undefined, rating: product.rating ?? 0,
                  reviewCount: product.reviewCount, stock: product.stock,
                }} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No products found.</p>
                <Button onClick={() => { setActiveCategory("all"); setSearchQuery(""); }} variant="ghost" className="mt-4 text-gold">Clear Filters</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
