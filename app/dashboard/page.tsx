"use client";

import { useSession } from "next-auth/react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mockAppointments = [
  { id: "1", service: "Knotless Braids", stylist: "Amara J.", date: "2024-02-15", time: "10:00 AM", status: "confirmed", amount: 25000 },
  { id: "2", service: "Silk Press", stylist: "Chioma O.", date: "2024-01-20", time: "2:00 PM", status: "completed", amount: 12000 },
];

const statusColors: Record<string, string> = { confirmed: "bg-emerald-50 text-emerald-700", pending: "bg-amber-50 text-amber-700", completed: "bg-gray-50 text-gray-600" };

export default function DashboardPage() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "Beautiful";

  return (
    <div className="space-y-6">
      <div className="bg-white border border-border rounded-xl p-6">
        <h2 className="font-heading font-semibold text-charcoal mb-1">Welcome, {firstName}</h2>
        <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening with your appointments and orders.</p>
      </div>

      <div className="bg-white border border-border rounded-xl p-6">
        <h2 className="font-heading font-semibold text-charcoal mb-4">Upcoming Appointment</h2>
        {mockAppointments.filter((a) => a.status === "confirmed").map((apt) => (
          <div key={apt.id} className="flex items-center gap-4 p-4 bg-gold/5 border border-gold/20 rounded-xl">
            <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5 text-gold" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-charcoal">{apt.service}</h3>
              <p className="text-xs text-muted-foreground">with {apt.stylist} · {apt.date} at {apt.time}</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-charcoal">₦{apt.amount.toLocaleString()}</span>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" className="rounded-full text-[10px] h-7">Reschedule</Button>
                <Button size="sm" variant="ghost" className="rounded-full text-[10px] h-7 text-destructive">Cancel</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

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
              {mockAppointments.map((apt) => (
                <tr key={apt.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 font-medium text-charcoal">{apt.service}</td>
                  <td className="py-3 text-muted-foreground">{apt.date}</td>
                  <td className="py-3 text-muted-foreground">{apt.stylist}</td>
                  <td className="py-3">
                    <span className={cn("inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider", statusColors[apt.status])}>{apt.status}</span>
                  </td>
                  <td className="py-3 text-right font-medium text-charcoal">₦{apt.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl p-6">
        <h2 className="font-heading font-semibold text-charcoal mb-4">Hair Profile</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[["Hair Type", "Kinky Coily"], ["Length", "Shoulder"], ["Preferred Stylist", "Amara J."], ["Last Service", "Silk Press"]].map(([l, v]) => (
            <div key={l} className="bg-cream rounded-lg p-3">
              <span className="text-xs text-muted-foreground">{l}</span>
              <p className="text-sm font-medium text-charcoal mt-0.5">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
