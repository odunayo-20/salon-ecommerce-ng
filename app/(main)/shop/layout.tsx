import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Shop premium hair care products, luxury extensions, wigs, and styling accessories at MecBill Tech Salon.",
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
