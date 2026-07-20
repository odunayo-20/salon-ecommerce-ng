import type { Metadata } from "next";
import { Playfair_Display, Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MecBill Tech Salon | Luxury Hair & Beauty Experiences",
    template: "%s | MecBill Tech Salon",
  },
  description:
    "Premium natural hair care, protective styling, luxury extensions and beauty services crafted for your confidence. Book your transformation today.",
  keywords: [
    "salon Lagos",
    "natural hair salon",
    "braids salon",
    "wig installation",
    "hair extensions",
    "luxury hair salon",
    "beauty salon Nigeria",
    "protective styles",
    "silk press",
    "hair treatment",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "MecBill Tech Salon",
    title: "MecBill Tech Salon | Luxury Hair & Beauty Experiences",
    description:
      "Premium natural hair care, protective styling, luxury extensions and beauty services.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MecBill Tech Salon | Luxury Hair & Beauty Experiences",
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
              telephone: process.env.WHATSAPP_BUSINESS_NUMBER || "",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Lagos",
                addressRegion: "Lagos",
                addressCountry: "NG",
              },
              priceRange: "$$$",
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                  opens: "09:00",
                  closes: "19:00",
                },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
