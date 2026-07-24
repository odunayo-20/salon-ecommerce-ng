import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Stylists",
  description:
    "Meet the talented stylists at MecBill Tech Salon. Browse profiles, specialties, and book with your preferred hair professional.",
};

export default function StylistsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
