"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, Users } from "lucide-react";

interface Customer { id: string; name: string | null; email: string | null; phone: string | null; orders: number; spent: number; appointments: number; joined: string; }

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCustomers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/customers?${params}`);
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-charcoal mb-6">Customers</h1>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full bg-white border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" />
      </div>
      {loading ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center"><Loader2 className="h-6 w-6 text-gold animate-spin mx-auto" /></div>
      ) : customers.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center"><Users className="h-10 w-10 text-border mx-auto mb-3" /><p className="text-muted-foreground">No customers found</p></div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-cream/50">{["Customer", "Email", "Phone", "Orders", "Appointments", "Total Spent", "Joined"].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-border/50 last:border-0 hover:bg-cream/30">
                  <td className="px-5 py-4 font-medium text-charcoal">{c.name || "—"}</td>
                  <td className="px-5 py-4 text-muted-foreground">{c.email}</td>
                  <td className="px-5 py-4 text-muted-foreground">{c.phone || "—"}</td>
                  <td className="px-5 py-4 text-charcoal">{c.orders}</td>
                  <td className="px-5 py-4 text-charcoal">{c.appointments}</td>
                  <td className="px-5 py-4 font-medium text-charcoal">₦{c.spent.toLocaleString()}</td>
                  <td className="px-5 py-4 text-muted-foreground">{formatDate(c.joined)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
