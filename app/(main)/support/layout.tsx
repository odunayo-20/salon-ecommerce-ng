import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Get help with your MecBill Tech Salon account, orders, bookings, and more. Contact our support team for assistance.",
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
