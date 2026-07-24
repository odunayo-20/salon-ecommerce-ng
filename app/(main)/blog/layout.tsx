import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Tips, trends, and expert advice on natural hair care, protective styling, and beauty from MecBill Tech Salon.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
