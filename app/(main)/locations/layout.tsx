import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Locations",
  description:
    "Find MecBill Tech Salon locations near you. Visit us for premium hair care, braids, wigs, and luxury beauty services.",
};

export default function LocationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
