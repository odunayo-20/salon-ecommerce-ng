import type { Metadata } from "next";
import { Playfair_Display, Inter, Cormorant_Garamond } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "MecBill Tech Salon | Luxury Hair & Beauty",
    template: "%s | MecBill Tech Salon",
  },
  description:
    "Premium natural hair care, protective styling, luxury extensions and beauty services. Crafted for your confidence.",
  keywords: [
    "salon",
    "hair salon",
    "natural hair",
    "braids",
    "wigs",
    "extensions",
    "beauty salon",
    "Lagos salon",
    "luxury hair",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "MecBill Tech Salon",
    title: "MecBill Tech Salon | Luxury Hair & Beauty",
    description:
      "Premium natural hair care, protective styling, luxury extensions and beauty services.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MecBill Tech Salon | Luxury Hair & Beauty",
    description:
      "Premium natural hair care, protective styling, luxury extensions and beauty services.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${cormorant.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HairSalon",
              name: "MecBill Tech Salon",
              description:
                "Premium natural hair care, protective styling, luxury extensions and beauty services.",
              url: process.env.NEXT_PUBLIC_APP_URL || "https://mecbilltechsalon.com",
              priceRange: "$$",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Lagos",
                addressRegion: "Lagos",
                addressCountry: "NG",
              },
              sameAs: [],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
