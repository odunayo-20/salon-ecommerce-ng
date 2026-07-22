"use client";

import { FileText, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: [
      "By accessing or using the MecBill Tech Salon website and services, you agree to be bound by these Terms of Service.",
      "If you do not agree with any part of these terms, please do not use our website or services.",
      "We reserve the right to modify these terms at any time. Changes take effect upon posting to our website. Your continued use after changes are posted constitutes acceptance.",
    ],
  },
  {
    title: "2. Services",
    content: [
      "MecBill Tech Salon provides the following services: hair styling, braiding, wig installation, nail services, beauty treatments, and related consultations.",
      "E-commerce: Sale of curated hair and beauty products through our online shop.",
      "Online Booking: Schedule appointments for salon services at your convenience.",
      "Consultations & Hair Profiling: Personalized assessments to recommend the best services and products for your hair type.",
      "All services are subject to availability and may be modified or discontinued without prior notice.",
    ],
  },
  {
    title: "3. Booking & Cancellation",
    content: [
      "A deposit may be required to secure your booking. The deposit amount will be clearly communicated during the booking process.",
      "Cancellation Policy: You must cancel at least 24 hours before your scheduled appointment to avoid forfeiting your deposit.",
      "Late cancellations (less than 24 hours) or no-shows may result in the loss of your deposit.",
      "We reserve the right to reschedule appointments due to unforeseen circumstances, and will notify you as early as possible.",
      "Rescheduling must be done at least 12 hours in advance of your original appointment time.",
    ],
  },
  {
    title: "4. Pricing & Payment",
    content: [
      "All prices are displayed in Nigerian Naira (₦) unless otherwise stated.",
      "Prices are subject to change without prior notice. The price at the time of booking or purchase applies to your transaction.",
      "Payment is due at the time of service for salon appointments, or upon product delivery for online orders.",
      "Accepted payment methods: debit/credit cards, bank transfers, Paystack, and Stripe.",
      "Promotional offers and discount codes cannot be combined unless explicitly stated.",
    ],
  },
  {
    title: "5. Product Purchases",
    content: [
      "Product images on our website are for illustration purposes and may differ slightly from the actual product.",
      "We strive for accuracy in product descriptions, colors, and specifications but cannot guarantee exact representation on all screens.",
      "All product purchases are subject to our Return Policy. Please review it before making a purchase.",
      "We reserve the right to limit order quantities and to refuse or cancel orders at our discretion.",
    ],
  },
  {
    title: "6. User Accounts",
    content: [
      "You are responsible for maintaining the confidentiality and security of your account credentials.",
      "You agree to provide accurate, current, and complete information during registration and to keep your information up to date.",
      "Only one account per person is permitted. Duplicate accounts may be merged or suspended.",
      "We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.",
    ],
  },
  {
    title: "7. Intellectual Property",
    content: [
      "All content on the MecBill Tech Salon website — including logos, images, text, designs, graphics, and software — is owned by MecBill Tech Salon and protected by copyright and trademark laws.",
      "You may not reproduce, distribute, modify, create derivative works from, publicly display, or exploit any content without our prior written consent.",
      "User-generated content, including reviews and testimonials, grants MecBill Tech Salon a non-exclusive, royalty-free license to use, modify, and display that content for marketing purposes.",
    ],
  },
  {
    title: "8. Limitation of Liability",
    content: [
      "MecBill Tech Salon shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.",
      "Our total liability for any claim arising from a service or product is limited to the amount you paid for that specific service or product.",
      "We are not responsible for allergic reactions or adverse effects resulting from services or products. Please inform our team of any known allergies before your appointment.",
      "Results of hair and beauty services may vary based on individual hair type, condition, and other factors.",
    ],
  },
  {
    title: "9. Indemnification",
    content: [
      "You agree to indemnify, defend, and hold harmless MecBill Tech Salon, its owners, employees, and affiliates from any claims, liabilities, damages, or expenses arising from your misuse of our services or violation of these terms.",
      "This obligation includes reasonable legal fees and costs incurred in connection with any such claim.",
    ],
  },
  {
    title: "10. Governing Law",
    content: [
      "These Terms of Service are governed by and construed in accordance with the laws of the Federal Republic of Nigeria.",
      "Any disputes arising from these terms or your use of our services shall be subject to the exclusive jurisdiction of the courts of Nigeria.",
      "We encourage informal resolution of disputes. Before initiating legal proceedings, please contact us to attempt an amicable resolution.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-charcoal py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-7 w-7 text-gold" />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-white/60 mt-2">
            Terms and conditions for using our services
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm text-muted-foreground mb-2">
            <span className="font-semibold text-charcoal">Effective Date:</span> January 1,
            2024
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-10">
            Welcome to MecBill Tech Salon. These Terms of Service govern your use of our website,
            products, and services. By engaging with our brand, you agree to the terms outlined
            below.
          </p>

          <div className="space-y-10">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="font-heading text-lg font-semibold text-charcoal mb-3">
                  {section.title}
                </h2>
                <div className="space-y-2">
                  {section.content.map((paragraph, idx) => (
                    <p key={idx} className="text-sm text-muted-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white border border-border rounded-2xl p-8">
            <h2 className="font-heading text-lg font-semibold text-charcoal mb-4">
              11. Contact
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-gold shrink-0" />
                <span>legal@mecbilltechsalon.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-gold shrink-0" />
                <span>+234 800 000 0000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
