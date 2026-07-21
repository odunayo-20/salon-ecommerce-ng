"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const categories = [
  {
    id: "hair",
    name: "Hair Services",
    services: [
      { name: "Braids", slug: "braids", price: 20000, duration: 150 },
      { name: "Knotless Braids", slug: "knotless-braids", price: 25000, duration: 180, popular: true },
      { name: "Loc Maintenance", slug: "loc-maintenance", price: 15000, duration: 120 },
      { name: "Wig Installation", slug: "wig-installation", price: 15000, duration: 120 },
      { name: "Natural Hair Treatment", slug: "natural-hair-treatment", price: 8000, duration: 60 },
      { name: "Silk Press", slug: "silk-press", price: 12000, duration: 90, popular: true },
    ],
  },
  {
    id: "nails",
    name: "Nail Services",
    services: [
      { name: "Acrylic Nails", slug: "acrylic", price: 5000, duration: 60 },
      { name: "Gel Nails", slug: "gel", price: 4500, duration: 45 },
      { name: "Manicure", slug: "manicure", price: 3000, duration: 30 },
      { name: "Pedicure", slug: "pedicure", price: 4000, duration: 40 },
    ],
  },
];

const stylists = [
  { id: "s1", name: "Amara Johnson", specialties: ["Braids", "Knotless Braids", "Natural Hair"], experience: 8, availableDays: [1, 2, 3, 4, 5, 6] },
  { id: "s2", name: "Chioma Obi", specialties: ["Wig Installation", "Silk Press", "Color"], experience: 6, availableDays: [1, 2, 3, 5, 6] },
  { id: "s3", name: "Fatima Ali", specialties: ["Natural Hair Treatment", "Loc Maintenance", "Deep Conditioning"], experience: 10, availableDays: [1, 3, 4, 5, 6] },
  { id: "s4", name: "Zainab Okafor", specialties: ["Acrylic", "Gel", "Manicure", "Pedicure"], experience: 5, availableDays: [1, 2, 3, 4, 5, 6] },
];

const timeSlots = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30"];

export default function BookPage() {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedStylist, setSelectedStylist] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentOption, setPaymentOption] = useState<"deposit" | "full" | "later">("later");

  const activeCategory = categories.find((c) => c.id === selectedCategory);
  const activeService = activeCategory?.services.find((s) => s.slug === selectedService);
  const activeStylist = stylists.find((s) => s.id === selectedStylist);

  const today = new Date();
  const calendarDays: Date[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    calendarDays.push(d);
  }
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-charcoal py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">Book Your Appointment</h1>
          <p className="text-white/60 mt-2">Select your service, choose a stylist, and pick a time that works for you.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-center gap-2 md:gap-4">
          {["Service", "Stylist", "Date & Time", "Confirm"].map((label, i) => (
            <div key={label} className="flex items-center gap-2 md:gap-4">
              <button onClick={() => setStep(i + 1)} className={cn("h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all", step === i + 1 ? "bg-gold text-white" : step > i + 1 ? "bg-gold/20 text-gold" : "bg-border text-muted-foreground")}>
                {step > i + 1 ? "✓" : i + 1}
              </button>
              <span className={cn("text-xs font-medium hidden md:block", step === i + 1 ? "text-charcoal" : "text-muted-foreground")}>{label}</span>
              {i < 3 && <div className="w-8 md:w-16 h-px bg-border" />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        {step === 1 && (
          <div className="space-y-8">
            <div className="flex gap-3">
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); setSelectedService(null); }} className={cn("px-6 py-3 rounded-full text-sm font-medium transition-all border", selectedCategory === cat.id ? "bg-charcoal text-white border-charcoal" : "bg-white text-charcoal border-border hover:border-charcoal")}>
                  {cat.name}
                </button>
              ))}
            </div>
            {activeCategory && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeCategory.services.map((service) => (
                  <button key={service.slug} onClick={() => setSelectedService(service.slug)} className={cn("bg-white border rounded-xl p-5 text-left transition-all hover:shadow-md", selectedService === service.slug ? "border-gold shadow-md ring-1 ring-gold/20" : "border-border hover:border-gold/30")}>
                    <div className="flex items-start justify-between">
                      <h3 className="font-heading font-semibold text-charcoal">{service.name}</h3>
                      {service.popular && <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded-full font-bold">Popular</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span>{service.duration} min</span>
                      <span>·</span>
                      <span className="font-semibold text-charcoal">₦{service.price.toLocaleString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {selectedService && (
              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} className="bg-charcoal text-white hover:bg-charcoal-light rounded-full px-8 text-xs font-semibold tracking-wider uppercase">Continue</Button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              {stylists.map((stylist) => (
                <button key={stylist.id} onClick={() => setSelectedStylist(stylist.id)} className={cn("bg-white border rounded-xl p-5 text-left transition-all hover:shadow-md", selectedStylist === stylist.id ? "border-gold shadow-md ring-1 ring-gold/20" : "border-border hover:border-gold/30")}>
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-cream flex items-center justify-center shrink-0">
                      <span className="font-heading text-xl font-semibold text-gold">{stylist.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-charcoal">{stylist.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{stylist.experience} years experience</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {stylist.specialties.map((spec) => (
                          <span key={spec} className="text-[10px] bg-cream px-2 py-0.5 rounded-full text-muted-foreground">{spec}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              <button onClick={() => setSelectedStylist(null)} className={cn("bg-white border rounded-xl p-5 text-left transition-all hover:shadow-md", selectedStylist === null ? "border-gold shadow-md ring-1 ring-gold/20" : "border-border hover:border-gold/30")}>
                <h3 className="font-heading font-semibold text-charcoal">No Preference</h3>
                <p className="text-sm text-muted-foreground mt-1">We&apos;ll match you with the best available stylist</p>
              </button>
            </div>
            <div className="flex justify-between">
              <Button onClick={() => setStep(1)} variant="outline" className="rounded-full px-8 text-xs font-semibold tracking-wider uppercase">Back</Button>
              <Button onClick={() => setStep(3)} className="bg-charcoal text-white hover:bg-charcoal-light rounded-full px-8 text-xs font-semibold tracking-wider uppercase">Continue</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div className="bg-white border border-border rounded-xl p-6">
              <h3 className="font-heading font-semibold text-charcoal mb-4">Select a Date</h3>
              <div className="grid grid-cols-7 gap-2">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">{day}</div>
                ))}
                {Array.from({ length: calendarDays[0]?.getDay() || 0 }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {calendarDays.map((date) => {
                  const dateStr = date.toISOString().split("T")[0];
                  const isSelected = selectedDate === dateStr;
                  const isToday = date.toDateString() === today.toDateString();
                  const dayOfWeek = date.getDay();
                  const available = activeStylist ? activeStylist.availableDays.includes(dayOfWeek) : true;
                  return (
                    <button key={dateStr} onClick={() => available && setSelectedDate(dateStr)} disabled={!available} className={cn("h-10 rounded-lg text-sm font-medium transition-all", isSelected ? "bg-gold text-white" : available ? "hover:bg-cream text-charcoal" : "text-muted-foreground/40 cursor-not-allowed", isToday && !isSelected && "ring-1 ring-gold")}>
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
            {selectedDate && (
              <div className="bg-white border border-border rounded-xl p-6">
                <h3 className="font-heading font-semibold text-charcoal mb-4">Select a Time</h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {timeSlots.map((time) => (
                    <button key={time} onClick={() => setSelectedTime(time)} className={cn("py-2.5 rounded-lg text-sm font-medium border transition-all", selectedTime === time ? "bg-gold text-white border-gold" : "border-border hover:border-gold text-charcoal")}>
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="bg-white border border-border rounded-xl p-6">
              <h3 className="font-heading font-semibold text-charcoal mb-4">Additional Notes</h3>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special requests or notes..." className="w-full bg-cream border border-border rounded-lg px-4 py-3 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold resize-none h-24" />
            </div>
            <div className="flex justify-between">
              <Button onClick={() => setStep(2)} variant="outline" className="rounded-full px-8 text-xs font-semibold tracking-wider uppercase">Back</Button>
              <Button onClick={() => setStep(4)} disabled={!selectedDate || !selectedTime} className="bg-charcoal text-white hover:bg-charcoal-light rounded-full px-8 text-xs font-semibold tracking-wider uppercase disabled:opacity-50">Continue</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="bg-white border border-border rounded-xl p-6 md:p-8">
              <h3 className="font-heading text-xl font-semibold text-charcoal mb-6">Booking Summary</h3>
              <div className="space-y-4">
                {[
                  ["Service", activeService?.name],
                  ["Duration", activeService ? `${activeService.duration} min` : undefined],
                  ["Stylist", activeStylist?.name || "No preference"],
                  ["Date", selectedDate],
                  ["Time", selectedTime],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} className="flex justify-between py-3 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm font-medium text-charcoal">{value}</span>
                  </div>
                ))}
                {activeService && (
                  <div className="flex justify-between py-3">
                    <span className="text-sm font-semibold text-charcoal">Total</span>
                    <span className="text-lg font-heading font-bold text-charcoal">₦{activeService.price.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white border border-border rounded-xl p-6">
              <h3 className="font-heading font-semibold text-charcoal mb-4">Payment Option</h3>
              <div className="space-y-3">
                {([
                  { value: "deposit" as const, label: "Pay Deposit", desc: `Secure with ₦${((activeService?.price || 0) * 0.3).toLocaleString()}` },
                  { value: "full" as const, label: "Pay in Full", desc: `Pay ₦${(activeService?.price || 0).toLocaleString()} now` },
                  { value: "later" as const, label: "Pay at Salon", desc: "Reserve and pay when you arrive" },
                ]).map((option) => (
                  <button key={option.value} onClick={() => setPaymentOption(option.value)} className={cn("w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left", paymentOption === option.value ? "border-gold bg-gold/5" : "border-border hover:border-gold/30")}>
                    <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0", paymentOption === option.value ? "border-gold" : "border-border")}>
                      {paymentOption === option.value && <div className="h-2.5 w-2.5 rounded-full bg-gold" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-charcoal">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <Button onClick={() => setStep(3)} variant="outline" className="rounded-full px-8 text-xs font-semibold tracking-wider uppercase">Back</Button>
              <Button className="bg-gold text-white hover:bg-gold-dark rounded-full px-8 text-xs font-semibold tracking-wider uppercase">Confirm Booking</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
