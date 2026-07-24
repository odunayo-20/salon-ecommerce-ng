"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Tag, Trash2, Pencil, Loader2, X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number | null;
  expiresAt: string | null;
  isActive: boolean;
  appliesTo: "ALL" | "PRODUCTS" | "SERVICES";
}

const emptyForm = {
  code: "",
  type: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
  value: "",
  minOrderAmount: "",
  maxDiscountAmount: "",
  usageLimit: "",
  perUserLimit: "",
  expiresAt: "",
  appliesTo: "ALL" as "ALL" | "PRODUCTS" | "SERVICES",
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const fetchCoupons = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/coupons?${params}`);
      const data = await res.json();
      if (res.ok) setCoupons(data.coupons);
    } catch {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      minOrderAmount: coupon.minOrderAmount ? String(coupon.minOrderAmount) : "",
      maxDiscountAmount: coupon.maxDiscountAmount ? String(coupon.maxDiscountAmount) : "",
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
      perUserLimit: coupon.perUserLimit ? String(coupon.perUserLimit) : "",
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split("T")[0] : "",
      appliesTo: coupon.appliesTo,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) return toast.error("Code is required");
    if (!form.value || Number(form.value) <= 0) return toast.error("Value must be positive");
    if (form.type === "PERCENTAGE" && Number(form.value) > 100) return toast.error("Percentage cannot exceed 100");

    setSaving(true);
    try {
      const body = {
        code: form.code.trim(),
        type: form.type,
        value: Number(form.value),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : undefined,
        expiresAt: form.expiresAt || undefined,
        appliesTo: form.appliesTo,
      };

      const url = editingId ? `/api/coupons/${editingId}` : "/api/coupons";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error || "Failed to save coupon");

      toast.success(editingId ? "Coupon updated" : "Coupon created");
      setShowModal(false);
      fetchCoupons();
    } catch {
      toast.error("Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
      if (!res.ok) return toast.error("Failed to delete coupon");
      toast.success("Coupon deleted");
      setShowDeleteConfirm(null);
      fetchCoupons();
    } catch {
      toast.error("Failed to delete coupon");
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/coupons/${coupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      if (!res.ok) return toast.error("Failed to update coupon");
      fetchCoupons();
    } catch {
      toast.error("Failed to update coupon");
    }
  };

  const getStatus = (coupon: Coupon) => {
    if (!coupon.isActive) return { label: "Disabled", color: "bg-gray-100 text-gray-700" };
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return { label: "Expired", color: "bg-red-100 text-red-700" };
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return { label: "Used Up", color: "bg-amber-100 text-amber-700" };
    return { label: "Active", color: "bg-green-100 text-green-700" };
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 text-gold animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-charcoal tracking-tight">Coupons</h1>
          <p className="text-muted-foreground text-sm mt-1">{coupons.length} coupon{coupons.length !== 1 ? "s" : ""} total</p>
        </div>
        <Button onClick={openCreate} className="bg-charcoal text-white hover:bg-charcoal-light rounded-full px-6 text-xs font-semibold tracking-wider uppercase">
          <Plus className="h-4 w-4 mr-2" />Create Coupon
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code..."
            className="w-full bg-white border border-border rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      {coupons.length === 0 ? (
        <div className="text-center py-20">
          <Tag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No coupons found</p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-cream/50">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Code</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Value</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Applies To</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Uses</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Expiry</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => {
                  const status = getStatus(coupon);
                  return (
                    <tr key={coupon.id} className="border-b border-border/50 hover:bg-cream/30">
                      <td className="py-3 px-4">
                        <span className="font-mono font-semibold text-charcoal">{coupon.code}</span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{coupon.type}</td>
                      <td className="py-3 px-4 text-charcoal font-medium">
                        {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : `₦${coupon.value.toLocaleString()}`}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{coupon.appliesTo}</td>
                      <td className="py-3 px-4 text-charcoal">
                        {coupon.usedCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "Never"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => toggleActive(coupon)} className="p-1.5 rounded-lg hover:bg-cream text-muted-foreground hover:text-charcoal" title={coupon.isActive ? "Disable" : "Enable"}>
                            {coupon.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button onClick={() => openEdit(coupon)} className="p-1.5 rounded-lg hover:bg-cream text-muted-foreground hover:text-charcoal" title="Edit">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => setShowDeleteConfirm(coupon.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading font-semibold text-charcoal mb-2">Delete Coupon?</h3>
            <p className="text-sm text-muted-foreground mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)} className="rounded-full text-xs">Cancel</Button>
              <Button onClick={() => handleDelete(showDeleteConfirm)} className="bg-red-600 text-white hover:bg-red-700 rounded-full text-xs">Delete</Button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-lg font-semibold text-charcoal">{editingId ? "Edit Coupon" : "Create Coupon"}</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-charcoal"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Code</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. SAVE20" className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "PERCENTAGE" | "FIXED" })} className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold">
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₦)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Value</label>
                  <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder={form.type === "PERCENTAGE" ? "e.g. 20" : "e.g. 5000"} className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Applies To</label>
                <select value={form.appliesTo} onChange={(e) => setForm({ ...form, appliesTo: e.target.value as "ALL" | "PRODUCTS" | "SERVICES" })} className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold">
                  <option value="ALL">All</option>
                  <option value="PRODUCTS">Products Only</option>
                  <option value="SERVICES">Services Only</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Min Order Amount (₦)</label>
                  <input type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} placeholder="Optional" className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Max Discount (₦)</label>
                  <input type="number" value={form.maxDiscountAmount} onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })} placeholder="Optional" className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Total Usage Limit</label>
                  <input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} placeholder="Unlimited" className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Per-User Limit</label>
                  <input type="number" value={form.perUserLimit} onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })} placeholder="Unlimited" className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Expiry Date</label>
                <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold" />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <Button variant="outline" onClick={() => setShowModal(false)} className="rounded-full text-xs">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-charcoal text-white hover:bg-charcoal-light rounded-full text-xs">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingId ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
