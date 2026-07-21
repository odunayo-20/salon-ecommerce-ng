"use client";

import { Star, Gift } from "lucide-react";

const pointsHistory = [
  { id: "1", description: "Knotless Braids Service", points: 250, date: "2024-01-28", type: "earned" },
  { id: "2", description: "Product Purchase — Brazilian Hair", points: 450, date: "2024-01-28", type: "earned" },
  { id: "3", description: "Referral Bonus", points: 500, date: "2024-01-20", type: "earned" },
  { id: "4", description: "Redeemed — Free Treatment", points: -1000, date: "2024-01-15", type: "redeemed" },
];

export default function LoyaltyPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-border rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center"><Star className="h-7 w-7 text-gold" /></div>
          <div><p className="text-xs text-muted-foreground uppercase tracking-wider">Your Balance</p><p className="text-3xl font-heading font-bold text-charcoal">2,450 Points</p></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {([["Bronze", "0", false], ["Silver", "5,000", false], ["Gold", "15,000", true]] as [string, string, boolean][]).map(([tier, req, active]) => (
            <div key={tier} className={`rounded-lg p-4 text-center border-2 transition-all ${active ? "border-gold bg-gold/5" : "border-border bg-cream"}`}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{tier}</p>
              <p className="text-sm font-medium text-charcoal mt-1">{req} pts</p>
              {active && <p className="text-[10px] text-gold font-bold mt-1">Current Tier</p>}
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white border border-border rounded-xl p-6">
        <h2 className="font-heading font-semibold text-charcoal mb-4">Points History</h2>
        <div className="space-y-3">
          {pointsHistory.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${p.type === "earned" ? "bg-gold/10" : "bg-red-50"}`}>
                  {p.type === "earned" ? <Star className="h-4 w-4 text-gold" /> : <Gift className="h-4 w-4 text-red-500" />}
                </div>
                <div><p className="text-sm font-medium text-charcoal">{p.description}</p><p className="text-xs text-muted-foreground">{p.date}</p></div>
              </div>
              <span className={`text-sm font-semibold ${p.points > 0 ? "text-gold" : "text-red-500"}`}>{p.points > 0 ? "+" : ""}{p.points}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
