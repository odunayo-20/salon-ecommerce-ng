import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Appointment",
  description:
    "Book your next appointment at MecBill Tech Salon. Choose your stylist, service, and preferred time for braids, wigs, extensions, and more.",
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
