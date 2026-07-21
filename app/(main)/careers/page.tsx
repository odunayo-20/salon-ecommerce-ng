"use client";

import Link from "next/link";
import { Briefcase, Clock, Users, TrendingUp, HeartHandshake, GraduationCap, Scissors, MessageCircle, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  { icon: TrendingUp, title: "Competitive Salary", description: "Top-tier compensation packages with performance bonuses" },
  { icon: GraduationCap, title: "Professional Development", description: "Ongoing training, workshops, and certification programs" },
  { icon: HeartHandshake, title: "Health Insurance", description: "Comprehensive health coverage for you and your family" },
  { icon: Clock, title: "Flexible Scheduling", description: "Work-life balance with adaptable shift options" },
  { icon: Scissors, title: "Staff Discounts", description: "Generous discounts on all salon products and services" },
  { icon: Users, title: "Career Growth", description: "Clear advancement path from apprentice to senior stylist" },
];

const positions = [
  { title: "Senior Hair Stylist", department: "Styling", type: "Full-time", experience: "3+ years", description: "Lead stylist creating trend-setting looks for our clientele. Must have a strong portfolio and mastery of cutting, coloring, and styling techniques." },
  { title: "Braiding Specialist", department: "Braiding", type: "Full-time", experience: "2+ years", description: "Expert in all braiding techniques including knotless, box braids, twists, and cornrows. Precision and speed are key." },
  { title: "Customer Experience Lead", department: "Front Desk", type: "Full-time", experience: "1+ years", description: "First point of contact for clients. Manage bookings, consultations, and ensure a world-class experience from arrival to departure." },
  { title: "Social Media Manager", department: "Marketing", type: "Part-time", experience: "2+ years", description: "Own our brand presence across Instagram, TikTok, and YouTube. Create content that showcases our work and drives engagement." },
  { title: "Apprentice Stylist", department: "Styling", type: "Full-time", experience: "Entry Level", description: "Kickstart your career with hands-on training from our senior team. Perfect for recent graduates with a passion for hair." },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-charcoal py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">Join Our Team</h1>
          <p className="text-white/60 mt-2">Be part of Lagos' most prestigious beauty brand</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-16">

        <section>
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="font-heading text-2xl font-bold text-charcoal tracking-tight">Life at MecBill Tech Salon</h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              At MecBill, we believe that great hair starts with great people. We&apos;ve built a culture where creativity thrives, 
              careers are nurtured, and every team member is empowered to grow. From competitive pay to world-class training 
              programs, we invest in our people because they are the heart of our brand.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-white border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center mb-4">
                  <benefit.icon className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-heading font-semibold text-charcoal mb-1">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-bold text-charcoal tracking-tight mb-8">Open Positions</h2>
          <div className="space-y-4">
            {positions.map((pos) => (
              <div key={pos.title} className="bg-white border border-border rounded-xl p-6 hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading font-semibold text-charcoal text-lg">{pos.title}</h3>
                      <span className="text-[10px] bg-gold/10 text-gold px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">{pos.department}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
                      <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{pos.type}</span>
                      <span className="flex items-center gap-1"><Star className="h-3 w-3" />{pos.experience}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">{pos.description}</p>
                  </div>
                  <Button className="bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold tracking-wider uppercase px-6 shrink-0">Apply Now</Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-cream rounded-2xl p-8 md:p-12 text-center">
          <div className="max-w-2xl mx-auto">
            <MessageCircle className="h-10 w-10 text-gold mx-auto mb-4" />
            <h2 className="font-heading text-2xl font-bold text-charcoal tracking-tight">Don&apos;t see your role?</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              We&apos;re always on the lookout for talented individuals. Send your CV and we&apos;ll keep you in mind for future opportunities.
            </p>
            <a href="mailto:careers@mecbilltechsalon.com" className="inline-flex items-center gap-2 mt-6 text-gold font-semibold hover:underline">
              careers@mecbilltechsalon.com <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
