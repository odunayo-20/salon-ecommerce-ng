"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Loader2, CheckCircle2, XCircle, Trash2, Search, X, StarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Review {
  id: string; rating: number; title: string | null; comment: string | null;
  isApproved: boolean; isFeatured: boolean; createdAt: string;
  customer: string | null; customerImage: string | null;
  productName: string | null; serviceName: string | null;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter === "approved") params.set("isApproved", "true");
      if (filter === "pending") params.set("isApproved", "false");
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/admin/reviews?${params}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [filter, search]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);
  useEffect(() => { if (successMsg) { const t = setTimeout(() => setSuccessMsg(""), 3000); return () => clearTimeout(t); } }, [successMsg]);

  const toggleApproval = async (id: string, isApproved: boolean) => {
    setUpdatingId(id);
    try {
      await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isApproved }),
      });
      setSuccessMsg(isApproved ? "Review approved" : "Review unapproved");
      fetchReviews();
    } catch { /* silent */ }
    finally { setUpdatingId(null); }
  };

  const toggleFeatured = async (id: string, isFeatured: boolean) => {
    setUpdatingId(id);
    try {
      await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isFeatured }),
      });
      setSuccessMsg(isFeatured ? "Review featured" : "Review unfeatured");
      fetchReviews();
    } catch { /* silent */ }
    finally { setUpdatingId(null); }
  };

  const handleDelete = async (r: Review) => {
    const label = r.productName || r.serviceName || "this review";
    if (!confirm(`Delete review by "${r.customer || "Anonymous"}" for ${label}? This cannot be undone.`)) return;
    setUpdatingId(r.id);
    try {
      const res = await fetch(`/api/admin/reviews?id=${r.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccessMsg("Review deleted");
      fetchReviews();
    } catch (err) {
      setSuccessMsg(err instanceof Error ? err.message : "Failed to delete");
    } finally { setUpdatingId(null); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });

  const pending = reviews.filter((r) => !r.isApproved).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal tracking-tight">Reviews</h1>
        <p className="text-sm text-muted-foreground mt-1">{reviews.length} total reviews{filter === "all" && pending > 0 && <span className="text-gold font-medium"> · {pending} pending</span>}</p>
      </div>

      {successMsg && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between"><span>{successMsg}</span><button onClick={() => setSuccessMsg("")}><X className="h-4 w-4" /></button></div>}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, title, or comment..." className="w-full bg-white border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" />
        </div>
        <div className="flex gap-1 bg-white border border-border rounded-lg p-1">
          {(["all", "pending", "approved"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize", filter === f ? "bg-charcoal text-white" : "text-muted-foreground hover:text-charcoal")}>
              {f}
              {f === "pending" && pending > 0 && <span className="ml-1.5 bg-gold text-white text-[10px] px-1.5 rounded-full">{pending}</span>}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center"><Loader2 className="h-6 w-6 text-gold animate-spin mx-auto" /></div>
      ) : reviews.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center"><p className="text-muted-foreground">{search ? "No reviews match your search" : "No reviews found"}</p></div>
      ) : (
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-cream/50">
                  {["Customer", "Item", "Rating", "Review", "Status", "Actions"].map((h) => (
                    <th key={h} className={cn("text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider", h === "Actions" && "text-right")}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 last:border-0 hover:bg-cream/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-cream flex items-center justify-center text-xs font-bold text-charcoal shrink-0 overflow-hidden">
                          {r.customerImage ? <img src={r.customerImage} alt="" className="h-full w-full object-cover" /> : (r.customer || "A").charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-charcoal">{r.customer || "Anonymous"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-[10px] bg-cream px-2.5 py-1 rounded-full text-muted-foreground font-medium">
                        {r.productName || r.serviceName || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn("h-3.5 w-3.5", i < r.rating ? "fill-gold text-gold" : "text-gray-200")} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      {r.title && <p className="text-sm font-medium text-charcoal">{r.title}</p>}
                      {r.comment && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{r.comment}</p>}
                      <p className="text-[10px] text-muted-foreground mt-1">{formatDate(r.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider", r.isApproved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
                        {r.isApproved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!r.isApproved ? (
                          <button onClick={() => toggleApproval(r.id, true)} disabled={updatingId === r.id} className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Approve">
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <button onClick={() => toggleApproval(r.id, false)} disabled={updatingId === r.id} className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Unapprove">
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button onClick={() => toggleFeatured(r.id, !r.isFeatured)} disabled={updatingId === r.id} className={cn("p-1.5 rounded-lg transition-colors", r.isFeatured ? "text-gold hover:bg-gold/10" : "text-muted-foreground hover:text-gold hover:bg-gold/10")} title={r.isFeatured ? "Unfeature" : "Feature"}>
                          {r.isFeatured ? <Star className="h-4 w-4 fill-gold" /> : <StarOff className="h-4 w-4" />}
                        </button>
                        <button onClick={() => handleDelete(r)} disabled={updatingId === r.id} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
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
            <p className="text-xs text-muted-foreground">{reviews.length} reviews</p>
          </div>
        </div>
      )}
    </div>
  );
}
