interface ProductJsonLdProps {
  name: string;
  description: string | null;
  image: string | null;
  price: number;
  currency?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  brand?: string;
  url: string;
}

export function ProductJsonLd({
  name, description, image, price, currency = "NGN",
  availability = "InStock", brand = "MecBill Tech Salon", url,
}: ProductJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: description || undefined,
    image: image || undefined,
    brand: { "@type": "Brand", name: brand },
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: currency,
      price: price.toFixed(2),
      availability: `https://schema.org/${availability}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BlogJsonLdProps {
  title: string;
  description: string | null;
  image: string | null;
  url: string;
  author: string;
  publishedAt: string;
}

export function BlogJsonLd({
  title, description, image, url, author, publishedAt,
}: BlogJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: description || undefined,
    image: image || undefined,
    url,
    author: { "@type": "Person", name: author },
    datePublished: publishedAt,
    publisher: {
      "@type": "Organization",
      name: "MecBill Tech Salon",
      logo: { "@type": "ImageObject", url: `${process.env.NEXT_PUBLIC_APP_URL || "https://mecbilltechsalon.com"}/favicon.ico` },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BreadcrumbJsonLdProps {
  items: { name: string; url: string }[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface ServiceJsonLdProps {
  name: string;
  description: string;
  url: string;
  priceRange?: string;
}

export function ServiceJsonLd({ name, description, url, priceRange = "$$" }: ServiceJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url,
    provider: { "@type": "HairSalon", name: "MecBill Tech Salon" },
    areaServed: { "@type": "City", name: "Lagos" },
    priceRange,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
