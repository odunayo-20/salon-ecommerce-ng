import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join the MecBill Tech Salon team. Explore open positions for stylists, receptionists, and beauty professionals.",
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
