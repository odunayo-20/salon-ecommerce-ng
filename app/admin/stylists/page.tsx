"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, X, Loader2, UserCog, Search, Mail, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminStylists, useUpsertStylist, useDeleteStylist, useAdminServices } from "@/hooks/queries";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const allSpecialties = [
  "Braids", "Knotless Braids", "Box Braids", "Cornrows", "Feed-in Braids",
  "Silk Press", "Natural Hair", "Deep Conditioning",
  "Wig Installation", "Wig Maintenance", "Weave", "Lace Frontal",
  "Locs", "Loc Retwist", "Sisterlocks",
  "Color", "Highlights", "Balayage",
  "Acrylic", "Gel Nails", "Manicure", "Pedicure",
];

const emptyForm = {
  name: "", email: "", phone: "", bio: "", specialties: [] as string[], experience: 0, serviceIds: [] as string[],
};

export default function AdminStylistsPage() {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<{ id: string; userId: string; bio: string | null; specialties: string[]; experience: number | null; isActive: boolean; user: { id: string; name: string | null; email: string | null; image: string | null; phone: string | null }; services: { id: string; service: { id: string; name: string; slug: string; price: number; duration: number } }[]; appointmentCount: number } | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [confirmState, setConfirmState] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({ open: false, title: "", message: "", onConfirm: () => {} });

  const { data: stylistsData, isLoading } = useAdminStylists({
    ...(filterStatus === "active" ? { isActive: "true" } : filterStatus === "inactive" ? { isActive: "false" } : {}),
    ...(search ? { search } : {}),
  });
  const stylists = stylistsData?.stylists || [];

  const { data: servicesData } = useAdminServices({ isActive: "true" });
  const allServices = servicesData?.services || [];

  const upsertStylist = useUpsertStylist();
  const deleteStylist = useDeleteStylist();

  useEffect(() => { if (successMsg) { const t = setTimeout(() => setSuccessMsg(""), 3000); return () => clearTimeout(t); } }, [successMsg]);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); setErrorMsg(""); };

  const openEdit = (s: typeof stylists[0]) => {
    setEditing(s);
    setForm({
      name: s.user.name || "",
      email: s.user.email || "",
      phone: s.user.phone || "",
      bio: s.bio || "",
      specialties: s.specialties,
      experience: s.experience || 0,
      serviceIds: s.services.map((ss) => ss.service.id),
    });
    setShowModal(true);
    setErrorMsg("");
  };

  const handleSave = async () => {
    if (!form.name.trim()) return setErrorMsg("Name is required");
    if (!form.email.trim()) return setErrorMsg("Email is required");

    setSaving(true);
    setErrorMsg("");
    try {
      await upsertStylist.mutateAsync({
        method: editing ? "PUT" : "POST",
        ...(editing ? { id: editing.id } : {}),
        ...form,
      });
      setSuccessMsg(editing ? "Stylist updated successfully" : "Stylist created successfully");
      setShowModal(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    } finally { setSaving(false); }
  };

  const handleDelete = async (s: typeof stylists[0]) => {
    if (s.appointmentCount > 0) { setErrorMsg(`Cannot delete "${s.user.name}" — has ${s.appointmentCount} appointments. Deactivate instead.`); return; }
    setConfirmState({
      open: true,
      title: "Delete stylist",
      message: `Delete "${s.user.name}"? This will also remove their user account and cannot be undone.`,
      onConfirm: async () => {
        setConfirmState((s) => ({ ...s, open: false }));
        try {
          await deleteStylist.mutateAsync(s.id);
          setSuccessMsg("Stylist deleted");
        } catch (err) { setErrorMsg(err instanceof Error ? err.message : "Failed to delete"); }
      },
    });
  };

  const toggleActive = async (s: typeof stylists[0]) => {
    try {
      await upsertStylist.mutateAsync({ method: "PUT", id: s.id, isActive: !s.isActive });
    } catch { setErrorMsg("Failed to toggle"); }
  };

  const toggleSpecialty = (spec: string) => {
    setForm((p) => ({
      ...p,
      specialties: p.specialties.includes(spec)
        ? p.specialties.filter((s) => s !== spec)
        : [...p.specialties, spec],
    }));
  };

  const toggleService = (serviceId: string) => {
    setForm((p) => ({
      ...p,
      serviceIds: p.serviceIds.includes(serviceId)
        ? p.serviceIds.filter((id) => id !== serviceId)
        : [...p.serviceIds, serviceId],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-charcoal tracking-tight">Stylists</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your salon team</p>
        </div>
        <Button onClick={openAdd} className="bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold tracking-wider uppercase px-6">
          <Plus className="h-4 w-4 mr-2" />Add Stylist
        </Button>
      </div>

      {successMsg && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between"><span>{successMsg}</span><button onClick={() => setSuccessMsg("")}><X className="h-4 w-4" /></button></div>}
      {errorMsg && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between"><span>{errorMsg}</span><button onClick={() => setErrorMsg("")}><X className="h-4 w-4" /></button></div>}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search stylists..." className="w-full bg-white border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" />
        </div>
        <div className="flex gap-1 bg-white border border-border rounded-lg p-1">
          {(["all", "active", "inactive"] as const).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize", filterStatus === s ? "bg-charcoal text-white" : "text-muted-foreground hover:text-charcoal")}>{s}</button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <Loader2 className="h-6 w-6 text-gold animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-3">Loading stylists...</p>
        </div>
      ) : stylists.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <UserCog className="h-10 w-10 text-border mx-auto mb-3" />
          <p className="text-muted-foreground">No stylists found</p>
          <Button onClick={openAdd} variant="outline" className="mt-4 rounded-full text-xs font-semibold tracking-wider uppercase"><Plus className="h-4 w-4 mr-2" />Add your first stylist</Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {stylists.map((s) => (
            <div key={s.id} className="bg-white border border-border rounded-xl p-5 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-full bg-cream flex items-center justify-center shrink-0 overflow-hidden">
                  {s.user.image ? <img src={s.user.image} alt={s.user.name || ""} className="h-full w-full object-cover" /> : <span className="font-heading text-lg font-semibold text-gold">{(s.user.name || "?").charAt(0)}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-heading font-semibold text-charcoal">{s.user.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        {s.user.email && <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{s.user.email}</span>}
                      </div>
                    </div>
                    <button onClick={() => toggleActive(s)} className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0", s.isActive ? "bg-gold" : "bg-border")}>
                      <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform", s.isActive ? "translate-x-[18px]" : "translate-x-[3px]")} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {s.experience ? <span className="flex items-center gap-1"><Award className="h-3 w-3" />{s.experience} yrs exp</span> : null}
                    <span>{s.appointmentCount} appointments</span>
                    <span>{s.services.length} services</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {s.specialties.slice(0, 4).map((sp) => (
                      <span key={sp} className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded-full font-medium">{sp}</span>
                    ))}
                    {s.specialties.length > 4 && <span className="text-[10px] bg-cream px-2 py-0.5 rounded-full text-muted-foreground">+{s.specialties.length - 4}</span>}
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                    <Button variant="outline" onClick={() => openEdit(s)} className="flex-1 rounded-full text-xs font-semibold tracking-wider uppercase h-8">
                      <Pencil className="h-3 w-3 mr-1" />Edit
                    </Button>
                    <Button variant="outline" onClick={() => handleDelete(s)} className="rounded-full text-xs h-8 px-3 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white z-10">
              <h2 className="font-heading text-lg font-semibold text-charcoal">{editing ? "Edit Stylist" : "Add Stylist"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-muted-foreground hover:text-charcoal hover:bg-cream"><X className="h-5 w-5" /></button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Full Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Amara Johnson" className="mt-1.5 w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="stylist@email.com" className="mt-1.5 w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" />
                </div>
              </div>

              {/* Phone + Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+234..." className="mt-1.5 w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Experience (years)</label>
                  <input type="number" value={form.experience || ""} onChange={(e) => setForm((p) => ({ ...p, experience: Number(e.target.value) }))} min={0} className="mt-1.5 w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold" />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Bio</label>
                <textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} placeholder="Tell clients about this stylist..." rows={3} className="mt-1.5 w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold resize-none" />
              </div>

              {/* Specialties */}
              <div>
                <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Specialties</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {allSpecialties.map((spec) => (
                    <button key={spec} type="button" onClick={() => toggleSpecialty(spec)} className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      form.specialties.includes(spec) ? "bg-gold text-white border-gold" : "bg-white text-charcoal border-border hover:border-gold/50"
                    )}>{spec}</button>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div>
                <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Assigned Services</label>
                <p className="text-[10px] text-muted-foreground mt-0.5">Which services can this stylist perform?</p>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto">
                  {allServices.map((svc) => (
                    <button key={svc.id} type="button" onClick={() => toggleService(svc.id)} className={cn(
                      "flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all",
                      form.serviceIds.includes(svc.id) ? "border-gold bg-gold/5" : "border-border hover:border-gold/30"
                    )}>
                      <div className={cn("h-4 w-4 rounded border-2 flex items-center justify-center shrink-0", form.serviceIds.includes(svc.id) ? "border-gold bg-gold" : "border-border")}>
                        {form.serviceIds.includes(svc.id) && <span className="text-white text-[10px]">✓</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-charcoal truncate">{svc.name}</p>
                        <p className="text-[10px] text-muted-foreground">₦{svc.price.toLocaleString()} · {svc.duration}min</p>
                      </div>
                    </button>
                  ))}
                </div>
                {allServices.length === 0 && <p className="text-xs text-muted-foreground mt-2">No services available. Create services first.</p>}
              </div>

              {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border sticky bottom-0 bg-white">
              <Button variant="outline" onClick={() => setShowModal(false)} className="rounded-full text-xs font-semibold tracking-wider uppercase">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold tracking-wider uppercase px-6">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editing ? "Update" : "Create"}
              </Button>
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
