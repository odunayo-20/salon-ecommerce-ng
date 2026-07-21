"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const categories = ["All", "Booking", "Services", "Products", "Payment", "Hair Care"] as const;

type Category = (typeof categories)[number];

interface FaqItem {
  category: Exclude<Category, "All">;
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    category: "Booking",
    question: "How do I book an appointment?",
    answer: "Visit our booking page, select your service, choose a date and time that works for you, and confirm your booking. You'll receive a confirmation email with all the details.",
  },
  {
    category: "Booking",
    question: "Can I reschedule or cancel my booking?",
    answer: "Yes, you can reschedule or cancel up to 24 hours before your appointment at no charge. Cancellations within 24 hours may forfeit any deposit paid.",
  },
  {
    category: "Booking",
    question: "Do I need to pay a deposit?",
    answer: "Some services require a deposit to secure your booking. This will be clearly indicated during the booking process. The deposit is deducted from your final bill.",
  },
  {
    category: "Booking",
    question: "What if I'm running late?",
    answer: "We hold your appointment for 15 minutes. After that, we may need to adjust your service or reschedule to avoid impacting other clients.",
  },
  {
    category: "Booking",
    question: "Can I request a specific stylist?",
    answer: "Yes, during booking you can select your preferred stylist. If they're unavailable on your chosen date, we'll suggest alternative times or equally skilled stylists.",
  },
  {
    category: "Services",
    question: "What hair services do you offer?",
    answer: "We offer braids, twists, silk press, wig installation, loc maintenance, cuts, coloring, treatments, and more. Visit our services page for the full list.",
  },
  {
    category: "Services",
    question: "Do you offer bridal/event styling?",
    answer: "Yes! We offer premium bridal packages that include trial sessions, day-of styling, and on-location services. Contact us for a custom bridal consultation.",
  },
  {
    category: "Services",
    question: "How long do appointments typically take?",
    answer: "It varies by service: Quick styles take 1-2 hours, braids 3-8 hours, silk press 1-2 hours, and wig installations 2-4 hours. We'll give you an estimate when you book.",
  },
  {
    category: "Services",
    question: "Do you do consultations before styling?",
    answer: "Yes, we offer free 15-minute consultations so our stylists can assess your hair, discuss your goals, and recommend the best approach.",
  },
  {
    category: "Products",
    question: "Do you sell hair products?",
    answer: "Yes, visit our online shop for a curated selection of professional-grade hair care products, tools, and accessories.",
  },
  {
    category: "Products",
    question: "Are your products authentic?",
    answer: "100% authentic. All products are sourced directly from trusted brands and authorized distributors to ensure quality and safety.",
  },
  {
    category: "Products",
    question: "Do you offer product recommendations?",
    answer: "Yes, our stylists can recommend products tailored to your specific hair type, concerns, and goals. Just ask during your next visit or consultation.",
  },
  {
    category: "Payment",
    question: "What payment methods do you accept?",
    answer: "We accept debit/credit cards, bank transfers, Flutterwave, and Stripe for online payments. In-store we accept cash and all digital payment options.",
  },
  {
    category: "Payment",
    question: "Do you offer payment plans?",
    answer: "For services over ₦100,000 we offer split payment options. Speak to our team at booking to arrange a payment plan that works for you.",
  },
  {
    category: "Payment",
    question: "Are refunds available?",
    answer: "Please see our Return Policy for detailed information on refunds, exchanges, and eligibility criteria for product purchases.",
  },
  {
    category: "Hair Care",
    question: "How often should I get my hair done?",
    answer: "Every 4-6 weeks for most protective styles. Regular trims and treatments should be scheduled every 6-8 weeks to maintain hair health.",
  },
  {
    category: "Hair Care",
    question: "What products are best for natural hair?",
    answer: "It depends on your hair type and porosity. Our stylists can recommend the best products during a consultation. Generally, sulfate-free shampoos, deep conditioners, and natural oils are great staples.",
  },
  {
    category: "Hair Care",
    question: "How do I maintain my braids?",
    answer: "Moisturize your scalp and braids regularly, use a silk bonnet or pillowcase at night, avoid excessive tension, and visit us for touch-ups as needed.",
  },
];

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const filteredFaqs =
    activeCategory === "All" ? faqs : faqs.filter((faq) => faq.category === activeCategory);

  const grouped = filteredFaqs.reduce<Record<string, FaqItem[]>>((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-charcoal py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-white/60 mt-2">
            Everything you need to know about our services
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                activeCategory === cat
                  ? "bg-charcoal text-white"
                  : "bg-white text-muted-foreground border border-border hover:border-charcoal hover:text-charcoal"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="max-w-3xl mx-auto space-y-10">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h2 className="font-heading text-2xl font-bold text-charcoal tracking-tight mb-4">
                {category}
              </h2>
              <div className="bg-white border border-border rounded-2xl overflow-hidden divide-y divide-border">
                {items.map((faq) => (
                  <details key={faq.question} className="group">
                    <summary className="cursor-pointer flex items-center justify-between py-4 px-6 font-medium text-charcoal list-none">
                      <span className="pr-4">{faq.question}</span>
                      <ChevronDown className="h-5 w-5 text-gold shrink-0 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mt-16 text-center">
          <div className="bg-white border border-border rounded-2xl p-8">
            <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="h-7 w-7 text-gold" />
            </div>
            <h3 className="font-heading text-xl font-bold text-charcoal mb-2">
              Still have questions?
            </h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Can&apos;t find the answer you&apos;re looking for? Our team is ready to help.
            </p>
            <Link href="/contact">
              <Button className="bg-charcoal text-white hover:bg-charcoal-light rounded-full text-xs font-semibold tracking-wider uppercase px-6">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
