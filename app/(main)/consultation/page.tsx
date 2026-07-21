"use client";

import { useState } from "react";
import { Upload, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConsultationPage() {
  const [formData, setFormData] = useState({ hairConcerns: "", desiredHairstyle: "", hairType: "", additionalNotes: "" });
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="h-20 w-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6"><Send className="h-8 w-8 text-gold" /></div>
          <h1 className="font-heading text-3xl font-bold text-charcoal mb-3">Request Submitted</h1>
          <p className="text-muted-foreground leading-relaxed">Our hair experts will review your submission and get back to you within 24 hours with personalized recommendations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-charcoal py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">Virtual Hair Consultation</h1>
          <p className="text-white/60 mt-2">Tell us about your hair and we&apos;ll recommend the perfect service and products.</p>
        </div>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="bg-white border border-border rounded-xl p-6">
          <label className="block font-heading font-semibold text-charcoal mb-2">What are your main hair concerns? *</label>
          <textarea value={formData.hairConcerns} onChange={(e) => setFormData({ ...formData, hairConcerns: e.target.value })} placeholder="e.g., My hair has been experiencing breakage at the edges..." className="w-full bg-cream border border-border rounded-lg px-4 py-3 text-sm text-charcoal placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold resize-none h-32" required />
        </div>
        <div className="bg-white border border-border rounded-xl p-6">
          <label className="block font-heading font-semibold text-charcoal mb-2">What hairstyle are you looking for?</label>
          <textarea value={formData.desiredHairstyle} onChange={(e) => setFormData({ ...formData, desiredHairstyle: e.target.value })} placeholder="e.g., I'd love to try knotless box braids..." className="w-full bg-cream border border-border rounded-lg px-4 py-3 text-sm text-charcoal placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold resize-none h-24" />
        </div>
        <div className="bg-white border border-border rounded-xl p-6">
          <label className="block font-heading font-semibold text-charcoal mb-4">What&apos;s your hair type?</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {["STRAIGHT", "WAVY", "CURLY", "COILY", "KINKY", "KINKY_COILY"].map((type) => (
              <button key={type} type="button" onClick={() => setFormData({ ...formData, hairType: type })} className={`py-3 rounded-lg text-sm font-medium border transition-all ${formData.hairType === type ? "bg-charcoal text-white border-charcoal" : "bg-cream text-charcoal border-border hover:border-charcoal"}`}>
                {type.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-6">
          <label className="block font-heading font-semibold text-charcoal mb-2">Reference Images</label>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-gold/50 transition-colors">
            <Upload className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Drag and drop images here, or <button type="button" className="text-gold hover:underline">browse</button></p>
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-6">
          <label className="block font-heading font-semibold text-charcoal mb-2">Anything else?</label>
          <textarea value={formData.additionalNotes} onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })} placeholder="Allergies, budget, previous treatments..." className="w-full bg-cream border border-border rounded-lg px-4 py-3 text-sm text-charcoal placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold resize-none h-24" />
        </div>
        <Button type="submit" className="w-full bg-gold text-white hover:bg-gold-dark rounded-full py-6 text-xs font-semibold tracking-wider uppercase">Submit Consultation Request</Button>
      </form>
    </div>
  );
}
