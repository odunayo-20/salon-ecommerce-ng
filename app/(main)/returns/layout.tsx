import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Exchanges",
  description:
    "Return and exchange policy for MecBill Tech Salon. Learn how to return products and request exchanges or refunds.",
};

export default function ReturnsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
