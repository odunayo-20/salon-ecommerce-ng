"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Check, X, User } from "lucide-react";

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState("");
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setPhone((session.user as Record<string, unknown>).phone as string || "");
      setImage((session.user as Record<string, unknown>).image as string || "");
    }
    setMounted(true);
  }, [session]);

  useEffect(() => {
    if (successMsg) { const t = setTimeout(() => setSuccessMsg(""), 3000); return () => clearTimeout(t); }
  }, [successMsg]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErrorMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "salon/avatars");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setImage(data.url);
    } catch { setErrorMsg("Image upload failed"); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const handleSave = async () => {
    if (!name.trim()) return setErrorMsg("Name is required");
    setSaving(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() || null, image: image || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }
      await updateSession();
      setSuccessMsg("Profile updated successfully");
    } catch (err) { setErrorMsg(err instanceof Error ? err.message : "Something went wrong"); }
    finally { setSaving(false); }
  };

  if (!mounted) return (
    <div className="space-y-6">
      <div className="bg-white border border-border rounded-xl p-6"><div className="space-y-4"><div className="h-24 w-24 rounded-full bg-cream animate-pulse mx-auto" /><div className="h-4 w-48 bg-cream rounded animate-pulse mx-auto" /></div></div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal tracking-tight">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account details</p>
      </div>

      {successMsg && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between"><span className="flex items-center gap-2"><Check className="h-4 w-4" />{successMsg}</span><button onClick={() => setSuccessMsg("")}><X className="h-4 w-4" /></button></div>}
      {errorMsg && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between"><span>{errorMsg}</span><button onClick={() => setErrorMsg("")}><X className="h-4 w-4" /></button></div>}

      <div className="bg-white border border-border rounded-xl p-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <button type="button" onClick={() => fileRef.current?.click()} className="relative h-24 w-24 rounded-full bg-cream border-2 border-dashed border-border hover:border-gold transition-colors flex items-center justify-center overflow-hidden group">
            {image ? (
              <img src={image} alt="" className="h-full w-full object-cover" />
            ) : (
              <User className="h-10 w-10 text-muted-foreground group-hover:text-gold transition-colors" />
            )}
            {uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full"><Loader2 className="h-6 w-6 text-white animate-spin" /></div>}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-full flex items-center justify-center">
              <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
          <div className="text-center">
            <button type="button" onClick={() => fileRef.current?.click()} className="text-sm text-gold hover:text-gold-dark font-medium min-h-[44px] min-w-[44px]">{uploading ? "Uploading..." : "Change photo"}</button>
            {image && <button type="button" onClick={() => setImage("")} className="block text-sm text-red-500 hover:text-red-600 font-medium min-h-[44px] min-w-[44px]">Remove photo</button>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="mt-1.5 w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold min-h-[44px]" />
          </div>
          <div>
            <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Email</label>
            <input type="email" value={session?.user?.email || ""} disabled className="mt-1.5 w-full bg-cream/50 border border-border rounded-lg px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed min-h-[44px]" />
            <p className="text-[10px] text-muted-foreground mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234..." className="mt-1.5 w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold min-h-[44px]" />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold tracking-wider uppercase px-8 min-h-[44px]">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
