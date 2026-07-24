import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "Shipping policy for MecBill Tech Salon online orders. Learn about delivery times, costs, and international shipping options.",
};

export default function ShippingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
