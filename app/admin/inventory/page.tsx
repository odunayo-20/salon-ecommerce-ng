"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Search, AlertTriangle, Package, ArrowUpDown, Plus, Minus, Upload, X } from "lucide-react";
import { useInventory, useAdjustStock, useBulkUpdateStock } from "@/hooks/queries";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tab = "stock" | "movements";

export default function AdminInventoryPage() {
  const [tab, setTab] = useState<Tab>("stock");
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [adjustDialog, setAdjustDialog] = useState<{ productId: string; name: string; currentStock: number; variantId?: string; variantName?: string } | null>(null);
  const [adjustType, setAdjustType] = useState("ADJUSTMENT");
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustNote, setAdjustNote] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkChanges, setBulkChanges] = useState<Record<string, number>>({});

  const { data, isLoading } = useInventory({ search, lowStock: lowStockOnly });
  const adjustStock = useAdjustStock();
  const bulkUpdate = useBulkUpdateStock();

  const handleAdjust = async () => {
    if (!adjustDialog || adjustQty === 0) return;
    const quantity = adjustType === "RESTOCK" || adjustType === "RETURN" ? Math.abs(adjustQty) : -Math.abs(adjustQty);
    await adjustStock.mutateAsync({
      productId: adjustDialog.productId,
      variantId: adjustDialog.variantId,
      type: adjustType,
      quantity,
      note: adjustNote || undefined,
    });
    setAdjustDialog(null);
    setAdjustQty(0);
    setAdjustNote("");
  };

  const handleBulkSave = async () => {
    const items = Object.entries(bulkChanges).map(([productId, stock]) => ({ productId, stock }));
    if (items.length === 0) return;
    await bulkUpdate.mutateAsync({ items, note: "Bulk inventory update" });
    setBulkChanges({});
    setBulkMode(false);
  };

  const typeColors: Record<string, string> = {
    ADJUSTMENT: "bg-blue-50 text-blue-700", RESTOCK: "bg-emerald-50 text-emerald-700",
    SALE: "bg-purple-50 text-purple-700", RETURN: "bg-amber-50 text-amber-700",
    DAMAGE: "bg-red-50 text-red-600", TRANSFER: "bg-gray-50 text-gray-600",
    RESERVATION: "bg-orange-50 text-orange-700", RELEASE: "bg-cyan-50 text-cyan-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-charcoal">Inventory</h1>
          {data && data.lowStockCount > 0 && (
            <p className="text-sm text-amber-600 flex items-center gap-1 mt-1"><AlertTriangle className="h-3.5 w-3.5" />{data.lowStockCount} product{data.lowStockCount !== 1 ? "s" : ""} low on stock</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {tab === "stock" && (
            <>
              <Button onClick={() => setBulkMode(!bulkMode)} variant={bulkMode ? "default" : "outline"} size="sm" className={cn("rounded-full text-xs", bulkMode && "bg-gold text-white")}>
                <Upload className="h-3 w-3 mr-1" />Bulk Edit
              </Button>
              {bulkMode && Object.keys(bulkChanges).length > 0 && (
                <Button onClick={handleBulkSave} disabled={bulkUpdate.isPending} size="sm" className="bg-gold text-white hover:bg-gold-dark rounded-full text-xs">
                  {bulkUpdate.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                  Save ({Object.keys(bulkChanges).length})
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {([["stock", "Stock Overview"], ["movements", "Movement History"]] as [Tab, string][]).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} className={cn("px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors", tab === t ? "border-gold text-gold" : "border-transparent text-muted-foreground hover:text-charcoal")}>{label}</button>
        ))}
      </div>

      {tab === "stock" && (
        <>
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full bg-white border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold" />
            </div>
            <Button onClick={() => setLowStockOnly(!lowStockOnly)} variant={lowStockOnly ? "default" : "outline"} size="sm" className={cn("rounded-full text-xs", lowStockOnly && "bg-amber-500 text-white hover:bg-amber-600")}>
              <AlertTriangle className="h-3 w-3 mr-1" />Low Stock Only
            </Button>
          </div>

          {isLoading ? (
            <div className="py-20 text-center"><Loader2 className="h-8 w-8 text-gold animate-spin mx-auto" /></div>
          ) : !data?.products.length ? (
            <div className="py-20 text-center"><Package className="h-12 w-12 text-border mx-auto mb-3" /><p className="text-muted-foreground">No products found</p></div>
          ) : (
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-cream/50">
                      {["Product", "SKU", "Category", "Stock", "Status", "Actions"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.products.map((p) => (
                      <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-cream/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-cream rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                              {p.image ? <Image src={p.image} alt={p.name} width={40} height={40} className="h-full w-full object-cover" /> : <Package className="h-4 w-4 text-muted-foreground" />}
                            </div>
                            <span className="font-medium text-charcoal">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{p.sku || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{p.category}</td>
                        <td className="px-4 py-3">
                          {bulkMode ? (
                            <input type="number" defaultValue={p.stock} onChange={(e) => setBulkChanges((prev) => ({ ...prev, [p.id]: parseInt(e.target.value) || 0 }))} className="w-20 border border-border rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-gold" />
                          ) : (
                            <span className={cn("font-medium", p.isOutOfStock ? "text-red-600" : p.isLowStock ? "text-amber-600" : "text-charcoal")}>{p.stock}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {p.isOutOfStock ? <span className="text-[10px] font-semibold bg-red-50 text-red-600 px-2 py-0.5 rounded-full">Out of Stock</span>
                            : p.isLowStock ? <span className="text-[10px] font-semibold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">Low Stock</span>
                            : <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">In Stock</span>}
                        </td>
                        <td className="px-4 py-3">
                          {!bulkMode && (
                            <Button onClick={() => setAdjustDialog({ productId: p.id, name: p.name, currentStock: p.stock })} variant="outline" size="sm" className="rounded-full text-xs h-7">
                              <ArrowUpDown className="h-3 w-3 mr-1" />Adjust
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {tab === "movements" && (
        <>
          {isLoading ? (
            <div className="py-20 text-center"><Loader2 className="h-8 w-8 text-gold animate-spin mx-auto" /></div>
          ) : !data?.recentMovements.length ? (
            <div className="py-20 text-center"><ArrowUpDown className="h-12 w-12 text-border mx-auto mb-3" /><p className="text-muted-foreground">No stock movements yet</p></div>
          ) : (
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-cream/50">
                      {["Product", "Type", "Qty", "Before", "After", "Note", "Date"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentMovements.map((m) => (
                      <tr key={m.id} className="border-b border-border/50 last:border-0">
                        <td className="px-4 py-3">
                          <span className="font-medium text-charcoal">{m.productName}</span>
                          {m.variantName && <span className="text-xs text-muted-foreground ml-1">({m.variantName})</span>}
                        </td>
                        <td className="px-4 py-3"><span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", typeColors[m.type] || "bg-gray-50 text-gray-600")}>{m.type}</span></td>
                        <td className={cn("px-4 py-3 font-medium", m.quantity > 0 ? "text-emerald-600" : "text-red-500")}>{m.quantity > 0 ? "+" : ""}{m.quantity}</td>
                        <td className="px-4 py-3 text-muted-foreground">{m.previousQty}</td>
                        <td className="px-4 py-3 font-medium text-charcoal">{m.newQty}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs max-w-[200px] truncate">{m.note || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(m.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Adjust Dialog */}
      {adjustDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setAdjustDialog(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold text-charcoal">Adjust Stock</h3>
              <button onClick={() => setAdjustDialog(null)} className="text-muted-foreground hover:text-charcoal"><X className="h-5 w-5" /></button>
            </div>
            <div className="bg-cream rounded-lg p-3">
              <p className="text-sm font-medium text-charcoal">{adjustDialog.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Current stock: {adjustDialog.currentStock}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-charcoal uppercase tracking-wider">Type</label>
              <select value={adjustType} onChange={(e) => setAdjustType(e.target.value)} className="mt-1 w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold">
                {["ADJUSTMENT", "RESTOCK", "RETURN", "DAMAGE", "TRANSFER"].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-charcoal uppercase tracking-wider">{adjustType === "RESTOCK" || adjustType === "RETURN" ? "Quantity to Add" : "Quantity to Remove"}</label>
              <input type="number" min="0" value={adjustQty} onChange={(e) => setAdjustQty(parseInt(e.target.value) || 0)} className="mt-1 w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold" />
              <p className="text-xs text-muted-foreground mt-1">New stock: {adjustType === "RESTOCK" || adjustType === "RETURN" ? adjustDialog.currentStock + adjustQty : adjustDialog.currentStock - adjustQty}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-charcoal uppercase tracking-wider">Note (optional)</label>
              <input value={adjustNote} onChange={(e) => setAdjustNote(e.target.value)} placeholder="Reason for adjustment" className="mt-1 w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setAdjustDialog(null)} className="flex-1 rounded-full text-xs">Cancel</Button>
              <Button onClick={handleAdjust} disabled={adjustQty === 0 || adjustStock.isPending} className="flex-1 bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold">
                {adjustStock.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <ArrowUpDown className="h-3.5 w-3.5 mr-1" />}Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
