import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/book`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/shop`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/stylists`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/consultation`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/locations`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/careers`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/shipping`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/returns`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/support`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];
}
