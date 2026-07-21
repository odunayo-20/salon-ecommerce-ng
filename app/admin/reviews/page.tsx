"use client";

const reviews = [
  { id: "1", customer: "Adaeze O.", service: "Knotless Braids", rating: 5, comment: "Absolutely amazing! The braids are so natural and the service was excellent.", date: "2024-01-28", approved: true },
  { id: "2", customer: "Folake M.", service: "Silk Press", rating: 5, comment: "Best silk press I've ever had. My hair was silky smooth for weeks.", date: "2024-01-25", approved: true },
  { id: "3", customer: "Ngozi A.", service: "Wig Installation", rating: 4, comment: "Great wig installation, very natural looking. Would recommend.", date: "2024-01-22", approved: false },
];

const stars = (n: number) => Array.from({ length: 5 }, (_, i) => i < n ? "★" : "☆").join("");

export default function AdminReviewsPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-charcoal mb-6">Reviews</h1>
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white border border-border rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-charcoal text-sm">{r.customer}</h3>
                  <span className="text-gold text-sm">{stars(r.rating)}</span>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${r.approved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {r.approved ? "Approved" : "Pending"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{r.service} · {r.date}</p>
                <p className="text-sm text-charcoal mt-3">{r.comment}</p>
              </div>
              <div className="flex gap-2">
                {!r.approved && <button className="text-xs text-gold hover:text-gold-dark font-medium">Approve</button>}
                <button className="text-xs text-destructive hover:text-red-600 font-medium">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
