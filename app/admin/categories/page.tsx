"use client";

import { useState, useEffect, Fragment } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, X, Loader2, FolderTree, Package, ChevronDown, ChevronUp, Upload, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/queries";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  image: "",
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
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string; slug: string; description: string | null; image: string | null; type: string; sortOrder: number; isActive: boolean; createdAt: string; _count?: { services: number; products: number } } | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [confirmState, setConfirmState] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({ open: false, title: "", message: "", onConfirm: () => {} });

  const { data, isLoading } = useAdminCategories(filterType !== "all" ? filterType : undefined);
  const categories = data?.categories || [];
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setFormData((prev) => ({ ...prev, image: data.url }));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

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

  const openEdit = (cat: typeof categories[0]) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      image: cat.image || "",
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
        await updateCategory.mutateAsync({ id: editingCategory.id, ...formData });
        setSuccessMsg("Category updated successfully");
      } else {
        await createCategory.mutateAsync(formData);
        setSuccessMsg("Category created successfully");
      }
      setShowModal(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: typeof categories[0]) => {
    const count = (cat._count?.services || 0) + (cat._count?.products || 0);
    if (count > 0) {
      setErrorMsg(`Cannot delete "${cat.name}" — it has ${cat._count?.services || 0} services and ${cat._count?.products || 0} products. Reassign them first.`);
      return;
    }

    setConfirmState({
      open: true,
      title: "Delete category",
      message: `Delete "${cat.name}"? This cannot be undone.`,
      onConfirm: async () => {
        setConfirmState((s) => ({ ...s, open: false }));
        try {
          await deleteCategory.mutateAsync(cat.id);
          setSuccessMsg("Category deleted");
        } catch (err) {
          setErrorMsg(err instanceof Error ? err.message : "Failed to delete");
        }
      },
    });
  };

  const toggleActive = async (cat: typeof categories[0]) => {
    try {
      await updateCategory.mutateAsync({ id: cat.id, isActive: !cat.isActive });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to toggle");
    }
  };

  const moveSortOrder = async (cat: typeof categories[0], direction: "up" | "down") => {
    const newOrder = direction === "up" ? cat.sortOrder - 1 : cat.sortOrder + 1;
    if (newOrder < 0) return;
    try {
      await updateCategory.mutateAsync({ id: cat.id, sortOrder: newOrder });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to reorder");
    }
  };

  const filteredCategories = filterType === "all"
    ? categories
    : categories.filter((c) => c.type === filterType);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-charcoal tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">{filteredCategories.length} categor{filteredCategories.length !== 1 ? "ies" : "y"}</p>
        </div>
        <Button onClick={openAdd} className="bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold tracking-wider uppercase px-6 min-h-[44px]">
          <Plus className="h-4 w-4 mr-2" />Add Category
        </Button>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="min-h-[44px] min-w-[44px] flex items-center justify-center"><X className="h-4 w-4" /></button>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg("")} className="min-h-[44px] min-w-[44px] flex items-center justify-center"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "service", "product"].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all border min-h-[44px]",
              filterType === t
                ? "bg-charcoal text-white border-charcoal"
                : "bg-white text-charcoal border-border hover:border-charcoal"
            )}
          >
            {t === "all" ? "All" : t === "service" ? "Services" : "Products"}
          </button>
        ))}
      </div>

      {/* Loading / Empty */}
      {isLoading ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <Loader2 className="h-6 w-6 text-gold animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-3">Loading categories...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <FolderTree className="h-10 w-10 text-border mx-auto mb-3" />
          <p className="text-muted-foreground">No categories found</p>
          <Button onClick={openAdd} variant="outline" className="mt-4 rounded-full text-xs font-semibold tracking-wider uppercase min-h-[44px]">
            <Plus className="h-4 w-4 mr-2" />Create your first category
          </Button>
        </div>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="sm:hidden space-y-3">
            {filteredCategories.map((cat) => (
              <div key={cat.id} className="bg-white border border-border rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-cream flex items-center justify-center shrink-0 overflow-hidden">
                    {cat.image ? (
                      <Image src={cat.image} alt={cat.name} width={40} height={40} className="object-cover w-full h-full" />
                    ) : cat.type === "service" ? (
                      <FolderTree className="h-4 w-4 text-gold" />
                    ) : (
                      <Package className="h-4 w-4 text-gold" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal truncate">{cat.name}</p>
                    {cat.description && (
                      <p className="text-xs text-muted-foreground truncate">{cat.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={cn(
                        "text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider",
                        cat.type === "service" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                      )}>
                        {cat.type}
                      </span>
                      {(cat._count?.services || 0) + (cat._count?.products || 0) > 0 && (
                        <span className="text-[10px] bg-cream px-2 py-1 rounded-full text-muted-foreground">
                          {cat._count?.services || 0} services, {cat._count?.products || 0} products
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                      <button onClick={() => toggleActive(cat)} className={cn(
                        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                        cat.isActive ? "bg-gold" : "bg-border"
                      )}>
                        <span className={cn(
                          "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform",
                          cat.isActive ? "translate-x-[18px]" : "translate-x-[3px]"
                        )} />
                      </button>
                    </div>
                    <div className="flex items-center gap-0.5 min-h-[44px]">
                      <button onClick={() => moveSortOrder(cat, "up")} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-charcoal"><ChevronUp className="h-4 w-4" /></button>
                      <span className="text-xs text-muted-foreground text-center min-w-[20px]">{cat.sortOrder}</span>
                      <button onClick={() => moveSortOrder(cat, "down")} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-charcoal"><ChevronDown className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(cat)} className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(cat)} className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table view */}
          <div className="hidden sm:block bg-white border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-cream/50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Slug</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Items</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((cat) => (
                    <Fragment key={cat.id}>
                      <tr className="border-b border-border/50 hover:bg-cream/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-cream flex items-center justify-center shrink-0 overflow-hidden">
                              {cat.image ? (
                                <Image src={cat.image} alt={cat.name} width={36} height={36} className="object-cover w-full h-full" />
                              ) : cat.type === "service" ? (
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
                        <td className="px-6 py-4">
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
                          <div className="min-h-[44px] min-w-[44px] flex items-center">
                            <button onClick={() => toggleActive(cat)} className={cn(
                              "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                              cat.isActive ? "bg-gold" : "bg-border"
                            )}>
                              <span className={cn(
                                "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform",
                                cat.isActive ? "translate-x-[18px]" : "translate-x-[3px]"
                              )} />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5 min-h-[44px] min-w-[44px] items-center justify-center">
                            <button onClick={() => moveSortOrder(cat, "up")} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-charcoal"><ChevronUp className="h-3 w-3" /></button>
                            <span className="text-xs text-muted-foreground text-center">{cat.sortOrder}</span>
                            <button onClick={() => moveSortOrder(cat, "down")} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-charcoal"><ChevronDown className="h-3 w-3" /></button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setExpandedRow(expandedRow === cat.id ? null : cat.id)}
                              className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-charcoal hover:bg-cream transition-colors"
                            >
                              <ChevronDown className={cn("h-4 w-4 transition-transform", expandedRow === cat.id && "rotate-180")} />
                            </button>
                            <button onClick={() => openEdit(cat)} className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(cat)} className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedRow === cat.id && (
                        <tr key={`${cat.id}-detail`}>
                          <td colSpan={7} className="px-6 py-4 bg-cream/30">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              {cat.image && (
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Image</p>
                                  <Image src={cat.image} alt={cat.name} width={80} height={80} className="rounded-lg object-cover" />
                                </div>
                              )}
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
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 border-t border-border bg-cream/30">
              <p className="text-xs text-muted-foreground">{filteredCategories.length} categories</p>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white z-10">
              <h2 className="font-heading text-lg font-semibold text-charcoal">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-charcoal hover:bg-cream">
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

              {/* Image */}
              <div>
                <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Image</label>
                <div className="mt-1.5">
                  {formData.image ? (
                    <div className="relative group w-full max-w-[200px]">
                      <Image src={formData.image} alt="Category" width={200} height={120} className="rounded-lg object-cover w-full h-32" />
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                        className="absolute top-2 right-2 p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-gold transition-colors bg-cream/50">
                      {uploadingImage ? (
                        <Loader2 className="h-6 w-6 text-gold animate-spin" />
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                          <span className="text-xs text-muted-foreground">Click to upload image</span>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                    </label>
                  )}
                </div>
              </div>

              {/* Type + Sort */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="flex items-center gap-3 min-h-[44px]">
                <div className="min-h-[44px] min-w-[44px] flex items-center">
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
                </div>
                <span className="text-sm text-charcoal">Active</span>
              </div>

              {errorMsg && (
                <p className="text-sm text-red-500">{errorMsg}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border sticky bottom-0 bg-white">
              <Button variant="outline" onClick={() => setShowModal(false)} className="rounded-full text-xs font-semibold tracking-wider uppercase min-h-[44px]">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold tracking-wider uppercase px-6 min-h-[44px]">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingCategory ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={(open) => setConfirmState((s) => ({ ...s, open }))}
        title={confirmState.title}
        description={confirmState.message}
        onConfirm={confirmState.onConfirm}
      />
    </div>
  );
}
