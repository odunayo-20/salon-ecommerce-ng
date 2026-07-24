"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";

interface Service {
  id: string;
  name: string;
  slug: string;
  price: number;
  duration: number;
  depositAmount?: number;
  isPopular: boolean;
  category: { id: string; name: string; slug: string; type: string };
}

interface Stylist {
  id: string;
  user: { id: string; name: string | null; image: string | null };
  specialties: string[];
  experience: number | null;
  services: { service: { id: string } }[];
}

const timeSlots = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30"];

interface SlotInfo { time: string; available: boolean; reason: string | null; }
interface WorkingHours { stylistId: string; start: string; end: string; }

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>}>
      <BookPageContent />
    </Suspense>
  );
}

function BookPageContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category");
  const [step, setStep] = useState(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedStylistId, setSelectedStylistId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentOption, setPaymentOption] = useState<"deposit" | "full" | "later">("later");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [createdRef, setCreatedRef] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: string; value: number; discountAmount: number; description: string } | null>(null);

  const [allServices, setAllServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [svcRes, styRes] = await Promise.all([
        fetch("/api/services?isActive=true&limit=100"),
        fetch("/api/stylists?isActive=true"),
      ]);
      const svcData = await svcRes.json();
      const styData = await styRes.json();
      setAllServices(svcData.services || []);
      setStylists(styData.stylists || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Pre-select category from URL searchParams
  useEffect(() => {
    if (categorySlug && allServices.length > 0) {
      const match = allServices.find(
        (s) => s.category.slug === categorySlug && s.category.type === "service"
      );
      if (match) {
        setSelectedCategoryId(match.category.id);
        setStep(2);
      }
    }
  }, [categorySlug, allServices]);

  // Fetch available slots when date or stylist changes
  useEffect(() => {
    if (!selectedDate) { setSlots([]); setWorkingHours([]); return; }
    let cancelled = false;
    setLoadingSlots(true);
    const params = new URLSearchParams({ date: selectedDate });
    if (selectedStylistId) params.set("stylistId", selectedStylistId);
    fetch(`/api/bookings/slots?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setSlots(data.slots || []);
          setWorkingHours(data.workingHours || []);
        }
      })
      .catch(() => { if (!cancelled) { setSlots([]); setWorkingHours([]); } })
      .finally(() => { if (!cancelled) setLoadingSlots(false); });
    return () => { cancelled = true; };
  }, [selectedDate, selectedStylistId]);

  const categories = allServices.reduce((acc, svc) => {
    if (svc.category.type !== "service") return acc;
    const existing = acc.find((c) => c.id === svc.category.id);
    if (existing) {
      existing.services.push(svc);
    } else {
      acc.push({ id: svc.category.id, name: svc.category.name, services: [svc] });
    }
    return acc;
  }, [] as { id: string; name: string; services: Service[] }[]);

  const activeCategory = categories.find((c) => c.id === selectedCategoryId);
  const activeService = activeCategory?.services.find((s) => s.id === selectedServiceId);
  const activeStylist = stylists.find((s) => s.id === selectedStylistId);

  const today = new Date();
  const calendarDays: Date[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    calendarDays.push(d);
  }
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const isSlotOccupied = (time: string) => {
    const slot = slots.find((s) => s.time === time);
    return slot ? !slot.available : true;
  };

  // Clear selected time if it becomes unavailable
  useEffect(() => {
    if (selectedTime && isSlotOccupied(selectedTime)) {
      setSelectedTime("");
    }
  }, [slots, selectedTime]);

  const handleSubmitBooking = async () => {
    if (!session) { router.push("/auth/signin"); return; }
    if (!activeService) return;

    setIsSubmitting(true);
    setBookingError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: activeService.id,
          stylistId: selectedStylistId || undefined,
          date: selectedDate,
          startTime: selectedTime,
          notes: notes || undefined,
          paymentMethod: paymentOption,
          couponCode: appliedCoupon?.code || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed. Please try again.");

      // If payment is required (deposit or full), redirect to Paystack
      if (data.paymentId && (paymentOption === "deposit" || paymentOption === "full")) {
        const payRes = await fetch("/api/payments/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId: data.paymentId }),
        });
        const payData = await payRes.json();
        if (payRes.ok && payData.checkoutUrl) {
          window.location.href = payData.checkoutUrl;
          return;
        }
        // If payment init fails, still show confirmation (booking is saved)
      }

      setCreatedRef(data.appointment?.reference || "");
      setBookingConfirmed(true);
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !activeService) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), subtotal: activeService.price, type: "SERVICES" }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setCouponError(data.error || "Invalid coupon");
        return;
      }
      setAppliedCoupon({ code: data.code, type: data.type, value: data.value, discountAmount: data.discountAmount, description: data.description });
      setCouponCode("");
    } catch {
      setCouponError("Failed to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const servicePrice = activeService?.price || 0;
  const couponDiscount = appliedCoupon ? Math.min(appliedCoupon.discountAmount, servicePrice) : 0;
  const finalTotal = Math.max(servicePrice - couponDiscount, 0);
  const depositAmount = paymentOption === "deposit" ? (activeService?.depositAmount || 0) || finalTotal * 0.3 : paymentOption === "full" ? finalTotal : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-gold animate-spin" />
      </div>
    );
  }

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="bg-charcoal py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">Booking Confirmed!</h1>
            <p className="text-white/60 mt-2">Your appointment has been successfully booked.</p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="bg-white border border-border rounded-2xl p-8 text-center space-y-6">
            <CheckCircle className="h-16 w-16 text-gold mx-auto" />
            <h2 className="font-heading text-2xl font-bold text-charcoal">Booking Confirmed!</h2>
            {createdRef && <p className="text-sm text-muted-foreground">Reference: <span className="font-mono font-semibold text-charcoal">{createdRef}</span></p>}
            <p className="text-muted-foreground">Thank you for booking with us. A confirmation email has been sent.</p>
            <div className="max-w-sm mx-auto space-y-3 text-left">
              {[
                ["Service", activeService?.name],
                ["Stylist", activeStylist?.user.name || "No preference"],
                ["Date", selectedDate],
                ["Time", selectedTime],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-medium text-charcoal">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link href="/dashboard">
                <Button className="bg-charcoal text-white hover:bg-charcoal-light rounded-full px-8 text-xs font-semibold tracking-wider uppercase">View Dashboard</Button>
              </Link>
              <Link href="/book">
                <Button variant="outline" className="rounded-full px-8 text-xs font-semibold tracking-wider uppercase">Book Another</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="flex gap-3 flex-wrap">
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => { setSelectedCategoryId(cat.id); setSelectedServiceId(null); }} className={cn("px-6 py-3 rounded-full text-sm font-medium transition-all border", selectedCategoryId === cat.id ? "bg-charcoal text-white border-charcoal" : "bg-white text-charcoal border-border hover:border-charcoal")}>
                  {cat.name}
                </button>
              ))}
            </div>
            {activeCategory && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeCategory.services.map((service) => (
                  <button key={service.id} onClick={() => setSelectedServiceId(service.id)} className={cn("bg-white border rounded-xl p-5 text-left transition-all hover:shadow-md", selectedServiceId === service.id ? "border-gold shadow-md ring-1 ring-gold/20" : "border-border hover:border-gold/30")}>
                    <div className="flex items-start justify-between">
                      <h3 className="font-heading font-semibold text-charcoal">{service.name}</h3>
                      {service.isPopular && <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded-full font-bold">Popular</span>}
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
            {selectedServiceId && (
              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} className="bg-charcoal text-white hover:bg-charcoal-light rounded-full px-8 text-xs font-semibold tracking-wider uppercase">Continue</Button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              {stylists.map((stylist) => {
                const canDoService = activeService ? stylist.services.some((ss) => ss.service.id === activeService.id) : true;
                return (
                  <button key={stylist.id} onClick={() => setSelectedStylistId(stylist.id)} className={cn("bg-white border rounded-xl p-5 text-left transition-all hover:shadow-md", selectedStylistId === stylist.id ? "border-gold shadow-md ring-1 ring-gold/20" : "border-border hover:border-gold/30", !canDoService && "opacity-50")}>
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-full bg-cream flex items-center justify-center shrink-0 overflow-hidden">
                        {stylist.user.image ? <img src={stylist.user.image} alt="" className="h-full w-full object-cover" /> : <span className="font-heading text-xl font-semibold text-gold">{(stylist.user.name || "?").charAt(0)}</span>}
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold text-charcoal">{stylist.user.name}</h3>
                        {stylist.experience && <p className="text-xs text-muted-foreground mt-0.5">{stylist.experience} years experience</p>}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {stylist.specialties.slice(0, 3).map((spec) => (
                            <span key={spec} className="text-[10px] bg-cream px-2 py-0.5 rounded-full text-muted-foreground">{spec}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
              <button onClick={() => setSelectedStylistId(null)} className={cn("bg-white border rounded-xl p-5 text-left transition-all hover:shadow-md", selectedStylistId === null ? "border-gold shadow-md ring-1 ring-gold/20" : "border-border hover:border-gold/30")}>
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
                  return (
                    <button key={dateStr} onClick={() => setSelectedDate(dateStr)} className={cn("h-10 rounded-lg text-sm font-medium transition-all", isSelected ? "bg-gold text-white" : "hover:bg-cream text-charcoal", isToday && !isSelected && "ring-1 ring-gold")}>
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
            {selectedDate && (
              <div className="bg-white border border-border rounded-xl p-6">
                <h3 className="font-heading font-semibold text-charcoal mb-4">Select a Time</h3>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 text-gold animate-spin" /><span className="text-sm text-muted-foreground ml-2">Checking availability...</span></div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No available time slots for this date.</p>
                    <p className="text-xs text-muted-foreground mt-1">Try selecting a different date or stylist.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={cn(
                          "py-2.5 rounded-lg text-sm font-medium border transition-all",
                          !slot.available
                            ? "border-border bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                            : selectedTime === slot.time
                            ? "bg-gold text-white border-gold"
                            : "border-border hover:border-gold text-charcoal"
                        )}
                        title={!slot.available ? slot.reason === "break" ? "Break time" : slot.reason === "blocked" ? "Blocked" : "Booked" : undefined}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
                {!loadingSlots && slots.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-3">
                    {slots.filter((s) => !s.available).length} time slot{slots.filter((s) => !s.available).length !== 1 ? "s" : ""} unavailable for this date{selectedStylistId ? " with this stylist" : ""}.
                  </p>
                )}
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
                  ["Stylist", activeStylist?.user.name || "No preference"],
                  ["Date", selectedDate],
                  ["Time", selectedTime],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} className="flex justify-between py-3 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm font-medium text-charcoal">{value}</span>
                  </div>
                ))}

                {/* Coupon Input */}
                <div className="py-3 border-b border-border/50">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gold bg-gold/10 px-2 py-1 rounded-full">{appliedCoupon.code}</span>
                        <span className="text-xs text-gold">{appliedCoupon.description}</span>
                      </div>
                      <button onClick={() => setAppliedCoupon(null)} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => { setCouponCode(e.target.value); setCouponError(""); }}
                          placeholder="Coupon code"
                          className="flex-1 bg-cream border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-gold"
                          onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                        />
                        <Button variant="outline" size="sm" className="rounded-full border-border text-xs" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}>
                          {couponLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply"}
                        </Button>
                      </div>
                      {couponError && <p className="text-xs text-red-600 mt-1">{couponError}</p>}
                    </div>
                  )}
                </div>

                {activeService && (
                  <>
                    <div className="flex justify-between py-3">
                      <span className="text-sm text-muted-foreground">Service Price</span>
                      <span className="text-sm font-medium text-charcoal">₦{servicePrice.toLocaleString()}</span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between py-3">
                        <span className="text-sm text-muted-foreground">Discount</span>
                        <span className="text-sm font-medium text-green-600">-₦{couponDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-3">
                      <span className="text-sm font-semibold text-charcoal">Total</span>
                      <span className="text-lg font-heading font-bold text-charcoal">₦{finalTotal.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="bg-white border border-border rounded-xl p-6">
              <h3 className="font-heading font-semibold text-charcoal mb-4">Payment Option</h3>
              <div className="space-y-3">
                {([
                  { value: "deposit" as const, label: "Pay Deposit", desc: `Secure with ₦${depositAmount.toLocaleString()}` },
                  { value: "full" as const, label: "Pay in Full", desc: `Pay ₦${finalTotal.toLocaleString()} now` },
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
            {!session && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg px-4 py-3 text-center">
                You&apos;ll need to <Link href="/auth/signin" className="font-semibold underline">sign in</Link> to complete your booking.
              </div>
            )}
            {bookingError && (
              <p className="text-sm text-red-600 text-center">{bookingError}</p>
            )}
            <div className="flex justify-between">
              <Button onClick={() => setStep(3)} variant="outline" className="rounded-full px-8 text-xs font-semibold tracking-wider uppercase">Back</Button>
              <Button onClick={handleSubmitBooking} disabled={isSubmitting} className="bg-gold text-white hover:bg-gold-dark rounded-full px-8 text-xs font-semibold tracking-wider uppercase disabled:opacity-50">
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : "Confirm Booking"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
