"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Grid3X3, LayoutGrid, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/shop/product-card";
import { cn } from "@/lib/utils";
import { useProducts, useShopCategories } from "@/hooks/queries";

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>}>
      <ShopPageContent />
    </Suspense>
  );
}

function ShopPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(() => searchParams.get("category") || "all");
  const [sortBy, setSortBy] = useState("newest");
  const [gridSize, setGridSize] = useState<3 | 4>(3);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: prodData, isLoading: prodLoading } = useProducts({
    isActive: "true",
    limit: 100,
    category: activeCategory !== "all" ? activeCategory : undefined,
    search: debouncedSearch || undefined,
  });
  const { data: catData, isLoading: catLoading } = useShopCategories();

  const products = prodData?.products ?? [];
  const categories = catData?.categories ?? [];
  const loading = prodLoading || catLoading;

  const updateCategory = useCallback((slug: string) => {
    setActiveCategory(slug);
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    const qs = params.toString();
    router.replace(`/shop${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [searchParams, router]);

  const sorted = [...products].sort((a, b) => {
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
            <Input
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 bg-cream border-border rounded-full"
            />
            {debouncedSearch && (
              <button
                onClick={() => { setSearchInput(""); setDebouncedSearch(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-charcoal"
              >
                Clear
              </button>
            )}
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
        {/* Category Image Grid */}
        <div className="mb-8">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {/* All button */}
            <button
              onClick={() => updateCategory("all")}
              className={cn(
                "shrink-0 w-[120px] h-[140px] rounded-xl border-2 overflow-hidden transition-all flex flex-col items-center justify-center gap-2",
                activeCategory === "all"
                  ? "border-gold bg-gold/5 shadow-md"
                  : "border-border bg-white hover:border-gold/50"
              )}
            >
              <div className="w-14 h-14 rounded-full bg-cream flex items-center justify-center">
                <Search className="h-6 w-6 text-gold" />
              </div>
              <span className="text-xs font-semibold text-charcoal">All</span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => updateCategory(cat.slug)}
                className={cn(
                  "shrink-0 w-[120px] h-[140px] rounded-xl border-2 overflow-hidden transition-all group",
                  activeCategory === cat.slug
                    ? "border-gold shadow-md"
                    : "border-border hover:border-gold/50"
                )}
              >
                {cat.image ? (
                  <div className="relative w-full h-[100px] overflow-hidden">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-full h-[100px] bg-cream flex items-center justify-center">
                    <span className="text-2xl font-heading text-gold font-bold">{cat.name.charAt(0)}</span>
                  </div>
                )}
                <div className="h-[40px] flex flex-col items-center justify-center bg-white">
                  <span className="text-[11px] font-semibold text-charcoal leading-tight text-center px-1 line-clamp-1">{cat.name}</span>
                  {cat._count?.products ? (
                    <span className="text-[9px] text-muted-foreground">{cat._count.products} items</span>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="h-8 w-8 text-gold animate-spin mx-auto" /><p className="text-muted-foreground mt-4 text-sm">Loading products...</p></div>
        ) : (
          <>
            <div className={cn("grid gap-4 md:gap-6", gridSize === 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 lg:grid-cols-3")}>
              {sorted.map((product) => (
                <ProductCard key={product.id} product={{
                  id: product.id, name: product.name, slug: product.slug,
                  price: product.price, comparePrice: product.comparePrice ?? undefined,
                  image: product.images?.[0] ?? undefined, rating: product.rating ?? 0,
                  reviewCount: product.reviewCount, stock: product.stock,
                }} />
              ))}
            </div>
            {sorted.length === 0 && (
              <div className="text-center py-20">
                <p className="text-muted-foreground">{debouncedSearch ? `No products found for "${debouncedSearch}"` : "No products found."}</p>
                <Button onClick={() => { setActiveCategory("all"); setSearchInput(""); setDebouncedSearch(""); }} variant="ghost" className="mt-4 text-gold">Clear Filters</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
