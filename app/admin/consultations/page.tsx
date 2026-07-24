"use client";

import { useState } from "react";
import { useConsultations, useUpdateConsultation, type AdminConsultation } from "@/hooks/queries";
import { Search, Loader2, MessageSquare, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  reviewed: "bg-blue-50 text-blue-700",
  responded: "bg-emerald-50 text-emerald-700",
  closed: "bg-gray-50 text-gray-600",
};

const statusLabels: Record<string, string> = {
  pending: "Pending", reviewed: "Reviewed", responded: "Responded", closed: "Closed",
};

export default function AdminConsultationsPage() {
  const { data, isLoading } = useConsultations();
  const updateConsultation = useUpdateConsultation();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<AdminConsultation | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const consultations = (data?.consultations || []).filter((c) => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) ||
        c.hairConcerns.toLowerCase().includes(q) || c.customerProfile?.user.name?.toLowerCase().includes(q) ||
        c.customerProfile?.user.email?.toLowerCase().includes(q)) ?? false;
    }
    return true;
  });

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });

  const handleStatusChange = (id: string, status: string) => {
    updateConsultation.mutate({ id, status }, {
      onSuccess: () => {
        setSuccessMsg(`Consultation ${status}`);
        setTimeout(() => setSuccessMsg(""), 3000);
        if (selected?.id === id) setShowDetail(false);
      },
    });
  };

  const getContactName = (c: AdminConsultation) => c.name || c.customerProfile?.user.name || "—";
  const getContactEmail = (c: AdminConsultation) => c.email || c.customerProfile?.user.email || "—";
  const getContactPhone = (c: AdminConsultation) => c.phone || c.customerProfile?.user.phone || "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal tracking-tight">Consultations</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage customer consultation requests</p>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, or concern..." className="w-full bg-white border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-white border border-border rounded-lg px-3 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="responded">Responded</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {isLoading ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center"><Loader2 className="h-6 w-6 text-gold animate-spin mx-auto" /></div>
      ) : consultations.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center">
          <MessageSquare className="h-10 w-10 text-border mx-auto mb-3" />
          <p className="text-muted-foreground">No consultations found</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {consultations.map((c) => (
              <div key={c.id} className="bg-white border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-heading font-medium text-charcoal">{getContactName(c)}</p>
                  <span className={cn("text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full", statusColors[c.status] || "bg-gray-50 text-gray-600")}>{statusLabels[c.status] || c.status}</span>
                </div>
                {getContactEmail(c) !== "—" && <p className="text-xs text-muted-foreground mb-0.5">{getContactEmail(c)}</p>}
                {getContactPhone(c) !== "—" && <p className="text-xs text-muted-foreground mb-2">{getContactPhone(c)}</p>}
                <p className="text-sm text-charcoal line-clamp-2 mb-3">{c.hairConcerns}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{formatDate(c.createdAt)}</span>
                  <button onClick={() => { setSelected(c); setShowDetail(true); }} className="text-xs text-gold font-semibold min-h-[44px] min-w-[44px] inline-flex items-center justify-center"><Eye className="h-3.5 w-3.5 mr-1" />View</button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block bg-white border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-cream/30">
                    <th className="px-6 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Concern</th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Hair Type</th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {consultations.map((c) => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-cream/20 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-charcoal">{getContactName(c)}</p>
                        <p className="text-[10px] text-muted-foreground">{getContactEmail(c)}</p>
                      </td>
                      <td className="px-6 py-4"><p className="text-sm text-charcoal max-w-[200px] truncate">{c.hairConcerns}</p></td>
                      <td className="px-6 py-4"><span className="text-[10px] bg-cream px-2 py-1 rounded-full text-muted-foreground font-medium">{c.hairType?.replace("_", " ") || "—"}</span></td>
                      <td className="px-6 py-4"><span className="text-sm text-muted-foreground">{formatDate(c.createdAt)}</span></td>
                      <td className="px-6 py-4"><span className={cn("text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full", statusColors[c.status] || "bg-gray-50 text-gray-600")}>{statusLabels[c.status] || c.status}</span></td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => { setSelected(c); setShowDetail(true); }} className="p-2.5 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors"><Eye className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 border-t border-border bg-cream/30">
              <p className="text-xs text-muted-foreground">{consultations.length} consultations</p>
            </div>
          </div>
        </>
      )}

      {/* Detail Modal */}
      {showDetail && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowDetail(false)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-lg font-bold text-charcoal">Consultation Details</h2>
              <button onClick={() => setShowDetail(false)} className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-cream"><X className="h-4 w-4" /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Name</p><p className="text-sm font-medium text-charcoal">{getContactName(selected)}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Email</p><p className="text-sm font-medium text-charcoal">{getContactEmail(selected)}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Phone</p><p className="text-sm font-medium text-charcoal">{getContactPhone(selected)}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Hair Type</p><p className="text-sm font-medium text-charcoal">{selected.hairType?.replace("_", " ") || "—"}</p></div>
              </div>

              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Hair Concerns</p>
                <p className="text-sm text-charcoal">{selected.hairConcerns}</p>
              </div>
              {selected.desiredHairstyle && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Desired Hairstyle</p>
                  <p className="text-sm text-charcoal">{selected.desiredHairstyle}</p>
                </div>
              )}
              {selected.additionalNotes && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Additional Notes</p>
                  <p className="text-sm text-charcoal">{selected.additionalNotes}</p>
                </div>
              )}
              {selected.adminNotes && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Admin Notes</p>
                  <p className="text-sm text-charcoal">{selected.adminNotes}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {selected.status !== "responded" && (
                  <Button onClick={() => handleStatusChange(selected.id, "responded")} className="bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold tracking-wider uppercase px-4 min-h-[44px]">Mark Responded</Button>
                )}
                {selected.status !== "closed" && (
                  <Button onClick={() => handleStatusChange(selected.id, "closed")} variant="outline" className="rounded-full text-xs font-semibold tracking-wider uppercase px-4 min-h-[44px]">Close</Button>
                )}
                {selected.status === "closed" && (
                  <Button onClick={() => handleStatusChange(selected.id, "pending")} variant="outline" className="rounded-full text-xs font-semibold tracking-wider uppercase px-4 min-h-[44px]">Reopen</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
