"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Star, Loader2, CheckCircle, PenLine, ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  productId?: string;
  serviceId?: string;
  itemName: string;
  onSubmitted?: () => void;
}

interface Eligibility {
  eligible: boolean;
  reason?: string;
  alreadyReviewed?: boolean;
  orderNumber?: string;
}

export function ReviewForm({ productId, serviceId, itemName, onSubmitted }: ReviewFormProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [loadingEligibility, setLoadingEligibility] = useState(false);

  useEffect(() => {
    if (!productId || !session?.user) return;
    setLoadingEligibility(true);
    fetch(`/api/reviews/eligibility?productId=${productId}`)
      .then((r) => r.json())
      .then((data) => setEligibility(data))
      .catch(() => setEligibility({ eligible: false, reason: "error" }))
      .finally(() => setLoadingEligibility(false));
  }, [productId, session?.user]);

  const isProductReview = !!productId;
  const canReview = isProductReview ? eligibility?.eligible : true;
  const alreadyReviewed = isProductReview ? eligibility?.alreadyReviewed : false;

  const handleSubmit = async () => {
    if (!session?.user) { setError("Sign in to leave a review"); return; }
    if (rating === 0) { setError("Please select a rating"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, serviceId, rating, title: title.trim() || undefined, comment: comment.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitted(true);
      if (isProductReview) setEligibility((prev) => prev ? { ...prev, alreadyReviewed: true } : prev);
      onSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally { setSaving(false); }
  };

  if (!session?.user) {
    return (
      <div className="bg-cream/50 border border-border rounded-xl p-4 text-center">
        <p className="text-sm text-muted-foreground">Sign in to leave a review</p>
      </div>
    );
  }

  if (isProductReview && loadingEligibility) {
    return (
      <div className="bg-cream/50 border border-border rounded-xl p-4 text-center flex items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 text-gold animate-spin" />
        <span className="text-sm text-muted-foreground">Checking eligibility...</span>
      </div>
    );
  }

  if (alreadyReviewed && !open) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <Check className="h-4 w-4 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-700">You&apos;ve already reviewed this product</p>
        </div>
      </div>
    );
  }

  if (isProductReview && !canReview && !open) {
    return (
      <div className="bg-cream/50 border border-border rounded-xl p-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Purchase and receive this product to leave a review</p>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="outline" className="rounded-full text-xs font-semibold tracking-wider uppercase gap-2">
        <PenLine className="h-3.5 w-3.5" />Write a Review
      </Button>
    );
  }

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
        <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
        <p className="text-sm font-medium text-emerald-700">Review submitted!</p>
        <p className="text-xs text-emerald-600 mt-1">It will appear after admin approval.</p>
        <button onClick={() => { setOpen(false); setSubmitted(false); setRating(0); setTitle(""); setComment(""); }} className="text-xs text-emerald-600 underline mt-3">Close</button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-charcoal">Review {itemName}</h3>
        <button onClick={() => setOpen(false)} className="text-xs text-muted-foreground hover:text-charcoal">Cancel</button>
      </div>

      <div>
        <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-2">Rating *</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              type="button"
              onMouseEnter={() => setHovered(v)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(v)}
              className="p-0.5"
            >
              <Star className={cn("h-7 w-7 transition-colors", v <= (hovered || rating) ? "fill-gold text-gold" : "text-gray-200")} />
            </button>
          ))}
          {rating > 0 && <span className="text-sm text-muted-foreground ml-2 self-center">{rating}/5</span>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" placeholder="Sum up your experience" />
      </div>

      <div>
        <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">Review</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold resize-none" placeholder="Tell others about your experience..." />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button onClick={handleSubmit} disabled={saving} className="bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold tracking-wider uppercase px-8">
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Submit Review
      </Button>
    </div>
  );
}
