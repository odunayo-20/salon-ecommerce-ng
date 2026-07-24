import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Consultation",
  description:
    "Book a free hair consultation at MecBill Tech Salon. Get personalized advice on protective styling, extensions, and hair care.",
};

export default function ConsultationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
