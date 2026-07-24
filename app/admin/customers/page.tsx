"use client";

import { useState } from "react";
import { Search, Loader2, Users } from "lucide-react";
import { useAdminCustomers } from "@/hooks/queries";

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAdminCustomers(search);

  const customers = data?.customers || [];
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="px-4 sm:px-0">
      <h1 className="font-heading text-2xl font-bold text-charcoal mb-6">Customers</h1>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full bg-white border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" />
      </div>
      {isLoading ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center"><Loader2 className="h-6 w-6 text-gold animate-spin mx-auto" /></div>
      ) : customers.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center"><Users className="h-10 w-10 text-border mx-auto mb-3" /><p className="text-muted-foreground">No customers found</p></div>
      ) : (
        <>
          <div className="sm:hidden space-y-3 mb-6">
            {customers.map((c) => (
              <div key={c.id} className="bg-white border border-border rounded-xl p-4">
                <p className="font-heading font-medium text-charcoal text-base mb-1">{c.name || "—"}</p>
                {c.email && <p className="text-sm text-muted-foreground mb-0.5">{c.email}</p>}
                {c.phone && <p className="text-sm text-muted-foreground mb-2">{c.phone}</p>}
                {!c.email && !c.phone && <div className="mb-2" />}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>Orders: <span className="font-medium text-charcoal">{c.orders}</span></span>
                  <span>Spent: <span className="font-medium text-charcoal">₦{c.spent.toLocaleString()}</span></span>
                  <span>Joined: <span className="text-charcoal">{formatDate(c.joined)}</span></span>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white border border-border rounded-xl overflow-hidden hidden sm:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead><tr className="border-b border-border bg-cream/50">{["Customer", "Email", "Phone", "Orders", "Appointments", "Total Spent", "Joined"].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className="border-b border-border/50 last:border-0 hover:bg-cream/30">
                      <td className="px-5 py-4 font-medium text-charcoal whitespace-nowrap">{c.name || "—"}</td>
                      <td className="px-5 py-4 text-muted-foreground">{c.email}</td>
                      <td className="px-5 py-4 text-muted-foreground">{c.phone || "—"}</td>
                      <td className="px-5 py-4 text-charcoal">{c.orders}</td>
                      <td className="px-5 py-4 text-charcoal">{c.appointments}</td>
                      <td className="px-5 py-4 font-medium text-charcoal">₦{c.spent.toLocaleString()}</td>
                      <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">{formatDate(c.joined)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
