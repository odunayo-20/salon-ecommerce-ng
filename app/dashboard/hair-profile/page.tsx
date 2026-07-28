"use client";

import { useState, useEffect } from "react";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHairProfile, useSaveHairProfile } from "@/hooks/queries";

const defaultProfile = {
  hairType: "KINKY_COILY",
  hairLength: "Shoulder Length",
  hairDensity: "Medium",
  scalpCondition: "Normal",
  allergies: "",
  notes: "",
};

export default function HairProfilePage() {
  const { data, isLoading } = useHairProfile();
  const saveMutation = useSaveHairProfile();
  const [profile, setProfile] = useState(defaultProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (data?.profile) {
      setProfile({
        hairType: data.profile.hairType || "KINKY_COILY",
        hairLength: data.profile.hairLength || "Shoulder Length",
        hairDensity: data.profile.hairDensity || "Medium",
        scalpCondition: data.profile.scalpCondition || "Normal",
        allergies: data.profile.allergies || "",
        notes: data.profile.notes || "",
      });
    }
  }, [data?.profile]);

  const handleSave = () => {
    setIsSaving(true);
    setError("");
    setSaveSuccess(false);
    saveMutation.mutate(profile as any, {
      onSuccess: () => {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        setIsSaving(false);
      },
      onError: () => {
        setError("Something went wrong. Please try again.");
        setIsSaving(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-border rounded-xl p-6">
        <div className="h-5 w-32 bg-cream rounded mb-6 animate-pulse" />
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-3.5 w-20 bg-cream rounded mb-2 animate-pulse" />
              <div className="h-10 w-full bg-cream rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
        <div className="mb-6">
          <div className="h-3.5 w-16 bg-cream rounded mb-2 animate-pulse" />
          <div className="h-10 w-full bg-cream rounded-lg animate-pulse" />
        </div>
        <div className="mb-6">
          <div className="h-3.5 w-16 bg-cream rounded mb-2 animate-pulse" />
          <div className="h-24 w-full bg-cream rounded-lg animate-pulse" />
        </div>
        <div className="h-9 w-32 bg-cream rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <h2 className="font-heading font-semibold text-charcoal mb-6">Hair Profile</h2>
      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Hair Type</label>
            <select value={profile.hairType} onChange={(e) => setProfile({ ...profile, hairType: e.target.value })} className="w-full bg-cream border border-border rounded-lg px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold min-h-[44px]">
              {["STRAIGHT", "WAVY", "CURLY", "COILY", "KINKY", "KINKY_COILY"].map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Hair Length</label>
            <select value={profile.hairLength} onChange={(e) => setProfile({ ...profile, hairLength: e.target.value })} className="w-full bg-cream border border-border rounded-lg px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold min-h-[44px]">
              {["Short", "Chin Length", "Shoulder Length", "Mid Back", "Waist Length"].map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Hair Density</label>
            <select value={profile.hairDensity} onChange={(e) => setProfile({ ...profile, hairDensity: e.target.value })} className="w-full bg-cream border border-border rounded-lg px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold min-h-[44px]">
              {["Fine", "Medium", "Thick", "Very Thick"].map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Scalp Condition</label>
            <select value={profile.scalpCondition} onChange={(e) => setProfile({ ...profile, scalpCondition: e.target.value })} className="w-full bg-cream border border-border rounded-lg px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold min-h-[44px]">
              {["Dry", "Oily", "Normal", "Combination", "Sensitive"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div><label className="block text-sm font-medium text-charcoal mb-1.5">Allergies</label><input type="text" value={profile.allergies} onChange={(e) => setProfile({ ...profile, allergies: e.target.value })} placeholder="Any known allergies..." className="w-full bg-cream border border-border rounded-lg px-4 py-3 text-sm text-charcoal placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold min-h-[44px]" /></div>
        <div><label className="block text-sm font-medium text-charcoal mb-1.5">Notes</label><textarea value={profile.notes} onChange={(e) => setProfile({ ...profile, notes: e.target.value })} placeholder="Additional notes about your hair..." className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold resize-none h-24" /></div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {saveSuccess && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <Check className="h-4 w-4" />
            <span>Hair profile saved successfully!</span>
          </div>
        )}
        <Button onClick={handleSave} disabled={isSaving} className="bg-charcoal text-white hover:bg-charcoal-light rounded-full px-8 py-2.5 text-xs font-semibold tracking-wider uppercase min-h-[44px]">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {isSaving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}
