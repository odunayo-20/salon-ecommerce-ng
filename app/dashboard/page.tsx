"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Calendar, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  reference: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  totalAmount: number;
  service: { name: string; duration: number };
  stylist: { user: { name: string | null } } | null;
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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const upcoming = appointments.filter((a) => ["PENDING", "CONFIRMED"].includes(a.status));
  const past = appointments.filter((a) => !["PENDING", "CONFIRMED"].includes(a.status));

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-NG", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="space-y-6">
      <div className="bg-white border border-border rounded-xl p-6">
        <h2 className="font-heading font-semibold text-charcoal mb-1">Welcome, {firstName}</h2>
        <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening with your appointments.</p>
      </div>

      {loading ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center">
          <Loader2 className="h-6 w-6 text-gold animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-3">Loading your appointments...</p>
        </div>
      ) : (
        <>
          {/* Upcoming */}
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-charcoal">Upcoming Appointments</h2>
              <Link href="/book" className="text-xs text-gold font-semibold">Book New</Link>
            </div>
            {upcoming.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 text-border mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                <Link href="/book"><Button className="mt-3 bg-charcoal text-white hover:bg-charcoal-light rounded-full text-xs font-semibold tracking-wider uppercase px-6">Book Now</Button></Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((apt) => (
                  <div key={apt.id} className="flex items-center gap-4 p-4 bg-gold/5 border border-gold/20 rounded-xl">
                    <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                      <Calendar className="h-5 w-5 text-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-charcoal">{apt.service.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {apt.stylist?.user.name ? `with ${apt.stylist.user.name} · ` : ""}
                        {formatDate(apt.date)} at {apt.startTime}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-semibold text-charcoal">₦{apt.totalAmount.toLocaleString()}</span>
                      <div className="mt-1">
                        <span className={cn("inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider", statusColors[apt.status])}>{statusLabels[apt.status]}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* History */}
          {past.length > 0 && (
            <div className="bg-white border border-border rounded-xl p-6">
              <h2 className="font-heading font-semibold text-charcoal mb-4">Appointment History</h2>
              <div className="overflow-x-auto">
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
                        <td className="py-3"><span className={cn("inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider", statusColors[apt.status])}>{statusLabels[apt.status]}</span></td>
                        <td className="py-3 text-right font-medium text-charcoal">₦{apt.totalAmount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
