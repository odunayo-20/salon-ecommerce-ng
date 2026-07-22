"use client";

import { Shield, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const sections = [
  {
    title: "1. Information We Collect",
    content: [
      "Personal Information: Your name, email address, phone number, and residential address when you create an account or book a service.",
      "Payment Information: Payment card details processed securely via Stripe and Paystack. We never store your card details on our servers.",
      "Hair Profile Data: Hair type, texture preferences, product allergies, and styling history — used exclusively to personalize your salon experience.",
      "Usage Data: Browser type, IP address, pages visited, time spent on our website, and navigation patterns.",
      "Communication: Emails, chat messages, and reviews you voluntarily submit to us.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    content: [
      "Process bookings, payments, and deliver salon services.",
      "Send appointment confirmations, reminders, and follow-ups.",
      "Personalize your salon experience and tailor product recommendations to your hair profile.",
      "Improve our website functionality, service offerings, and customer experience.",
      "Send marketing communications about promotions, new services, and products — only with your explicit consent.",
      "Respond to your inquiries, support requests, and feedback.",
    ],
  },
  {
    title: "3. Information Sharing",
    content: [
      "We do NOT sell your personal information to third parties under any circumstances.",
      "Service Providers: We share data with trusted partners who assist in our operations — payment processors (Stripe, Paystack), delivery partners (GIG, DHL), and email service providers (Resend). These parties are contractually obligated to protect your data.",
      "Legal Requirements: We may disclose information when required by Nigerian law, court orders, or regulatory obligations.",
      "Business Transfers: In the event of a merger, acquisition, or sale of assets, your data may be transferred with appropriate safeguards.",
    ],
  },
  {
    title: "4. Data Security",
    content: [
      "SSL encryption for all data transmitted between your browser and our servers.",
      "Secure servers with industry-standard AES-256 encryption at rest.",
      "Regular security audits and vulnerability assessments.",
      "PCI DSS compliant payment processing through Stripe and Paystack.",
      "Strict access controls, authentication protocols, and role-based permissions for all staff.",
    ],
  },
  {
    title: "5. Cookies & Tracking",
    content: [
      "Essential Cookies: Required for core website functionality, including session management, shopping cart, and authentication.",
      "Analytics Cookies: Google Analytics helps us understand how visitors interact with our website, enabling us to improve user experience.",
      "Marketing Cookies: Used to deliver personalized advertisements based on your browsing behavior — only activated with your consent.",
      "You can manage or disable cookies at any time through your browser settings. Note that disabling essential cookies may affect website functionality.",
    ],
  },
  {
    title: "6. Your Rights (NDPR)",
    content: [
      "Under the Nigeria Data Protection Regulation (NDPR), you have the right to:",
      "Access your personal data held by us and receive a copy in a structured format.",
      "Correct inaccurate or incomplete personal data.",
      "Request deletion of your personal data where there is no compelling reason for continued processing.",
      "Opt out of marketing communications at any time by clicking the unsubscribe link or contacting us.",
      "Withdraw consent for data processing at any time, without affecting the lawfulness of prior processing.",
      "Lodge a complaint with the Nigeria Data Protection Commission (NDPC) if you believe your rights have been violated.",
    ],
  },
  {
    title: "7. Data Retention",
    content: [
      "Booking records: Retained for 3 years from the date of service for quality assurance and dispute resolution.",
      "Account data: Retained as long as your account remains active. Inactive accounts are purged after 5 years.",
      "Marketing preferences: Retained until you unsubscribe or withdraw consent.",
      "Financial records: Retained for 6 years as required by Nigerian tax law and financial regulations.",
    ],
  },
  {
    title: "8. Children's Privacy",
    content: [
      "Our services are not directed to individuals under the age of 18.",
      "We do not knowingly collect personal information from children without verified parental or guardian consent.",
      "If we discover that we have collected data from a minor without proper consent, we will promptly delete that information.",
      "Parents or guardians who believe their child has provided us with personal data should contact us immediately.",
    ],
  },
  {
    title: "9. Changes to This Policy",
    content: [
      "We may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements, or operational needs.",
      "Significant changes will be communicated via email to registered users and prominently displayed on our website.",
      "Your continued use of our website and services after changes are posted constitutes acceptance of the updated policy.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-charcoal py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-7 w-7 text-gold" />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-white/60 mt-2">How we protect your information</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm text-muted-foreground mb-2">
            <span className="font-semibold text-charcoal">Effective Date:</span> January 1,
            2024
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-10">
            At MecBill Tech Salon, we value your privacy and are committed to protecting your
            personal data. This Privacy Policy explains how we collect, use, share, and safeguard
            your information when you use our website and services.
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
              10. Contact Us
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              If you have any questions, concerns, or requests regarding this Privacy Policy or
              how we handle your personal data, please reach out to us:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-gold shrink-0" />
                <span>privacy@mecbilltechsalon.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-gold shrink-0" />
                <span>+234 800 000 0000</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-gold shrink-0" />
                <span>123 Adeola Odeku Street, Victoria Island, Lagos, Nigeria</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
