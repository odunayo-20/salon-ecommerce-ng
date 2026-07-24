"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Calendar, CreditCard, RefreshCw, Receipt, RotateCcw, Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDashboardBookings, useVerifyPayment, useInitiatePayment, useRescheduleBooking } from "@/hooks/queries";

interface Payment {
  id: string; amount: number; status: string; method: string;
}

interface Appointment {
  id: string;
  reference: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  totalAmount: number;
  depositPaid: number;
  isFullyPaid: boolean;
  remaining: number;
  hasPending: boolean;
  service: { name: string; duration: number };
  stylist: { id: string; user: { name: string | null } } | null;
  payments: Payment[];
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  IN_PROGRESS: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-gray-50 text-gray-600",
  CANCELLED: "bg-red-50 text-red-600",
  NO_SHOW: "bg-red-50 text-red-600",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "Beautiful";
  const [payingId, setPayingId] = useState<string | null>(null);
  const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [availableSlots, setAvailableSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const { data, isLoading: loading, refetch } = useDashboardBookings(30_000);
  const appointments = data?.appointments ?? [];

  const verifyPayment = useVerifyPayment();
  const initiatePayment = useInitiatePayment();
  const rescheduleBooking = useRescheduleBooking();

  useEffect(() => {
    if (!data?.appointments) return;
    for (const apt of data.appointments) {
      for (const p of apt.payments || []) {
        if (p.status === "PENDING") {
          verifyPayment.mutate(p.id);
        }
      }
    }
  }, [data?.appointments]);

  useEffect(() => {
    if (!rescheduleDate || !rescheduleApt) {
      setAvailableSlots([]);
      return;
    }
    setSlotsLoading(true);
    setRescheduleTime("");
    const stylistId = (rescheduleApt as Appointment & { stylist?: { id?: string } }).stylist?.id || "";
    const url = `/api/bookings/slots?date=${rescheduleDate}${stylistId ? `&stylistId=${stylistId}` : ""}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => setAvailableSlots(data.slots || []))
      .catch(() => setAvailableSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [rescheduleDate, rescheduleApt]);

  const handleReschedule = async () => {
    if (!rescheduleApt || !rescheduleDate || !rescheduleTime) return;
    await rescheduleBooking.mutateAsync({
      id: rescheduleApt.id,
      date: rescheduleDate,
      startTime: rescheduleTime,
      reason: rescheduleReason || undefined,
    });
    setRescheduleApt(null);
    setRescheduleDate("");
    setRescheduleTime("");
    setRescheduleReason("");
  };

  const openReschedule = (apt: Appointment) => {
    setRescheduleApt(apt);
    setRescheduleDate(apt.date.split("T")[0]);
    setRescheduleTime("");
    setRescheduleReason("");
  };

  const upcoming = appointments.filter((a) => ["PENDING", "CONFIRMED"].includes(a.status));
  const past = appointments.filter((a) => !["PENDING", "CONFIRMED"].includes(a.status));

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-NG", { weekday: "short", month: "short", day: "numeric" });

  const getPaidPaymentId = (apt: Appointment) => {
    const paid = apt.payments.find((p) => p.status === "PAID");
    return paid?.id || null;
  };

  const handlePayNow = async (apt: Appointment) => {
    setPayingId(apt.id);
    try {
      for (const p of apt.payments) {
        if (p.status === "PENDING") {
          await verifyPayment.mutateAsync(p.id);
        }
      }

      const { data: refreshed } = await refetch();
      const refreshedApt = (refreshed?.appointments ?? []).find((a) => a.id === apt.id);

      if (refreshedApt?.isFullyPaid) { setPayingId(null); return; }

      const res = await initiatePayment.mutateAsync({ appointmentId: apt.id }) as { checkoutUrl?: string };
      if (res?.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      }
    } catch { /* silent */ }
    finally { setPayingId(null); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-5 w-48 bg-cream rounded animate-pulse mb-2" />
              <div className="h-3.5 w-64 bg-cream rounded animate-pulse" />
            </div>
            <div className="h-9 w-24 bg-cream rounded-full animate-pulse" />
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 w-44 bg-cream rounded animate-pulse" />
            <div className="h-4 w-20 bg-cream rounded animate-pulse" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 border border-border/50 rounded-xl">
                <div className="h-12 w-12 rounded-full bg-cream animate-pulse shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="h-4 w-32 bg-cream rounded animate-pulse mb-2" />
                  <div className="h-3 w-48 bg-cream rounded animate-pulse mb-2" />
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-16 bg-cream rounded-full animate-pulse" />
                    <div className="h-5 w-20 bg-cream rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="h-4 w-16 bg-cream rounded animate-pulse mb-2 ml-auto" />
                  <div className="h-7 w-20 bg-cream rounded-full animate-pulse ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-6">
          <div className="h-5 w-40 bg-cream rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 border border-border/50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <div className="h-4 w-28 bg-cream rounded animate-pulse mb-2" />
                  <div className="h-3 w-36 bg-cream rounded animate-pulse mb-2" />
                  <div className="h-5 w-16 bg-cream rounded-full animate-pulse" />
                </div>
                <div className="h-4 w-16 bg-cream rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-border rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-semibold text-charcoal mb-1">Welcome, {firstName}</h2>
            <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening with your appointments.</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="rounded-full text-xs min-h-[44px] min-w-[44px]">
            <RefreshCw className="h-3 w-3 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-charcoal">Upcoming Appointments</h2>
          <Link href="/book" className="text-xs text-gold font-semibold min-h-[44px] min-w-[44px] inline-flex items-center justify-center">Book New</Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-8 w-8 text-border mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming appointments</p>
            <Link href="/book"><Button className="mt-3 bg-charcoal text-white hover:bg-charcoal-light rounded-full text-xs font-semibold tracking-wider uppercase px-6 min-h-[44px]">Book Now</Button></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((apt) => (
              <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gold/5 border border-gold/20 rounded-xl">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5 text-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-charcoal">{apt.service.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {apt.stylist?.user.name ? `with ${apt.stylist.user.name} · ` : ""}
                      {formatDate(apt.date)} at {apt.startTime}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider", statusColors[apt.status])}>{statusLabels[apt.status]}</span>
                      {apt.isFullyPaid ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700">Paid in Full</span>
                      ) : apt.hasPending ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-50 text-amber-700">Payment Due: ₦{apt.remaining.toLocaleString()}</span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-50 text-amber-700">Balance: ₦{apt.remaining.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end gap-2 shrink-0">
                  <span className="text-sm font-semibold text-charcoal">₦{apt.totalAmount.toLocaleString()}</span>
                  {!apt.isFullyPaid && apt.status !== "CANCELLED" && (
                    <Button onClick={() => handlePayNow(apt)} disabled={payingId === apt.id} size="sm" className="bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold tracking-wider uppercase px-4 min-h-[44px]">
                      {payingId === apt.id ? <span className="h-3 w-3 animate-spin mr-1 inline-block border-2 border-current border-t-transparent rounded-full" /> : <CreditCard className="h-3 w-3 mr-1" />}
                      Pay Now
                    </Button>
                  )}
                  {apt.status !== "CANCELLED" && apt.status !== "COMPLETED" && (
                    <Button onClick={() => openReschedule(apt)} size="sm" variant="outline" className="rounded-full text-xs font-semibold tracking-wider uppercase px-4 min-h-[44px] border-gold/30 text-gold hover:bg-gold/5">
                      <RotateCcw className="h-3 w-3 mr-1" /> Reschedule
                    </Button>
                  )}
                  {apt.isFullyPaid && getPaidPaymentId(apt) && (
                    <Link href={`/receipt/${getPaidPaymentId(apt)}`}>
                      <Button size="sm" variant="outline" className="rounded-full text-xs font-semibold tracking-wider uppercase px-4 min-h-[44px] border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                        <Receipt className="h-3 w-3 mr-1" /> Receipt
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div className="bg-white border border-border rounded-xl p-6">
          <h2 className="font-heading font-semibold text-charcoal mb-4">Appointment History</h2>
          <div className="md:hidden space-y-3">
            {past.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-4 border border-border/50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-charcoal truncate">{apt.service.name}</h3>
                  <p className="text-xs text-muted-foreground">{formatDate(apt.date)}</p>
                  <p className="text-xs text-muted-foreground">{apt.stylist?.user.name || "—"}</p>
                  <div className="mt-1">
                    <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider", statusColors[apt.status])}>{statusLabels[apt.status]}</span>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <span className="text-sm font-medium text-charcoal">₦{apt.totalAmount.toLocaleString()}</span>
                  <div className="mt-1">
                    {apt.isFullyPaid ? (
                      <Link href={`/receipt/${getPaidPaymentId(apt)}`} className="text-xs text-emerald-600 font-semibold hover:underline inline-flex items-center gap-1">
                        <Receipt className="h-3 w-3" /> Paid
                      </Link>
                    ) : apt.status === "CANCELLED" ? (
                      <span className="text-xs text-red-500 font-semibold">cancelled</span>
                    ) : (
                      <Button onClick={() => handlePayNow(apt)} disabled={payingId === apt.id} size="sm" className="bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold tracking-wider uppercase px-3 min-h-[44px]">
                        {payingId === apt.id ? <span className="h-3 w-3 animate-spin inline-block border-2 border-current border-t-transparent rounded-full" /> : `Pay ₦${apt.remaining.toLocaleString()}`}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Service", "Date", "Stylist", "Status", "Amount"].map((h) => (
                    <th key={h} className="text-left py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {past.map((apt) => (
                  <tr key={apt.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 font-medium text-charcoal">{apt.service.name}</td>
                    <td className="py-3 text-muted-foreground">{formatDate(apt.date)}</td>
                    <td className="py-3 text-muted-foreground">{apt.stylist?.user.name || "—"}</td>
                    <td className="py-3">
                      <span className={cn("inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider", statusColors[apt.status])}>{statusLabels[apt.status]}</span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-medium text-charcoal">₦{apt.totalAmount.toLocaleString()}</span>
                        {apt.isFullyPaid ? (
                          <Link href={`/receipt/${getPaidPaymentId(apt)}`} className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1">
                            <Receipt className="h-3 w-3" /> Paid in Full
                          </Link>
                        ) : apt.status === "CANCELLED" ? (
                          <span className="text-xs text-red-500 font-semibold">cancelled</span>
                        ) : (
                          <Button onClick={() => handlePayNow(apt)} disabled={payingId === apt.id} size="sm" className="bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold tracking-wider uppercase px-3 min-h-[44px]">
                            {payingId === apt.id ? <span className="h-3 w-3 animate-spin inline-block border-2 border-current border-t-transparent rounded-full" /> : `Pay ₦${apt.remaining.toLocaleString()}`}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reschedule Dialog */}
      {rescheduleApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setRescheduleApt(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold text-charcoal">Reschedule Appointment</h3>
              <button onClick={() => setRescheduleApt(null)} className="text-muted-foreground hover:text-charcoal"><X className="h-5 w-5" /></button>
            </div>
            <div className="bg-cream rounded-lg p-3 text-sm">
              <p className="font-medium text-charcoal">{rescheduleApt.service.name}</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Current: {formatDate(rescheduleApt.date)} at {rescheduleApt.startTime}
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-charcoal uppercase tracking-wider">New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="mt-1 w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold"
                />
              </div>
              {rescheduleDate && (
                <div>
                  <label className="text-xs font-medium text-charcoal uppercase tracking-wider">Available Times</label>
                  {slotsLoading ? (
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading times...
                    </div>
                  ) : availableSlots.filter((s) => s.available).length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">No available slots for this date.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {availableSlots.filter((s) => s.available).map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => setRescheduleTime(slot.time)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                            rescheduleTime === slot.time
                              ? "bg-gold text-white border-gold"
                              : "border-border text-charcoal hover:border-gold/50"
                          )}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-charcoal uppercase tracking-wider">Reason (optional)</label>
                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="Why are you rescheduling?"
                  className="mt-1 w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setRescheduleApt(null)} className="flex-1 rounded-full text-xs">Cancel</Button>
              <Button
                onClick={handleReschedule}
                disabled={!rescheduleDate || !rescheduleTime || rescheduleBooking.isPending}
                className="flex-1 bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold"
              >
                {rescheduleBooking.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RotateCcw className="h-3.5 w-3.5 mr-1" />}
                Confirm Reschedule
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
