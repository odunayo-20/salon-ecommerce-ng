"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, X, Loader2, FolderTree, Package, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  type: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  _count?: { services: number; products: number };
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  type: "service",
  sortOrder: 0,
  isActive: true,
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`/api/categories?includeCount=true${filterType !== "all" ? `&type=${filterType}` : ""}`);
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      setErrorMsg("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(""), 3000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  const openAdd = () => {
    setEditingCategory(null);
    setFormData(emptyForm);
    setShowModal(true);
    setErrorMsg("");
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      type: cat.type,
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
    });
    setShowModal(true);
    setErrorMsg("");
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setErrorMsg("Category name is required");
      return;
    }
    if (!formData.slug.trim()) {
      setFormData((prev) => ({ ...prev, slug: slugify(prev.name) }));
      return;
    }

    setSaving(true);
    setErrorMsg("");

    try {
      if (editingCategory) {
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setSuccessMsg("Category updated successfully");
      } else {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setSuccessMsg("Category created successfully");
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    const count = (cat._count?.services || 0) + (cat._count?.products || 0);
    if (count > 0) {
      setErrorMsg(`Cannot delete "${cat.name}" — it has ${cat._count?.services || 0} services and ${cat._count?.products || 0} products. Reassign them first.`);
      return;
    }

    if (!confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/categories/${cat.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccessMsg("Category deleted");
      fetchCategories();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const toggleActive = async (cat: Category) => {
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !cat.isActive }),
      });
      if (!res.ok) throw new Error("Failed to toggle");
      fetchCategories();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to toggle");
    }
  };

  const moveSortOrder = async (cat: Category, direction: "up" | "down") => {
    const newOrder = direction === "up" ? cat.sortOrder - 1 : cat.sortOrder + 1;
    if (newOrder < 0) return;
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: newOrder }),
      });
      if (!res.ok) throw new Error("Failed to reorder");
      fetchCategories();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to reorder");
    }
  };

  const filteredCategories = filterType === "all"
    ? categories
    : categories.filter((c) => c.type === filterType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-charcoal tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage service and product categories</p>
        </div>
        <Button onClick={openAdd} className="bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold tracking-wider uppercase px-6">
          <Plus className="h-4 w-4 mr-2" />Add Category
        </Button>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")}><X className="h-4 w-4" /></button>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg("")}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {["all", "service", "product"].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all border",
              filterType === t
                ? "bg-charcoal text-white border-charcoal"
                : "bg-white text-charcoal border-border hover:border-charcoal"
            )}
          >
            {t === "all" ? "All" : t === "service" ? "Services" : "Products"}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <Loader2 className="h-6 w-6 text-gold animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-3">Loading categories...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <FolderTree className="h-10 w-10 text-border mx-auto mb-3" />
          <p className="text-muted-foreground">No categories found</p>
          <Button onClick={openAdd} variant="outline" className="mt-4 rounded-full text-xs font-semibold tracking-wider uppercase">
            <Plus className="h-4 w-4 mr-2" />Create your first category
          </Button>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-cream/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Slug</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Items</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((cat) => (
                  <>
                    <tr key={cat.id} className="border-b border-border/50 hover:bg-cream/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-cream flex items-center justify-center shrink-0">
                            {cat.type === "service" ? (
                              <FolderTree className="h-4 w-4 text-gold" />
                            ) : (
                              <Package className="h-4 w-4 text-gold" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-charcoal">{cat.name}</p>
                            {cat.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{cat.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <code className="text-xs bg-cream px-2 py-1 rounded text-muted-foreground">/{cat.slug}</code>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className={cn(
                          "text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider",
                          cat.type === "service" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                        )}>
                          {cat.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="flex gap-2">
                          {cat._count?.services ? (
                            <span className="text-[10px] bg-cream px-2 py-1 rounded-full text-muted-foreground">{cat._count.services} services</span>
                          ) : null}
                          {cat._count?.products ? (
                            <span className="text-[10px] bg-cream px-2 py-1 rounded-full text-muted-foreground">{cat._count.products} products</span>
                          ) : null}
                          {!cat._count?.services && !cat._count?.products && (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => toggleActive(cat)} className={cn(
                          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                          cat.isActive ? "bg-gold" : "bg-border"
                        )}>
                          <span className={cn(
                            "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform",
                            cat.isActive ? "translate-x-[18px]" : "translate-x-[3px]"
                          )} />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <button onClick={() => moveSortOrder(cat, "up")} className="text-muted-foreground hover:text-charcoal"><ChevronUp className="h-3 w-3" /></button>
                          <span className="text-xs text-muted-foreground text-center">{cat.sortOrder}</span>
                          <button onClick={() => moveSortOrder(cat, "down")} className="text-muted-foreground hover:text-charcoal"><ChevronDown className="h-3 w-3" /></button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setExpandedRow(expandedRow === cat.id ? null : cat.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-charcoal hover:bg-cream transition-colors"
                          >
                            <ChevronDown className={cn("h-4 w-4 transition-transform", expandedRow === cat.id && "rotate-180")} />
                          </button>
                          <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(cat)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRow === cat.id && (
                      <tr key={`${cat.id}-detail`}>
                        <td colSpan={7} className="px-6 py-4 bg-cream/30">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Description</p>
                              <p className="text-charcoal">{cat.description || "—"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Created</p>
                              <p className="text-charcoal">{new Date(cat.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Services</p>
                              <p className="text-charcoal">{cat._count?.services || 0}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Products</p>
                              <p className="text-charcoal">{cat._count?.products || 0}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-border bg-cream/30">
            <p className="text-xs text-muted-foreground">{filteredCategories.length} categories</p>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-heading text-lg font-semibold text-charcoal">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-muted-foreground hover:text-charcoal hover:bg-cream">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      name,
                      slug: editingCategory ? prev.slug : slugify(name),
                    }));
                  }}
                  placeholder="e.g. Hair Extensions"
                  className="mt-1.5 w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Slug</label>
                <div className="flex items-center mt-1.5">
                  <span className="text-sm text-muted-foreground mr-1">/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                    placeholder="auto-generated"
                    className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description..."
                  rows={3}
                  className="mt-1.5 w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold resize-none"
                />
              </div>

              {/* Type + Sort */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                    className="mt-1.5 w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold"
                  >
                    <option value="service">Service</option>
                    <option value="product">Product</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    min={0}
                    className="mt-1.5 w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Active */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))}
                  className={cn(
                    "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                    formData.isActive ? "bg-gold" : "bg-border"
                  )}
                >
                  <span className={cn(
                    "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform",
                    formData.isActive ? "translate-x-[18px]" : "translate-x-[3px]"
                  )} />
                </button>
                <span className="text-sm text-charcoal">Active</span>
              </div>

              {errorMsg && (
                <p className="text-sm text-red-500">{errorMsg}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <Button variant="outline" onClick={() => setShowModal(false)} className="rounded-full text-xs font-semibold tracking-wider uppercase">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold tracking-wider uppercase px-6">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingCategory ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
