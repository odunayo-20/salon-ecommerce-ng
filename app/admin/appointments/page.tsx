"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2, Calendar, Clock, User, Eye, XCircle, CheckCircle, RefreshCw, Trash2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminAppointments, useUpdateAdminAppointment, type AdminAppointment } from "@/hooks/queries";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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

export default function AdminAppointmentsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [selected, setSelected] = useState<AdminAppointment | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [sendingReceiptId, setSendingReceiptId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmState, setConfirmState] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({ open: false, title: "", message: "", onConfirm: () => {} });

  const { data, isLoading } = useAdminAppointments({ status: filterStatus, search, date: filterDate }, 60_000);
  const appointments = data?.appointments ?? [];
  const updateAppointment = useUpdateAdminAppointment();

  useEffect(() => { if (successMsg) { const t = setTimeout(() => setSuccessMsg(""), 3000); return () => clearTimeout(t); } }, [successMsg]);

  const updateStatus = (id: string, status: string, cancelReason?: string) => {
    setUpdatingId(id);
    updateAppointment.mutate(
      { id, status, cancelReason },
      {
        onSuccess: () => {
          setSuccessMsg(`Appointment ${status.toLowerCase()}`);
          if (selected?.id === id) { setShowDetail(false); setSelected(null); }
        },
        onError: (err) => { setErrorMsg(err instanceof Error ? err.message : "Failed to update"); },
        onSettled: () => { setUpdatingId(null); },
      }
    );
  };

  const handleDelete = async (id: string) => {
    setConfirmState({
      open: true,
      title: "Delete appointment",
      message: "This appointment will be permanently deleted. This cannot be undone.",
      onConfirm: async () => {
        setConfirmState((s) => ({ ...s, open: false }));
        try {
          const res = await fetch(`/api/admin/appointments/${id}`, { method: "DELETE" });
          if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
          setSuccessMsg("Appointment deleted");
          if (selected?.id === id) { setShowDetail(false); setSelected(null); }
        } catch (err) {
          setErrorMsg(err instanceof Error ? err.message : "Failed to delete");
        }
      },
    });
  };

  const handleSendReceipt = async (appointmentId: string, paymentId: string) => {
    setSendingReceiptId(paymentId);
    try {
      const res = await fetch(`/api/payments/${paymentId}/send-receipt`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Receipt sent to customer");
      } else {
        setErrorMsg(data.error || "Failed to send receipt");
      }
    } catch {
      setErrorMsg("Failed to send receipt");
    } finally {
      setSendingReceiptId(null);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-NG", { weekday: "short", year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-xl sm:text-2xl font-bold text-charcoal tracking-tight">Appointments</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage all customer bookings</p>
      </div>

      {successMsg && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between"><span>{successMsg}</span><button onClick={() => setSuccessMsg("")} className="min-h-[44px] min-w-[44px] flex items-center justify-center"><X className="h-4 w-4" /></button></div>}
      {errorMsg && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between"><span>{errorMsg}</span><button onClick={() => setErrorMsg("")} className="min-h-[44px] min-w-[44px] flex items-center justify-center"><X className="h-4 w-4" /></button></div>}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ref, customer, or service..." className="w-full bg-white border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold min-h-[44px]" />
      </div>

      {/* Date Filter */}
      <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold min-h-[44px]" />

      {/* Status Filter */}
      <div className="flex gap-1 bg-white border border-border rounded-lg p-1 overflow-x-auto">
        {["all", "pending", "confirmed", "in_progress", "completed", "cancelled"].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)} className={cn("px-3 py-2.5 min-h-[44px] rounded-md text-xs font-medium transition-all capitalize whitespace-nowrap shrink-0", filterStatus === s ? "bg-charcoal text-white" : "text-muted-foreground hover:text-charcoal")}>{s === "all" ? "All" : statusLabels[s] || s}</button>
        ))}
      </div>

      {isLoading ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <Loader2 className="h-6 w-6 text-gold animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-3">Loading appointments...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <Calendar className="h-10 w-10 text-border mx-auto mb-3" />
          <p className="text-muted-foreground">No appointments found</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="sm:hidden space-y-3">
            {appointments.map((a) => (
              <div key={a.id} className="bg-white border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-medium text-charcoal">{a.reference}</p>
                    <p className="text-sm font-medium text-charcoal truncate">{a.customerProfile.user.name}</p>
                  </div>
                  <span className={cn("inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider shrink-0", statusColors[a.status])}>
                    {statusLabels[a.status] || a.status}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-3 w-3 shrink-0" />
                    <span className="truncate">{a.service.name}</span>
                  </div>
                  <p className="text-muted-foreground text-xs pl-5">{a.stylist?.user.name || "No stylist"}</p>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span className="text-xs">{formatDate(a.date)} · {a.startTime} — {a.endTime}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <p className="text-sm font-medium text-charcoal">₦{a.totalAmount.toLocaleString()}</p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setSelected(a); setShowDetail(true); }} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-charcoal hover:bg-cream transition-colors" title="View details"><Eye className="h-4 w-4" /></button>
                    {a.status === "PENDING" && (
                      <button onClick={() => updateStatus(a.id, "CONFIRMED")} disabled={updatingId === a.id} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors" title="Confirm"><CheckCircle className="h-4 w-4" /></button>
                    )}
                    {["PENDING", "CONFIRMED"].includes(a.status) && (
                      <button onClick={() => updateStatus(a.id, "CANCELLED")} disabled={updatingId === a.id} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Cancel"><XCircle className="h-4 w-4" /></button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block bg-white border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-cream/50">
                    {["Ref", "Customer", "Service", "Stylist", "Date & Time", "Status", "Amount", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((a) => (
                    <tr key={a.id} className="border-b border-border/50 last:border-0 hover:bg-cream/30">
                      <td className="px-5 py-4 font-mono text-xs font-medium text-charcoal">{a.reference}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-cream flex items-center justify-center text-[10px] font-bold text-charcoal shrink-0">
                            {a.customerProfile.user.image ? <img src={a.customerProfile.user.image} alt="" className="h-full w-full rounded-full object-cover" /> : (a.customerProfile.user.name || "?").charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-charcoal truncate">{a.customerProfile.user.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{a.customerProfile.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-charcoal">{a.service.name}</td>
                      <td className="px-5 py-4 text-muted-foreground">{a.stylist?.user.name || "—"}</td>
                      <td className="px-5 py-4">
                        <p className="text-charcoal">{formatDate(a.date)}</p>
                        <p className="text-[10px] text-muted-foreground">{a.startTime} — {a.endTime}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn("inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider", statusColors[a.status])}>
                          {statusLabels[a.status] || a.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-medium text-charcoal">₦{a.totalAmount.toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setSelected(a); setShowDetail(true); }} className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-charcoal hover:bg-cream transition-colors" title="View details"><Eye className="h-4 w-4" /></button>
                          {a.status === "PENDING" && (
                            <button onClick={() => updateStatus(a.id, "CONFIRMED")} disabled={updatingId === a.id} className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors" title="Confirm"><CheckCircle className="h-4 w-4" /></button>
                          )}
                          {["PENDING", "CONFIRMED"].includes(a.status) && (
                            <button onClick={() => updateStatus(a.id, "CANCELLED")} disabled={updatingId === a.id} className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Cancel"><XCircle className="h-4 w-4" /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Detail Modal */}
      {showDetail && selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowDetail(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-heading text-lg font-semibold text-charcoal">Appointment Details</h2>
                <p className="text-xs text-muted-foreground font-mono">{selected.reference}</p>
              </div>
              <button onClick={() => setShowDetail(false)} className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-charcoal hover:bg-cream"><X className="h-5 w-5" /></button>
            </div>

            <div className="px-6 py-5 space-y-5">
              <div className="flex items-center gap-3">
                <span className={cn("inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider", statusColors[selected.status])}>{statusLabels[selected.status]}</span>
                {selected.isRescheduled && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">Rescheduled</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-cream rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Service</p>
                  <p className="text-sm font-medium text-charcoal mt-0.5">{selected.service.name}</p>
                  <p className="text-[10px] text-muted-foreground">{selected.service.duration} min</p>
                </div>
                <div className="bg-cream rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Stylist</p>
                  <p className="text-sm font-medium text-charcoal mt-0.5">{selected.stylist?.user.name || "No preference"}</p>
                </div>
                <div className="bg-cream rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Date & Time</p>
                  <p className="text-sm font-medium text-charcoal mt-0.5">{formatDate(selected.date)}</p>
                  <p className="text-[10px] text-muted-foreground">{selected.startTime} — {selected.endTime}</p>
                </div>
                <div className="bg-cream rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Payment</p>
                  <p className="text-sm font-medium text-charcoal mt-0.5">₦{selected.totalAmount.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">Paid: ₦{selected.payments?.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0).toLocaleString()}</p>
                </div>
              </div>

              {selected.payments && selected.payments.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-2">Payment History</p>
                  <div className="space-y-2">
                    {selected.payments.map((p) => (
                      <div key={p.id} className="flex items-center justify-between bg-cream rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className={cn("inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider", p.status === "PAID" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{p.status}</span>
                          <span className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <span className="text-sm font-medium text-charcoal">₦{p.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 px-1">
                    <span className="text-xs text-muted-foreground">Total paid</span>
                    <span className="text-xs font-semibold text-emerald-600">₦{selected.payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0).toLocaleString()} / ₦{selected.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-2">Customer</p>
                <div className="flex items-center gap-3 bg-cream rounded-lg p-3">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-xs font-bold text-charcoal shrink-0">
                    {selected.customerProfile.user.image ? <img src={selected.customerProfile.user.image} alt="" className="h-full w-full rounded-full object-cover" /> : (selected.customerProfile.user.name || "?").charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-charcoal">{selected.customerProfile.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{selected.customerProfile.user.email}</p>
                    {selected.customerProfile.user.phone && <p className="text-xs text-muted-foreground">{selected.customerProfile.user.phone}</p>}
                  </div>
                </div>
              </div>

              {selected.notes && (
                <div>
                  <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm text-muted-foreground bg-cream rounded-lg p-3">{selected.notes}</p>
                </div>
              )}

              {selected.cancelledAt && selected.cancelReason && (
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Cancellation Reason</p>
                  <p className="text-sm text-red-700">{selected.cancelReason}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {selected.status === "PENDING" && (
                  <Button onClick={() => updateStatus(selected.id, "CONFIRMED")} disabled={updatingId === selected.id} className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-full text-xs font-semibold tracking-wider uppercase min-h-[44px]">
                    <CheckCircle className="h-3 w-3 mr-1" />Confirm
                  </Button>
                )}
                {selected.status === "CONFIRMED" && (
                  <Button onClick={() => updateStatus(selected.id, "IN_PROGRESS")} disabled={updatingId === selected.id} className="bg-blue-600 text-white hover:bg-blue-700 rounded-full text-xs font-semibold tracking-wider uppercase min-h-[44px]">
                    <RefreshCw className="h-3 w-3 mr-1" />Start
                  </Button>
                )}
                {selected.status === "IN_PROGRESS" && (
                  <Button onClick={() => updateStatus(selected.id, "COMPLETED")} disabled={updatingId === selected.id} className="bg-charcoal text-white hover:bg-charcoal-light rounded-full text-xs font-semibold tracking-wider uppercase min-h-[44px]">
                    <CheckCircle className="h-3 w-3 mr-1" />Complete
                  </Button>
                )}
                {["PENDING", "CONFIRMED"].includes(selected.status) && (
                  <Button onClick={() => { const r = prompt("Cancel reason:"); if (r !== null) updateStatus(selected.id, "CANCELLED", r); }} disabled={updatingId === selected.id} variant="outline" className="rounded-full text-xs font-semibold tracking-wider uppercase text-red-500 border-red-200 hover:bg-red-50 min-h-[44px]">
                    <XCircle className="h-3 w-3 mr-1" />Cancel
                  </Button>
                )}
                {!selected.payments?.length && (
                  <Button onClick={() => handleDelete(selected.id)} variant="outline" className="rounded-full text-xs font-semibold tracking-wider uppercase text-red-500 border-red-200 hover:bg-red-50 ml-auto min-h-[44px]">
                    <Trash2 className="h-3 w-3 mr-1" />Delete
                  </Button>
                )}
                {selected.payments?.some((p) => p.status === "PAID") && (
                  <Button
                    onClick={() => {
                      const paidPayment = selected.payments!.find((p) => p.status === "PAID");
                      if (paidPayment) handleSendReceipt(selected.id, paidPayment.id);
                    }}
                    disabled={sendingReceiptId !== null}
                    variant="outline"
                    className="rounded-full text-xs font-semibold tracking-wider uppercase text-gold border-gold/30 hover:bg-gold/5 ml-auto min-h-[44px]"
                  >
                    {sendingReceiptId ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Mail className="h-3 w-3 mr-1" />}
                    Send Receipt
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={(open) => setConfirmState((s) => ({ ...s, open }))}
        title={confirmState.title}
        description={confirmState.message}
        onConfirm={confirmState.onConfirm}
      />
    </div>
  );
}
