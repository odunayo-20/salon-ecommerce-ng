"use client";

import Link from "next/link";
import { Star, Scissors, Clock, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const featuredStylist = {
  name: "Amara Johnson",
  title: "Lead Stylist & Braiding Expert",
  experience: 12,
  rating: 5,
  reviews: 340,
  bio: "Amara is the heart and soul of MecBill Tech. With over a decade of experience in African hair artistry, she has styled celebrities, brides, and countless women who trust her to bring their hair visions to life. Her signature knotless braids and intricate protective styles have earned her a loyal following across Lagos.",
  specialties: ["Braids", "Knotless Braids", "Protective Styles", "Natural Hair"],
};

const stylists = [
  {
    name: "Amara Johnson",
    title: "Master Braider",
    experience: 12,
    rating: 5,
    bio: "Specialises in intricate braiding styles with a focus on protective, natural-looking techniques. Known for her precision and artistic flair.",
    specialties: ["Braids", "Knotless Braids", "Protective Styles"],
  },
  {
    name: "Fatima Ali",
    title: "Natural Hair Specialist",
    experience: 10,
    rating: 5,
    bio: "A certified trichologist passionate about restoring and maintaining healthy natural hair. Expert in deep conditioning and growth treatments.",
    specialties: ["Natural Hair", "Deep Conditioning", "Loc Maintenance"],
  },
  {
    name: "Chioma Obi",
    title: "Color Expert",
    experience: 8,
    rating: 4,
    bio: "Trained in London and Lagos, Chioma brings a global perspective to hair colour. Specialises in bold, vibrant tones that complement African skin tones.",
    specialties: ["Hair Color", "Highlights", "Toning"],
  },
  {
    name: "Ngozi Eze",
    title: "Wig Specialist",
    experience: 7,
    rating: 5,
    bio: "The go-to expert for flawless wig installations and customizations. Ngozi crafts natural-looking units that blend seamlessly with any style.",
    specialties: ["Wig Installation", "Custom Wigs", "Frontals"],
  },
  {
    name: "Aisha Bello",
    title: "Nail Artist",
    experience: 6,
    rating: 5,
    bio: "A creative nail artist who turns nails into miniature masterpieces. From elegant French tips to bold 3D nail art, Aisha does it all.",
    specialties: ["Gel Nails", "Acrylic Nails", "Nail Art"],
  },
  {
    name: "Tolu Adeyemi",
    title: "Stylist",
    experience: 5,
    rating: 4,
    bio: "A rising star in the salon, Tolu excels at silk presses, blowouts, and sleek everyday styles. Her clients love her attention to detail.",
    specialties: ["Silk Press", "Blowouts", "Styling"],
  },
];

function RatingStars({ rating, count }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`h-3.5 w-3.5 ${i < rating ? "text-gold fill-gold" : "text-border"}`} />
        ))}
      </div>
      {count !== undefined && <span className="text-xs text-muted-foreground">({count})</span>}
    </div>
  );
}

export default function StylistsPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-charcoal py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">Our Stylists</h1>
          <p className="text-white/60 mt-2">Meet the talented artists who bring your hair dreams to life</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        <div className="bg-cream rounded-2xl p-6 md:p-10">
          <div className="grid md:grid-cols-5 gap-8 items-center">
            <div className="md:col-span-2">
              <div className="aspect-square bg-white border border-border rounded-2xl flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Scissors className="h-10 w-10 mx-auto mb-2" />
                  <p className="text-sm">Featured Stylist</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] bg-gold/10 px-3 py-1 rounded-full text-gold font-semibold tracking-wider uppercase">Featured Stylist</span>
              </div>
              <h2 className="font-heading text-2xl font-bold text-charcoal">{featuredStylist.name}</h2>
              <p className="text-sm text-gold font-medium mt-1">{featuredStylist.title}</p>
              <RatingStars rating={featuredStylist.rating} count={featuredStylist.reviews} />
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{featuredStylist.experience} years experience</div>
                <div className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5" />Top Rated</div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mt-4">{featuredStylist.bio}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {featuredStylist.specialties.map((spec) => (
                  <span key={spec} className="text-[10px] bg-white px-3 py-1 rounded-full text-muted-foreground font-medium">{spec}</span>
                ))}
              </div>
              <Button asChild className="bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold tracking-wider uppercase px-6 mt-6">
                <Link href={`/book`}>Book with {featuredStylist.name.split(" ")[0]}</Link>
              </Button>
            </div>
          </div>
        </div>

        <div>
          <div className="text-center mb-10">
            <h2 className="font-heading text-2xl font-bold text-charcoal tracking-tight">Meet Our Team</h2>
            <p className="text-sm text-muted-foreground mt-2">Every stylist at MecBill Tech is handpicked for their skill, passion, and dedication</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stylists.map((stylist) => (
              <div key={stylist.name} className="bg-white border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow group">
                <div className="aspect-[4/3] bg-cream flex items-center justify-center relative">
                  <div className="text-center text-muted-foreground">
                    <Scissors className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">{stylist.name.split(" ")[0]}&apos;s Photo</p>
                  </div>
                  <div className="absolute top-3 right-3 text-[10px] bg-white px-2.5 py-1 rounded-full text-muted-foreground font-medium shadow-sm">{stylist.experience} yrs</div>
                </div>
                <div className="p-6">
                  <h3 className="font-heading font-bold text-charcoal">{stylist.name}</h3>
                  <p className="text-xs text-gold font-medium mt-0.5">{stylist.title}</p>
                  <RatingStars rating={stylist.rating} />
                  <p className="text-sm text-muted-foreground leading-relaxed mt-3 line-clamp-3">{stylist.bio}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {stylist.specialties.map((spec) => (
                      <span key={spec} className="text-[10px] bg-cream px-2.5 py-0.5 rounded-full text-muted-foreground font-medium">{spec}</span>
                    ))}
                  </div>
                  <Button asChild className="w-full bg-charcoal text-white hover:bg-charcoal-light rounded-full text-xs font-semibold tracking-wider uppercase mt-5">
                    <Link href="/book">Book with {stylist.name.split(" ")[0]}</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-cream rounded-2xl p-8 md:p-12 text-center">
          <h2 className="font-heading text-2xl font-bold text-charcoal tracking-tight">Want to Join Our Team?</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">We are always looking for talented, passionate stylists who share our commitment to excellence and African beauty.</p>
          <Button asChild className="bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold tracking-wider uppercase px-6 mt-8">
            <Link href="/careers">View Open Positions <ArrowRight className="h-3.5 w-3.5 ml-1.5" /></Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
