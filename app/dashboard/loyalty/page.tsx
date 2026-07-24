"use client";

import { Star, Gift, TrendingUp, Award, Loader2 } from "lucide-react";
import { useLoyalty } from "@/hooks/queries";
import { cn } from "@/lib/utils";

const tierConfig: Record<string, { color: string; bg: string; next: string; threshold: number }> = {
  BRONZE: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200", next: "Silver", threshold: 5000 },
  SILVER: { color: "text-gray-500", bg: "bg-gray-50 border-gray-300", next: "Gold", threshold: 15000 },
  GOLD: { color: "text-gold", bg: "bg-gold/5 border-gold", next: "Platinum", threshold: 50000 },
  PLATINUM: { color: "text-purple-600", bg: "bg-purple-50 border-purple-300", next: "", threshold: 0 },
};

function LoyaltySkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-border rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-cream animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 w-24 bg-cream rounded animate-pulse" />
            <div className="h-8 w-36 bg-cream rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-cream rounded-lg animate-pulse" />)}
        </div>
      </div>
      <div className="bg-white border border-border rounded-xl p-6">
        <div className="h-5 w-32 bg-cream rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-cream rounded-lg animate-pulse" />)}
        </div>
      </div>
    </div>
  );
}

export default function LoyaltyPage() {
  const { data, isLoading } = useLoyalty();

  if (isLoading) return <LoyaltySkeleton />;
  if (!data) return null;

  const config = tierConfig[data.tier] || tierConfig.BRONZE;
  const nextThreshold = data.nextTier?.pointsRequired || 0;
  const progress = nextThreshold > 0 ? Math.min((data.totalEarned / nextThreshold) * 100, 100) : 100;

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="bg-white border border-border rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center">
            <Star className="h-7 w-7 text-gold" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Available Points</p>
            <p className="text-3xl font-heading font-bold text-charcoal">{data.balance.toLocaleString()}</p>
          </div>
        </div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
          {(["BRONZE", "SILVER", "GOLD", "PLATINUM"] as const).map((tier) => {
            const tc = tierConfig[tier];
            const isActive = data.tier === tier;
            return (
              <div key={tier} className={cn("rounded-lg p-4 text-center border-2 transition-all", isActive ? tc.bg : "border-border bg-cream")}>
                <Award className={cn("h-5 w-5 mx-auto mb-1", isActive ? tc.color : "text-muted-foreground")} />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{tier}</p>
                <p className="text-sm font-medium text-charcoal mt-0.5">{tc.threshold.toLocaleString()} pts</p>
                {isActive && <p className={cn("text-[10px] font-bold mt-1", tc.color)}>Current Tier</p>}
              </div>
            );
          })}
        </div>

        {/* Progress to next tier */}
        {data.nextTier && (
          <div className="bg-cream rounded-lg p-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">{data.totalEarned.toLocaleString()} / {nextThreshold.toLocaleString()} pts</span>
              <span className="text-gold font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {(nextThreshold - data.totalEarned).toLocaleString()} points until {data.nextTier.tier}
            </p>
          </div>
        )}

        {/* Earning Rules */}
        <div className="mt-6 p-4 bg-gold/5 border border-gold/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-gold" />
            <h3 className="text-sm font-semibold text-charcoal">How to Earn</h3>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>Earn <span className="font-semibold text-charcoal">1 point</span> for every ₦100 spent on orders</li>
            <li>Earn <span className="font-semibold text-charcoal">1 point</span> for every ₦100 spent on appointments</li>
            <li>Redeem points at checkout — <span className="font-semibold text-charcoal">1 point = ₦1 off</span></li>
            <li>Maximum redemption: 50% of order subtotal</li>
          </ul>
        </div>
      </div>

      {/* Points History */}
      <div className="bg-white border border-border rounded-xl p-6">
        <h2 className="font-heading font-semibold text-charcoal mb-4">Points History</h2>
        {data.history.length === 0 ? (
          <div className="text-center py-8">
            <Star className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No points history yet. Start earning by placing an order!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.history.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", p.type === "earned" ? "bg-gold/10" : "bg-red-50")}>
                    {p.type === "earned" ? <Star className="h-4 w-4 text-gold" /> : <Gift className="h-4 w-4 text-red-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-charcoal">{p.note || p.reference || "Points"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                      {p.expiresAt && <span className="ml-2 text-amber-600">Expires {new Date(p.expiresAt).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}</span>}
                    </p>
                  </div>
                </div>
                <span className={cn("text-sm font-semibold", p.points > 0 ? "text-gold" : "text-red-500")}>
                  {p.points > 0 ? "+" : ""}{p.points.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
