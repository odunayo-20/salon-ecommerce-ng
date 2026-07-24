"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, X, Loader2, Scissors, Star, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  duration: number;
  price: number;
  depositAmount: number | null;
  image: string | null;
  categoryId: string;
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  category: Category;
  reviewCount: number;
  appointmentCount: number;
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  duration: 60,
  price: 0,
  depositAmount: 0,
  categoryId: "",
  isActive: true,
  isPopular: false,
  sortOrder: 0,
};

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function formatDuration(mins: number) {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  const fetchServices = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterCategory !== "all") params.set("categoryId", filterCategory);
      if (filterStatus === "active") params.set("isActive", "true");
      if (filterStatus === "inactive") params.set("isActive", "false");
      if (search) params.set("search", search);
      params.set("limit", "100");

      const res = await fetch(`/api/services?${params}`);
      const data = await res.json();
      setServices(data.services || []);
    } catch {
      setErrorMsg("Failed to load services");
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterStatus, search]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories?type=service");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(""), 3000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  const openAdd = () => {
    setEditingService(null);
    setFormData(emptyForm);
    setShowModal(true);
    setErrorMsg("");
  };

  const openEdit = (s: Service) => {
    setEditingService(s);
    setFormData({
      name: s.name,
      slug: s.slug,
      description: s.description || "",
      duration: s.duration,
      price: s.price,
      depositAmount: s.depositAmount || 0,
      categoryId: s.categoryId,
      isActive: s.isActive,
      isPopular: s.isPopular,
      sortOrder: s.sortOrder,
    });
    setShowModal(true);
    setErrorMsg("");
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return setErrorMsg("Name is required");
    if (!formData.slug.trim()) {
      setFormData((prev) => ({ ...prev, slug: slugify(prev.name) }));
      return;
    }
    if (!formData.categoryId) return setErrorMsg("Category is required");
    if (formData.price <= 0) return setErrorMsg("Price must be greater than 0");
    if (formData.duration <= 0) return setErrorMsg("Duration must be greater than 0");

    setSaving(true);
    setErrorMsg("");

    try {
      const payload = {
        ...formData,
        depositAmount: formData.depositAmount > 0 ? formData.depositAmount : null,
      };

      if (editingService) {
        const res = await fetch(`/api/services/${editingService.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setSuccessMsg("Service updated successfully");
      } else {
        const res = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setSuccessMsg("Service created successfully");
      }
      setShowModal(false);
      fetchServices();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s: Service) => {
    if (s.appointmentCount > 0) {
      setErrorMsg(`Cannot delete "${s.name}" — it has ${s.appointmentCount} appointments. Deactivate instead.`);
      return;
    }
    if (!confirm(`Delete "${s.name}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/services/${s.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccessMsg("Service deleted");
      fetchServices();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const toggleActive = async (s: Service) => {
    try {
      const res = await fetch(`/api/services/${s.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !s.isActive }),
      });
      if (!res.ok) throw new Error("Failed");
      fetchServices();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed");
    }
  };

  const togglePopular = async (s: Service) => {
    try {
      const res = await fetch(`/api/services/${s.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPopular: !s.isPopular }),
      });
      if (!res.ok) throw new Error("Failed");
      fetchServices();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-charcoal tracking-tight">Services</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your salon services and pricing</p>
        </div>
        <Button onClick={openAdd} className="bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold tracking-wider uppercase px-6 min-h-[44px]">
          <Plus className="h-4 w-4 mr-2" />Add Service
        </Button>
      </div>

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

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services..."
            className="w-full bg-white border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-white border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <div className="flex gap-1 bg-white border border-border rounded-lg p-1">
          {(["all", "active", "inactive"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize min-h-[44px] min-w-[44px] flex items-center justify-center",
                filterStatus === status ? "bg-charcoal text-white" : "text-muted-foreground hover:text-charcoal"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <Loader2 className="h-6 w-6 text-gold animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-3">Loading services...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <Scissors className="h-10 w-10 text-border mx-auto mb-3" />
          <p className="text-muted-foreground">No services found</p>
          <Button onClick={openAdd} variant="outline" className="mt-4 rounded-full text-xs font-semibold tracking-wider uppercase min-h-[44px]">
            <Plus className="h-4 w-4 mr-2" />Add your first service
          </Button>
        </div>
      ) : (
        <>
          <div className="sm:hidden space-y-3">
            {services.map((s) => (
              <div key={s.id} className="bg-white border border-border rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-9 w-9 rounded-lg bg-cream flex items-center justify-center shrink-0">
                      <Scissors className="h-4 w-4 text-gold" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-charcoal truncate">{s.name}</p>
                        {s.isPopular && (
                          <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <Star className="h-2.5 w-2.5 fill-gold" />Popular
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] bg-cream px-2.5 py-1 rounded-full text-muted-foreground font-medium">{s.category.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => openEdit(s)} className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(s)} className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-semibold text-charcoal">₦{s.price.toLocaleString()}</span>
                  <span className="text-muted-foreground">{formatDuration(s.duration)}</span>
                  <span className="text-muted-foreground">{s.appointmentCount} bookings</span>
                </div>
                <div className="flex items-center gap-4 pt-1">
                  <div className="min-h-[44px] flex items-center gap-2">
                    <button onClick={() => toggleActive(s)} className={cn(
                      "relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0",
                      s.isActive ? "bg-gold" : "bg-border"
                    )}>
                      <span className={cn(
                        "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform",
                        s.isActive ? "translate-x-[18px]" : "translate-x-[3px]"
                      )} />
                    </button>
                    <span className="text-xs text-muted-foreground">{s.isActive ? "Active" : "Inactive"}</span>
                  </div>
                  <div className="min-h-[44px] flex items-center">
                    <button onClick={() => togglePopular(s)} className={cn(
                      "p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded transition-colors shrink-0",
                      s.isPopular ? "text-gold" : "text-border hover:text-gold/50"
                    )} title={s.isPopular ? "Remove from popular" : "Mark as popular"}>
                      <Star className={cn("h-4 w-4", s.isPopular && "fill-gold")} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="px-1 py-1">
              <p className="text-xs text-muted-foreground">{services.length} services</p>
            </div>
          </div>

          <div className="hidden sm:block bg-white border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-cream/50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Service</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Category</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Duration</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Bookings</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s) => (
                    <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-cream/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-cream flex items-center justify-center shrink-0">
                            <Scissors className="h-4 w-4 text-gold" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-charcoal truncate">{s.name}</p>
                              {s.isPopular && (
                                <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                  <Star className="h-2.5 w-2.5 fill-gold" />Popular
                                </span>
                              )}
                            </div>
                            <code className="text-[10px] text-muted-foreground">/{s.slug}</code>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-[10px] bg-cream px-2.5 py-1 rounded-full text-muted-foreground font-medium">{s.category.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-charcoal">₦{s.price.toLocaleString()}</span>
                        {s.depositAmount ? (
                          <p className="text-[10px] text-muted-foreground">₦{s.depositAmount.toLocaleString()} deposit</p>
                        ) : null}
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground">{formatDuration(s.duration)}</span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground">{s.appointmentCount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 min-h-[44px]">
                          <button onClick={() => toggleActive(s)} className={cn(
                            "relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0",
                            s.isActive ? "bg-gold" : "bg-border"
                          )}>
                            <span className={cn(
                              "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform",
                              s.isActive ? "translate-x-[18px]" : "translate-x-[3px]"
                            )} />
                          </button>
                          <button onClick={() => togglePopular(s)} className={cn(
                            "p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded transition-colors shrink-0",
                            s.isPopular ? "text-gold" : "text-border hover:text-gold/50"
                          )} title={s.isPopular ? "Remove from popular" : "Mark as popular"}>
                            <Star className={cn("h-4 w-4", s.isPopular && "fill-gold")} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(s)} className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(s)} className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 border-t border-border bg-cream/30">
              <p className="text-xs text-muted-foreground">{services.length} services</p>
            </div>
          </div>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white z-10">
              <h2 className="font-heading text-lg font-semibold text-charcoal">
                {editingService ? "Edit Service" : "Add Service"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-charcoal hover:bg-cream">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData((prev) => ({ ...prev, name, slug: editingService ? prev.slug : slugify(name) }));
                  }}
                  placeholder="e.g. Knotless Braids"
                  className="mt-1.5 w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold"
                />
              </div>

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

              <div>
                <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Category *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
                  className="mt-1.5 w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the service..."
                  rows={3}
                  className="mt-1.5 w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Price (₦) *</label>
                  <input
                    type="number"
                    value={formData.price || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                    min={0}
                    className="mt-1.5 w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Duration (min) *</label>
                  <input
                    type="number"
                    value={formData.duration || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, duration: Number(e.target.value) }))}
                    min={15}
                    step={15}
                    className="mt-1.5 w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Deposit Amount (₦)</label>
                <input
                  type="number"
                  value={formData.depositAmount || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, depositAmount: Number(e.target.value) }))}
                  min={0}
                  placeholder="Optional"
                  className="mt-1.5 w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Leave 0 for no deposit requirement</p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center justify-between min-h-[44px]">
                  <span className="text-sm text-charcoal">Active</span>
                  <div className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                    <button type="button" onClick={() => setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))} className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors", formData.isActive ? "bg-gold" : "bg-border")}>
                      <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform", formData.isActive ? "translate-x-[18px]" : "translate-x-[3px]")} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between min-h-[44px]">
                  <span className="text-sm text-charcoal">Popular</span>
                  <div className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                    <button type="button" onClick={() => setFormData((prev) => ({ ...prev, isPopular: !prev.isPopular }))} className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors", formData.isPopular ? "bg-gold" : "bg-border")}>
                      <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform", formData.isPopular ? "translate-x-[18px]" : "translate-x-[3px]")} />
                    </button>
                  </div>
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

              {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border sticky bottom-0 bg-white">
              <Button variant="outline" onClick={() => setShowModal(false)} className="rounded-full text-xs font-semibold tracking-wider uppercase min-h-[44px]">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold tracking-wider uppercase px-6 min-h-[44px]">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingService ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
