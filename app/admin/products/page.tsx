"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, X, Loader2, Package, Star, Search, Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category { id: string; name: string; slug: string; }

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDesc: string | null;
  price: number;
  comparePrice: number | null;
  sku: string | null;
  image: string | null;
  images: string[];
  categoryId: string;
  stock: number;
  lowStock: number;
  isActive: boolean;
  isFeatured: boolean;
  hairTexture: string | null;
  hairLength: string | null;
  hairColor: string | null;
  category: Category;
  reviewCount: number;
  orderCount: number;
  wishlistCount: number;
  variantCount: number;
}

const emptyForm = {
  name: "", slug: "", description: "", shortDesc: "",
  price: 0, comparePrice: 0, sku: "", barcode: "",
  categoryId: "", stock: 0, lowStock: 5,
  isActive: true, isFeatured: false,
  hairTexture: "", hairLength: "", hairColor: "",
  tags: "", image: "", images: "[]",
};

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterCategory !== "all") params.set("categoryId", filterCategory);
      if (filterStatus === "active") params.set("isActive", "true");
      if (filterStatus === "inactive") params.set("isActive", "false");
      if (search) params.set("search", search);
      params.set("limit", "100");
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      setErrorMsg("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterStatus, search]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories?type=product");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { if (successMsg) { const t = setTimeout(() => setSuccessMsg(""), 3000); return () => clearTimeout(t); } }, [successMsg]);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); setErrorMsg(""); };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, slug: p.slug, description: p.description || "", shortDesc: p.shortDesc || "",
      price: p.price, comparePrice: p.comparePrice || 0, sku: p.sku || "", barcode: "",
      categoryId: p.categoryId, stock: p.stock, lowStock: p.lowStock,
      isActive: p.isActive, isFeatured: p.isFeatured,
      hairTexture: p.hairTexture || "", hairLength: p.hairLength || "", hairColor: p.hairColor || "",
      tags: "", image: p.image || "", images: typeof p.images === "string" ? p.images : JSON.stringify(p.images || []),
    });
    setShowModal(true);
    setErrorMsg("");
  };

  const handleSave = async () => {
    if (!form.name.trim()) return setErrorMsg("Name is required");
    if (!form.slug.trim()) { setForm((prev) => ({ ...prev, slug: slugify(prev.name) })); return; }
    if (!form.categoryId) return setErrorMsg("Category is required");
    if (form.price <= 0) return setErrorMsg("Price must be greater than 0");

    setSaving(true);
    setErrorMsg("");
    try {
      const payload = {
        ...form,
        comparePrice: form.comparePrice > 0 ? form.comparePrice : null,
        sku: form.sku || null,
        barcode: form.barcode || null,
        hairTexture: form.hairTexture || null,
        hairLength: form.hairLength || null,
        hairColor: form.hairColor || null,
        image: form.image || null,
        images: JSON.parse(form.images || "[]"),
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      };

      if (editing) {
        const res = await fetch(`/api/products/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setSuccessMsg("Product updated successfully");
      } else {
        const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setSuccessMsg("Product created successfully");
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    } finally { setSaving(false); }
  };

  const handleDelete = async (p: Product) => {
    if (p.orderCount > 0) { setErrorMsg(`Cannot delete "${p.name}" — it has ${p.orderCount} order history entries. Deactivate instead.`); return; }
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/products/${p.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccessMsg("Product deleted");
      fetchProducts();
    } catch (err) { setErrorMsg(err instanceof Error ? err.message : "Failed to delete"); }
  };

  const toggleActive = async (p: Product) => {
    try {
      await fetch(`/api/products/${p.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !p.isActive }) });
      fetchProducts();
    } catch { setErrorMsg("Failed to toggle"); }
  };

  const toggleFeatured = async (p: Product) => {
    try {
      await fetch(`/api/products/${p.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isFeatured: !p.isFeatured }) });
      fetchProducts();
    } catch { setErrorMsg("Failed to toggle"); }
  };

  const isLowStock = (p: Product) => p.stock <= p.lowStock;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-charcoal tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your shop inventory</p>
        </div>
        <Button onClick={openAdd} className="bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold tracking-wider uppercase px-6">
          <Plus className="h-4 w-4 mr-2" />Add Product
        </Button>
      </div>

      {successMsg && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between"><span>{successMsg}</span><button onClick={() => setSuccessMsg("")}><X className="h-4 w-4" /></button></div>}
      {errorMsg && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between"><span>{errorMsg}</span><button onClick={() => setErrorMsg("")}><X className="h-4 w-4" /></button></div>}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, description, or SKU..." className="w-full bg-white border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" />
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-white border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold">
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="flex gap-1 bg-white border border-border rounded-lg p-1">
          {(["all", "active", "inactive"] as const).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize", filterStatus === s ? "bg-charcoal text-white" : "text-muted-foreground hover:text-charcoal")}>{s}</button>
          ))}
        </div>
        <div className="flex gap-1 bg-white border border-border rounded-lg p-1">
          <button onClick={() => setViewMode("table")} className={cn("p-1.5 rounded-md transition-all", viewMode === "table" ? "bg-charcoal text-white" : "text-muted-foreground")}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <button onClick={() => setViewMode("grid")} className={cn("p-1.5 rounded-md transition-all", viewMode === "grid" ? "bg-charcoal text-white" : "text-muted-foreground")}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <Loader2 className="h-6 w-6 text-gold animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-3">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <Package className="h-10 w-10 text-border mx-auto mb-3" />
          <p className="text-muted-foreground">No products found</p>
          <Button onClick={openAdd} variant="outline" className="mt-4 rounded-full text-xs font-semibold tracking-wider uppercase"><Plus className="h-4 w-4 mr-2" />Add your first product</Button>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-cream/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Stock</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Orders</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-cream/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-cream flex items-center justify-center shrink-0 overflow-hidden">
                          {p.image ? <img src={p.image} alt={p.name} className="h-full w-full object-cover" /> : <Package className="h-4 w-4 text-gold" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-charcoal truncate">{p.name}</p>
                            {p.isFeatured && <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded-full font-bold">Featured</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="text-[10px] text-muted-foreground">/{p.slug}</code>
                            {p.sku && <code className="text-[10px] text-muted-foreground">SKU: {p.sku}</code>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-[10px] bg-cream px-2.5 py-1 rounded-full text-muted-foreground font-medium">{p.category.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="text-sm font-semibold text-charcoal">₦{p.price.toLocaleString()}</span>
                        {p.comparePrice && p.comparePrice > p.price && <p className="text-[10px] text-red-400 line-through">₦{p.comparePrice.toLocaleString()}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-medium", isLowStock(p) ? "text-red-500" : "text-charcoal")}>{p.stock}</span>
                        {isLowStock(p) && p.stock > 0 && <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium">Low</span>}
                        {p.stock === 0 && <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-medium">Out</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">{p.orderCount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleActive(p)} className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0", p.isActive ? "bg-gold" : "bg-border")}>
                          <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform", p.isActive ? "translate-x-[18px]" : "translate-x-[3px]")} />
                        </button>
                        <button onClick={() => toggleFeatured(p)} className={cn("p-1 rounded transition-colors shrink-0", p.isFeatured ? "text-gold" : "text-border hover:text-gold/50")} title={p.isFeatured ? "Unfeature" : "Feature"}>
                          <Star className={cn("h-4 w-4", p.isFeatured && "fill-gold")} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(p)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-border bg-cream/30">
            <p className="text-xs text-muted-foreground">{products.length} products</p>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white border border-border rounded-xl overflow-hidden group hover:shadow-md transition-all">
              <div className="aspect-[4/3] bg-cream flex items-center justify-center relative">
                {p.image ? <img src={p.image} alt={p.name} className="h-full w-full object-cover" /> : <Package className="h-8 w-8 text-border" />}
                <div className="absolute top-2 right-2 flex gap-1">
                  {p.isFeatured && <span className="text-[10px] bg-gold text-white px-2 py-0.5 rounded-full font-bold">Featured</span>}
                  {isLowStock(p) && <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">{p.stock === 0 ? "Out of Stock" : "Low Stock"}</span>}
                </div>
              </div>
              <div className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{p.category.name}</p>
                <p className="text-sm font-medium text-charcoal mt-1 truncate">{p.name}</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-sm font-bold text-charcoal">₦{p.price.toLocaleString()}</span>
                  {p.comparePrice && p.comparePrice > p.price && <span className="text-xs text-red-400 line-through">₦{p.comparePrice.toLocaleString()}</span>}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={cn("text-xs", isLowStock(p) ? "text-red-500 font-medium" : "text-muted-foreground")}>{p.stock} in stock</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{p.orderCount} orders</span>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
                  <button onClick={() => toggleActive(p)} className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors", p.isActive ? "bg-gold" : "bg-border")}>
                    <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform", p.isActive ? "translate-x-[18px]" : "translate-x-[3px]")} />
                  </button>
                  <div className="flex-1" />
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDelete(p)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white z-10">
              <h2 className="font-heading text-lg font-semibold text-charcoal">{editing ? "Edit Product" : "Add Product"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-muted-foreground hover:text-charcoal hover:bg-cream"><X className="h-5 w-5" /></button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Row 1: Name + Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Name *</label>
                  <input type="text" value={form.name} onChange={(e) => { const n = e.target.value; setForm((p) => ({ ...p, name: n, slug: editing ? p.slug : slugify(n) })); }} placeholder="e.g. Raw Brazilian Bundles" className="mt-1.5 w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Slug</label>
                  <div className="flex items-center mt-1.5"><span className="text-sm text-muted-foreground mr-1">/</span>
                    <input type="text" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: slugify(e.target.value) }))} placeholder="auto-generated" className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" />
                  </div>
                </div>
              </div>

              {/* Row 2: Category + SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Category *</label>
                  <select value={form.categoryId} onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))} className="mt-1.5 w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold">
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">SKU</label>
                  <input type="text" value={form.sku} onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))} placeholder="Optional" className="mt-1.5 w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Product Image</label>
                <div className="mt-1.5">
                  {form.image ? (
                    <div className="relative inline-block">
                      <img src={form.image} alt="Product" className="h-32 w-32 object-cover rounded-lg border border-border" />
                      <button
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, image: "" }))}
                        className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-gold transition-colors">
                      <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground">Click to upload main image</span>
                      <span className="text-[10px] text-muted-foreground">JPEG, PNG, WebP (max 5MB)</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const fd = new FormData();
                          fd.append("file", file);
                          fd.append("folder", "salon/products");
                          try {
                            const res = await fetch("/api/upload", { method: "POST", body: fd });
                            const data = await res.json();
                            if (res.ok) setForm((p) => ({ ...p, image: data.url }));
                          } catch { /* silent */ }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Additional Images */}
              <div>
                <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Additional Images</label>
                <div className="mt-1.5">
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      let parsed: string[] = [];
                      try { parsed = JSON.parse(form.images || "[]"); } catch { parsed = []; }
                      return parsed.map((img: string, idx: number) => (
                        <div key={idx} className="relative inline-block">
                          <img src={img} alt="" className="h-20 w-20 object-cover rounded-lg border border-border" />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = parsed.filter((_: string, i: number) => i !== idx);
                              setForm((p) => ({ ...p, images: JSON.stringify(updated) }));
                            }}
                            className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      ));
                    })()}
                    <label className="flex items-center justify-center h-20 w-20 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-gold transition-colors">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const fd = new FormData();
                          fd.append("file", file);
                          fd.append("folder", "salon/products");
                          try {
                            const res = await fetch("/api/upload", { method: "POST", body: fd });
                            const data = await res.json();
                            if (res.ok) {
                              let parsed: string[] = [];
                              try { parsed = JSON.parse(form.images || "[]"); } catch { parsed = []; }
                              parsed.push(data.url);
                              setForm((p) => ({ ...p, images: JSON.stringify(parsed) }));
                            }
                          } catch { /* silent */ }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Row 3: Price + Compare Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Price (₦) *</label>
                  <input type="number" value={form.price || ""} onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))} min={0} className="mt-1.5 w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Compare Price (₦)</label>
                  <input type="number" value={form.comparePrice || ""} onChange={(e) => setForm((p) => ({ ...p, comparePrice: Number(e.target.value) }))} min={0} placeholder="Optional" className="mt-1.5 w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" />
                </div>
              </div>

              {/* Row 4: Stock + Low Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Stock Quantity</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: Number(e.target.value) }))} min={0} className="mt-1.5 w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Low Stock Threshold</label>
                  <input type="number" value={form.lowStock} onChange={(e) => setForm((p) => ({ ...p, lowStock: Number(e.target.value) }))} min={0} className="mt-1.5 w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Full product description..." rows={4} className="mt-1.5 w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold resize-none" />
              </div>

              {/* Short Description */}
              <div>
                <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Short Description</label>
                <input type="text" value={form.shortDesc} onChange={(e) => setForm((p) => ({ ...p, shortDesc: e.target.value }))} placeholder="Brief one-liner..." className="mt-1.5 w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" />
              </div>

              {/* Hair Attributes */}
              <div>
                <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Hair Attributes (optional)</label>
                <div className="grid grid-cols-3 gap-3 mt-1.5">
                  <input type="text" value={form.hairTexture} onChange={(e) => setForm((p) => ({ ...p, hairTexture: e.target.value }))} placeholder="Texture" className="bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" />
                  <input type="text" value={form.hairLength} onChange={(e) => setForm((p) => ({ ...p, hairLength: e.target.value }))} placeholder="Length" className="bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" />
                  <input type="text" value={form.hairColor} onChange={(e) => setForm((p) => ({ ...p, hairColor: e.target.value }))} placeholder="Color" className="bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Tags (comma separated)</label>
                <input type="text" value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} placeholder="e.g. bestseller, new, premium" className="mt-1.5 w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" />
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-charcoal">Active</span>
                  <button type="button" onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))} className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors", form.isActive ? "bg-gold" : "bg-border")}>
                    <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform", form.isActive ? "translate-x-[18px]" : "translate-x-[3px]")} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-charcoal">Featured</span>
                  <button type="button" onClick={() => setForm((p) => ({ ...p, isFeatured: !p.isFeatured }))} className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors", form.isFeatured ? "bg-gold" : "bg-border")}>
                    <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform", form.isFeatured ? "translate-x-[18px]" : "translate-x-[3px]")} />
                  </button>
                </div>
              </div>

              {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border sticky bottom-0 bg-white">
              <Button variant="outline" onClick={() => setShowModal(false)} className="rounded-full text-xs font-semibold tracking-wider uppercase">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold tracking-wider uppercase px-6">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
