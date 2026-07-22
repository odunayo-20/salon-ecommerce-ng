"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Review { id: string; rating: number; title: string | null; comment: string | null; isApproved: boolean; isFeatured: boolean; createdAt: string; customer: string | null; productName: string | null; serviceName: string | null; }

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter === "approved") params.set("isApproved", "true");
      if (filter === "pending") params.set("isApproved", "false");
      const res = await fetch(`/api/admin/reviews?${params}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const toggleApproval = async (id: string, isApproved: boolean) => {
    setUpdatingId(id);
    try {
      await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isApproved }),
      });
      fetchReviews();
    } catch { /* silent */ }
    finally { setUpdatingId(null); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-charcoal mb-6">Reviews</h1>
      <div className="flex gap-2 mb-6">
        {["all", "pending", "approved"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("px-4 py-2 rounded-full text-xs font-medium capitalize border transition-colors", filter === f ? "bg-charcoal text-white border-charcoal" : "bg-white text-charcoal border-border hover:border-charcoal")}>{f}</button>
        ))}
      </div>
      {loading ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center"><Loader2 className="h-6 w-6 text-gold animate-spin mx-auto" /></div>
      ) : reviews.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center"><p className="text-muted-foreground">No reviews found</p></div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white border border-border rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-charcoal text-sm">{r.customer || "Anonymous"}</h3>
                    <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={cn("h-3 w-3", i < r.rating ? "fill-gold text-gold" : "text-gray-200")} />)}</div>
                    <span className={cn("text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full", r.isApproved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{r.isApproved ? "Approved" : "Pending"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.productName || r.serviceName || "—"} · {formatDate(r.createdAt)}</p>
                  {r.title && <p className="text-sm font-medium text-charcoal mt-2">{r.title}</p>}
                  {r.comment && <p className="text-sm text-charcoal mt-1">{r.comment}</p>}
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
                  {!r.isApproved && (
                    <button onClick={() => toggleApproval(r.id, true)} disabled={updatingId === r.id} className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"><CheckCircle2 className="h-3.5 w-3.5" />Approve</button>
                  )}
                  {r.isApproved && (
                    <button onClick={() => toggleApproval(r.id, false)} disabled={updatingId === r.id} className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium"><XCircle className="h-3.5 w-3.5" />Unapprove</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
