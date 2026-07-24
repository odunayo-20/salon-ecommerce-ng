"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Tag, Trash2, Pencil, Loader2, X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAdminCoupons, useUpsertCoupon, useDeleteCoupon } from "@/hooks/queries";

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

function LoadingSkeleton() {
  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-border/50 last:border-b-0">
          <div className="h-5 w-24 rounded bg-cream animate-pulse" />
          <div className="h-5 w-16 rounded bg-cream animate-pulse" />
          <div className="h-5 w-12 rounded bg-cream animate-pulse hidden sm:block" />
          <div className="h-5 w-20 rounded bg-cream animate-pulse hidden sm:block" />
          <div className="h-5 w-10 rounded bg-cream animate-pulse hidden sm:block" />
          <div className="h-5 w-16 rounded bg-cream animate-pulse hidden sm:block" />
          <div className="h-5 w-14 rounded-full bg-cream animate-pulse ml-auto" />
          <div className="flex gap-2 ml-auto sm:ml-0">
            <div className="h-9 w-9 rounded-lg bg-cream animate-pulse" />
            <div className="h-9 w-9 rounded-lg bg-cream animate-pulse" />
            <div className="h-9 w-9 rounded-lg bg-cream animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminCouponsPage() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const { data, isLoading } = useAdminCoupons();
  const coupons = data?.coupons || [];

  const upsertCoupon = useUpsertCoupon();
  const deleteCoupon = useDeleteCoupon();

  const filteredCoupons = search
    ? coupons.filter((c) => c.code.toLowerCase().includes(search.toLowerCase()))
    : coupons;

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (coupon: typeof coupons[0]) => {
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
        method: editingId ? "PUT" : "POST",
        ...(editingId ? { id: editingId } : {}),
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

      await upsertCoupon.mutateAsync(body);
      toast.success(editingId ? "Coupon updated" : "Coupon created");
      setShowModal(false);
    } catch {
      toast.error("Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCoupon.mutateAsync(id);
      toast.success("Coupon deleted");
      setShowDeleteConfirm(null);
    } catch {
      toast.error("Failed to delete coupon");
    }
  };

  const toggleActive = async (coupon: typeof coupons[0]) => {
    try {
      await upsertCoupon.mutateAsync({ method: "PUT", id: coupon.id, isActive: !coupon.isActive });
    } catch {
      toast.error("Failed to update coupon");
    }
  };

  const getStatus = (coupon: typeof coupons[0]) => {
    if (!coupon.isActive) return { label: "Disabled", color: "bg-gray-100 text-gray-700" };
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return { label: "Expired", color: "bg-red-100 text-red-700" };
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return { label: "Used Up", color: "bg-amber-100 text-amber-700" };
    return { label: "Active", color: "bg-green-100 text-green-700" };
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-7 w-28 rounded bg-cream animate-pulse" />
            <div className="h-4 w-20 rounded bg-cream animate-pulse mt-2" />
          </div>
          <div className="h-9 w-32 rounded-full bg-cream animate-pulse" />
        </div>
        <div className="mb-6">
          <div className="h-10 w-full max-w-sm rounded-full bg-cream animate-pulse" />
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-charcoal tracking-tight">Coupons</h1>
          <p className="text-muted-foreground text-sm mt-1">{coupons.length} coupon{coupons.length !== 1 ? "s" : ""} total</p>
        </div>
        <Button onClick={openCreate} className="bg-charcoal text-white hover:bg-charcoal-light rounded-full px-6 text-xs font-semibold tracking-wider uppercase min-h-[44px] min-w-[44px]">
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
            className="w-full bg-white border border-border rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold min-h-[44px]"
          />
        </div>
      </div>

      {filteredCoupons.length === 0 ? (
        <div className="text-center py-20">
          <Tag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No coupons found</p>
        </div>
      ) : (
        <div className="space-y-3 sm:hidden">
          {filteredCoupons.map((coupon) => {
            const status = getStatus(coupon);
            return (
              <div key={coupon.id} className="bg-white border border-border rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <span className="font-mono font-semibold text-charcoal text-sm">{coupon.code}</span>
                  <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                <div className="space-y-1.5 text-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="text-charcoal">{coupon.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Value</span>
                    <span className="text-charcoal font-medium">
                      {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : `₦${coupon.value.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Applies To</span>
                    <span className="text-charcoal">{coupon.appliesTo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uses</span>
                    <span className="text-charcoal">
                      {coupon.usedCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expiry</span>
                    <span className="text-charcoal">
                      {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "Never"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-t border-border/50 pt-3">
                  <button
                    onClick={() => toggleActive(coupon)}
                    className="p-2.5 min-h-[44px] min-w-[44px] rounded-lg hover:bg-cream text-muted-foreground hover:text-charcoal flex items-center justify-center"
                    title={coupon.isActive ? "Disable" : "Enable"}
                  >
                    {coupon.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => openEdit(coupon)}
                    className="p-2.5 min-h-[44px] min-w-[44px] rounded-lg hover:bg-cream text-muted-foreground hover:text-charcoal flex items-center justify-center"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(coupon.id)}
                    className="p-2.5 min-h-[44px] min-w-[44px] rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 flex items-center justify-center"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredCoupons.length > 0 && (
        <div className="bg-white border border-border rounded-xl overflow-hidden hidden sm:block">
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
                {filteredCoupons.map((coupon) => {
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
                          <button onClick={() => toggleActive(coupon)} className="p-2.5 min-h-[44px] min-w-[44px] rounded-lg hover:bg-cream text-muted-foreground hover:text-charcoal flex items-center justify-center" title={coupon.isActive ? "Disable" : "Enable"}>
                            {coupon.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button onClick={() => openEdit(coupon)} className="p-2.5 min-h-[44px] min-w-[44px] rounded-lg hover:bg-cream text-muted-foreground hover:text-charcoal flex items-center justify-center" title="Edit">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => setShowDeleteConfirm(coupon.id)} className="p-2.5 min-h-[44px] min-w-[44px] rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 flex items-center justify-center" title="Delete">
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

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading font-semibold text-charcoal mb-2">Delete Coupon?</h3>
            <p className="text-sm text-muted-foreground mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)} className="rounded-full text-xs min-h-[44px] min-w-[44px]">Cancel</Button>
              <Button onClick={() => handleDelete(showDeleteConfirm)} className="bg-red-600 text-white hover:bg-red-700 rounded-full text-xs min-h-[44px] min-w-[44px]">Delete</Button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-lg font-semibold text-charcoal">{editingId ? "Edit Coupon" : "Create Coupon"}</h3>
              <button onClick={() => setShowModal(false)} className="p-2.5 min-h-[44px] min-w-[44px] rounded-lg text-muted-foreground hover:text-charcoal flex items-center justify-center"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Code</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. SAVE20" className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold font-mono min-h-[44px]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "PERCENTAGE" | "FIXED" })} className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold min-h-[44px]">
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₦)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Value</label>
                  <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder={form.type === "PERCENTAGE" ? "e.g. 20" : "e.g. 5000"} className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold min-h-[44px]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Applies To</label>
                <select value={form.appliesTo} onChange={(e) => setForm({ ...form, appliesTo: e.target.value as "ALL" | "PRODUCTS" | "SERVICES" })} className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold min-h-[44px]">
                  <option value="ALL">All</option>
                  <option value="PRODUCTS">Products Only</option>
                  <option value="SERVICES">Services Only</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Min Order Amount (₦)</label>
                  <input type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} placeholder="Optional" className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold min-h-[44px]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Max Discount (₦)</label>
                  <input type="number" value={form.maxDiscountAmount} onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })} placeholder="Optional" className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold min-h-[44px]" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Total Usage Limit</label>
                  <input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} placeholder="Unlimited" className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold min-h-[44px]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Per-User Limit</label>
                  <input type="number" value={form.perUserLimit} onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })} placeholder="Unlimited" className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold min-h-[44px]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Expiry Date</label>
                <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold min-h-[44px]" />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <Button variant="outline" onClick={() => setShowModal(false)} className="rounded-full text-xs min-h-[44px] min-w-[44px]">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-charcoal text-white hover:bg-charcoal-light rounded-full text-xs min-h-[44px] min-w-[44px]">
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
