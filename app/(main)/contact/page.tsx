"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Globe, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

const subjects = ["General Inquiry", "Booking", "Partnership", "Feedback", "Other"];

const contactInfo = [
  { icon: MapPin, title: "Visit Us", details: ["123 Adeola Odeku Street", "Victoria Island, Lagos"] },
  { icon: Phone, title: "Call Us", details: ["+234 800 000 0000"], href: "tel:+2348000000000" },
  { icon: Mail, title: "Email Us", details: ["hello@mecbilltechsalon.com"], href: "mailto:hello@mecbilltechsalon.com" },
  { icon: Clock, title: "Working Hours", details: ["Mon-Fri: 9AM - 7PM", "Saturday: 9AM - 6PM", "Sunday: Closed"] },
];

const socialLinks = [
  { icon: Globe, label: "Instagram", href: "#" },
  { icon: Video, label: "YouTube", href: "#" },
  { icon: MessageCircle, label: "Twitter", href: "#" },
  { icon: Globe, label: "TikTok", href: "#" },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="h-20 w-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6"><Send className="h-8 w-8 text-gold" /></div>
          <h1 className="font-heading text-3xl font-bold text-charcoal mb-3">Message Sent</h1>
          <p className="text-muted-foreground leading-relaxed">Thank you for reaching out! We&apos;ll get back to you within 24 hours.</p>
          <Button onClick={() => setSubmitted(false)} className="mt-6 bg-charcoal text-white hover:bg-charcoal-light rounded-full text-xs font-semibold tracking-wider uppercase px-6">Send Another Message</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-charcoal py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">Get in Touch</h1>
          <p className="text-white/60 mt-2">We&apos;d love to hear from you</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-6 md:p-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1.5 uppercase tracking-wider">Name *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Your name" className="w-full bg-cream border border-border rounded-lg px-4 py-3 text-sm text-charcoal placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1.5 uppercase tracking-wider">Email *</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="your@email.com" className="w-full bg-cream border border-border rounded-lg px-4 py-3 text-sm text-charcoal placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5 uppercase tracking-wider">Phone</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+234 XXX XXX XXXX" className="w-full bg-cream border border-border rounded-lg px-4 py-3 text-sm text-charcoal placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5 uppercase tracking-wider">Subject *</label>
                <select value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="w-full bg-cream border border-border rounded-lg px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold appearance-none" required>
                  <option value="" disabled>Select a subject</option>
                  {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5 uppercase tracking-wider">Message *</label>
                <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Tell us how we can help..." className="w-full bg-cream border border-border rounded-lg px-4 py-3 text-sm text-charcoal placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold resize-none h-36" required />
              </div>
              <Button type="submit" className="w-full bg-gold text-white hover:bg-gold-dark rounded-full py-6 text-xs font-semibold tracking-wider uppercase">Send Message</Button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {contactInfo.map((item) => (
              <div key={item.title} className="bg-white border border-border rounded-xl p-5">
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-charcoal text-sm">{item.title}</h3>
                    {item.href ? (
                      <a href={item.href} className="text-sm text-muted-foreground hover:text-gold transition-colors block mt-1">{item.details[0]}</a>
                    ) : (
                      item.details.map((line, i) => <p key={i} className="text-sm text-muted-foreground mt-1">{line}</p>)
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-cream rounded-2xl p-10 md:p-14 text-center mt-8">
          <MapPin className="h-10 w-10 text-gold mx-auto mb-4" />
          <h3 className="font-heading text-lg font-bold text-charcoal mb-1">Map Coming Soon</h3>
          <p className="text-sm text-muted-foreground">Find us at 123 Adeola Odeku Street, Victoria Island, Lagos</p>
        </div>

        <div className="flex items-center justify-center gap-6 mt-8">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Follow Us</span>
          <div className="flex gap-3">
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href} className="h-10 w-10 rounded-full bg-cream flex items-center justify-center hover:bg-gold/10 transition-colors group" aria-label={link.label}>
                <link.icon className="h-4 w-4 text-muted-foreground group-hover:text-gold transition-colors" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <a href="https://wa.me/2348000000000" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-500 text-white hover:bg-green-600 rounded-full text-xs font-semibold tracking-wider uppercase px-6 py-3 transition-colors">
            <MessageCircle className="h-4 w-4" />Chat with Us on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
