"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar, Package, Heart, Star, User, Settings, LogOut, ChevronRight, Scissors,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { label: "My Appointments", href: "/dashboard", icon: Calendar },
  { label: "Orders", href: "/dashboard/orders", icon: Package },
  { label: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
  { label: "Hair Profile", href: "/dashboard/hair-profile", icon: Scissors },
  { label: "Loyalty Points", href: "/dashboard/loyalty", icon: Star },
  { label: "Account Settings", href: "/dashboard/settings", icon: Settings },
];

const mockAppointments = [
  { id: "1", service: "Knotless Braids", stylist: "Amara J.", date: "2024-02-15", time: "10:00 AM", status: "confirmed", amount: 25000 },
  { id: "2", service: "Silk Press", stylist: "Chioma O.", date: "2024-01-20", time: "2:00 PM", status: "completed", amount: 12000 },
];

const statusColors: Record<string, string> = { confirmed: "bg-emerald-50 text-emerald-700", pending: "bg-amber-50 text-amber-700", completed: "bg-gray-50 text-gray-600" };

export default function DashboardPage() {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-charcoal py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="font-heading text-3xl font-bold text-white tracking-tight">My Dashboard</h1>
          <p className="text-white/60 mt-1 text-sm">Welcome back, Beautiful</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <nav className="bg-white border border-border rounded-xl overflow-hidden">
              {sidebarLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link key={link.href} href={link.href} className={cn("flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors border-b border-border/50 last:border-0", isActive ? "bg-gold/5 text-gold border-l-2 border-l-gold" : "text-charcoal hover:bg-cream")}>
                    <link.icon className="h-4 w-4" />{link.label}<ChevronRight className="h-3 w-3 ml-auto" />
                  </Link>
                );
              })}
              <button className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors border-t border-border">
                <LogOut className="h-4 w-4" />Sign Out
              </button>
            </nav>
            <div className="bg-white border border-border rounded-xl p-5 mt-4">
              <h3 className="font-heading font-semibold text-charcoal text-sm mb-4">Your Stats</h3>
              <div className="space-y-3">
                {[["Loyalty Points", "2,450", "text-gold"], ["Total Visits", "12", "text-charcoal"], ["Member Since", "Jan 2024", "text-charcoal"]].map(([l, v, c]) => (
                  <div key={l} className="flex justify-between text-sm"><span className="text-muted-foreground">{l}</span><span className={cn("font-semibold", c)}>{v}</span></div>
                ))}
              </div>
            </div>
          </aside>
          <main className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-border rounded-xl p-6">
              <h2 className="font-heading font-semibold text-charcoal mb-4">Upcoming Appointment</h2>
              {mockAppointments.filter((a) => a.status === "confirmed").map((apt) => (
                <div key={apt.id} className="flex items-center gap-4 p-4 bg-gold/5 border border-gold/20 rounded-xl">
                  <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0"><Calendar className="h-5 w-5 text-gold" /></div>
                  <div className="flex-1"><h3 className="text-sm font-semibold text-charcoal">{apt.service}</h3><p className="text-xs text-muted-foreground">with {apt.stylist} · {apt.date} at {apt.time}</p></div>
                  <div className="text-right"><span className="text-sm font-semibold text-charcoal">₦{apt.amount.toLocaleString()}</span><div className="flex gap-2 mt-2"><Button size="sm" variant="outline" className="rounded-full text-[10px] h-7">Reschedule</Button><Button size="sm" variant="ghost" className="rounded-full text-[10px] h-7 text-destructive">Cancel</Button></div></div>
                </div>
              ))}
            </div>
            <div className="bg-white border border-border rounded-xl p-6">
              <h2 className="font-heading font-semibold text-charcoal mb-4">Appointment History</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border">{["Service", "Date", "Stylist", "Status", "Amount"].map((h) => <th key={h} className="text-left py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr></thead>
                  <tbody>
                    {mockAppointments.map((apt) => (
                      <tr key={apt.id} className="border-b border-border/50 last:border-0">
                        <td className="py-3 font-medium text-charcoal">{apt.service}</td><td className="py-3 text-muted-foreground">{apt.date}</td><td className="py-3 text-muted-foreground">{apt.stylist}</td>
                        <td className="py-3"><span className={cn("inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider", statusColors[apt.status])}>{apt.status}</span></td>
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
                  <div key={l} className="bg-cream rounded-lg p-3"><span className="text-xs text-muted-foreground">{l}</span><p className="text-sm font-medium text-charcoal mt-0.5">{v}</p></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
