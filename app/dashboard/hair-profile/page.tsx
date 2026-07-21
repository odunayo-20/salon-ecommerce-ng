"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HairProfilePage() {
  const [profile, setProfile] = useState({ hairType: "KINKY_COILY", hairLength: "Shoulder Length", density: "Medium", scalpCondition: "Normal", allergies: "", notes: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/hair-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error("Failed to save profile");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <h2 className="font-heading font-semibold text-charcoal mb-6">Hair Profile</h2>
      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Hair Type</label>
            <select value={profile.hairType} onChange={(e) => setProfile({ ...profile, hairType: e.target.value })} className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold">
              {["STRAIGHT", "WAVY", "CURLY", "COILY", "KINKY", "KINKY_COILY"].map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Hair Length</label>
            <select value={profile.hairLength} onChange={(e) => setProfile({ ...profile, hairLength: e.target.value })} className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold">
              {["Short", "Chin Length", "Shoulder Length", "Mid Back", "Waist Length"].map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Hair Density</label>
            <select value={profile.density} onChange={(e) => setProfile({ ...profile, density: e.target.value })} className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold">
              {["Fine", "Medium", "Thick", "Very Thick"].map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Scalp Condition</label>
            <select value={profile.scalpCondition} onChange={(e) => setProfile({ ...profile, scalpCondition: e.target.value })} className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold">
              {["Dry", "Oily", "Normal", "Combination", "Sensitive"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div><label className="block text-sm font-medium text-charcoal mb-1.5">Allergies</label><input type="text" value={profile.allergies} onChange={(e) => setProfile({ ...profile, allergies: e.target.value })} placeholder="Any known allergies..." className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold" /></div>
        <div><label className="block text-sm font-medium text-charcoal mb-1.5">Notes</label><textarea value={profile.notes} onChange={(e) => setProfile({ ...profile, notes: e.target.value })} placeholder="Additional notes about your hair..." className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold resize-none h-24" /></div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {saveSuccess && <p className="text-green-600 text-sm">Hair profile saved successfully!</p>}
        <Button onClick={handleSave} disabled={isSaving} className="bg-charcoal text-white hover:bg-charcoal-light rounded-full px-8 py-2.5 text-xs font-semibold tracking-wider uppercase">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {isSaving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}
