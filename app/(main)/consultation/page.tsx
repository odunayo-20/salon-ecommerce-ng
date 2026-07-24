"use client";

import { useState } from "react";
import { Upload, Send, Loader2, CheckCircle, User, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ConsultationPage() {
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "",
    hairConcerns: "", desiredHairstyle: "", hairType: "", additionalNotes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name || undefined,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          concerns: [formData.hairConcerns],
          hairConcerns: formData.hairConcerns,
          desiredStyle: formData.desiredHairstyle,
          desiredHairstyle: formData.desiredHairstyle,
          hairType: formData.hairType,
          notes: formData.additionalNotes,
          additionalNotes: formData.additionalNotes,
          referenceImages: [],
        }),
      });
      if (!res.ok) throw new Error("Failed to submit consultation");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="h-20 w-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6"><CheckCircle className="h-8 w-8 text-gold" /></div>
          <h1 className="font-heading text-3xl font-bold text-charcoal mb-3">Consultation Request Submitted!</h1>
          <p className="text-muted-foreground leading-relaxed mb-8">Our hair specialists will review your profile and contact you within 24 hours.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-gold text-white hover:bg-gold-dark rounded-full px-8 py-6 text-xs font-semibold tracking-wider uppercase">
              <Link href="/book">Book Appointment</Link>
            </Button>
            <Link href="/" className="text-muted-foreground hover:text-charcoal text-sm underline underline-offset-4">Back to Home</Link>
          </div>
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
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        {/* Contact Info */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h3 className="font-heading font-semibold text-charcoal mb-4">Your Information</h3>
          <p className="text-xs text-muted-foreground mb-4">Optional — helps us reach you with our recommendation.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-charcoal mb-1.5"><User className="h-3 w-3 inline mr-1" />Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Your name" className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal mb-1.5"><Mail className="h-3 w-3 inline mr-1" />Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="your@email.com" className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium text-charcoal mb-1.5"><Phone className="h-3 w-3 inline mr-1" />Phone</label>
            <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+234 ..." className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold" />
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-6">
          <label className="block font-heading font-semibold text-charcoal mb-2">What are your main hair concerns? *</label>
          <textarea value={formData.hairConcerns} onChange={(e) => setFormData({ ...formData, hairConcerns: e.target.value })} placeholder="e.g., My hair has been experiencing breakage at the edges..." className="w-full bg-cream border border-border rounded-lg px-4 py-3 text-sm text-charcoal placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold resize-none h-32" required />
        </div>
        <div className="bg-white border border-border rounded-xl p-6">
          <label className="block font-heading font-semibold text-charcoal mb-2">What hairstyle are you looking for?</label>
          <textarea value={formData.desiredHairstyle} onChange={(e) => setFormData({ ...formData, desiredHairstyle: e.target.value })} placeholder="e.g., I&apos;d love to try knotless box braids..." className="w-full bg-cream border border-border rounded-lg px-4 py-3 text-sm text-charcoal placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold resize-none h-24" />
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
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <Button type="submit" disabled={isSubmitting} className="w-full bg-gold text-white hover:bg-gold-dark rounded-full py-6 text-xs font-semibold tracking-wider uppercase">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
          {isSubmitting ? "Submitting..." : "Submit Consultation Request"}
        </Button>
      </form>
    </div>
  );
}
