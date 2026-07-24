"use client";

import Link from "next/link";
import { MapPin, Phone, Clock, Navigation, Globe, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const locations = [
  {
    id: "1",
    name: "MecBill Tech — Victoria Island",
    address: "123 Adeola Odeku Street, Victoria Island, Lagos",
    phone: "+234 801 234 5678",
    email: "vi@mecbilltechsalon.com",
    instagram: "@mecbilltech_vi",
    isMain: true,
    hours: {
      weekday: "Mon - Fri: 9:00 AM - 7:00 PM",
      saturday: "Saturday: 9:00 AM - 6:00 PM",
      sunday: "Sunday: Closed",
    },
    features: ["Free WiFi", "Parking", "Refreshments", "Kids Corner"],
    mapQuery: "123 Adeola Odeku Street, Victoria Island, Lagos",
    directionsQuery: "123+Adeola+Odeku+Street+Victoria+Island+Lagos",
  },
  {
    id: "2",
    name: "MecBill Tech — Lekki",
    address: "45 Admiralty Way, Lekki Phase 1, Lagos",
    phone: "+234 802 345 6789",
    email: "lekki@mecbilltechsalon.com",
    instagram: "@mecbilltech_lekki",
    isMain: false,
    hours: {
      weekday: "Mon - Fri: 9:00 AM - 7:00 PM",
      saturday: "Saturday: 9:00 AM - 6:00 PM",
      sunday: "Sunday: 12:00 PM - 5:00 PM",
    },
    features: ["Free WiFi", "Parking", "Refreshments"],
    mapQuery: "45 Admiralty Way, Lekki Phase 1, Lagos",
    directionsQuery: "45+Admiralty+Way+Lekki+Phase+1+Lagos",
  },
];

export default function LocationsPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-charcoal py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">Our Locations</h1>
          <p className="text-white/60 mt-2">Visit us at any of our premium salon locations in Lagos</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        {locations.map((loc) => (
          <div key={loc.id} className="bg-white border border-border rounded-2xl overflow-hidden">
            {loc.isMain && <div className="bg-gold/10 px-6 py-2 text-xs font-semibold text-gold tracking-wider uppercase">Flagship Location</div>}
            <div className="grid md:grid-cols-2 gap-0">
              {/* Map */}
              <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[400px] bg-cream">
                <iframe
                  title={`Map — ${loc.name}`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(loc.mapQuery)}&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 w-full h-full"
                />
              </div>

              {/* Details */}
              <div className="p-6 sm:p-8">
                <h2 className="font-heading text-lg sm:text-xl font-bold text-charcoal">{loc.name}</h2>
                <div className="space-y-4 mt-6">
                  <div className="flex gap-3">
                    <MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{loc.address}</p>
                  </div>
                  <div className="flex gap-3">
                    <Phone className="h-4 w-4 text-gold shrink-0" />
                    <a href={`tel:${loc.phone}`} className="text-sm text-muted-foreground hover:text-gold transition-colors">{loc.phone}</a>
                  </div>
                  <div className="flex gap-3">
                    <Mail className="h-4 w-4 text-gold shrink-0" />
                    <a href={`mailto:${loc.email}`} className="text-sm text-muted-foreground hover:text-gold transition-colors">{loc.email}</a>
                  </div>
                  <div className="flex gap-3">
                    <Clock className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p>{loc.hours.weekday}</p>
                      <p>{loc.hours.saturday}</p>
                      <p>{loc.hours.sunday}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Globe className="h-4 w-4 text-gold shrink-0" />
                    <span className="text-sm text-muted-foreground">{loc.instagram}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-6">
                  {loc.features.map((f) => (
                    <span key={f} className="text-[10px] bg-cream px-3 py-1 rounded-full text-muted-foreground font-medium">{f}</span>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <Button asChild className="bg-charcoal text-white hover:bg-charcoal-light rounded-full text-xs font-semibold tracking-wider uppercase px-6">
                    <Link href="/book">Book Appointment</Link>
                  </Button>
                  <Button variant="outline" asChild className="rounded-full text-xs font-semibold tracking-wider uppercase px-6 border-border">
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${loc.directionsQuery}`} target="_blank" rel="noopener noreferrer">
                      <Navigation className="h-3.5 w-3.5 mr-1.5" />
                      Directions
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
