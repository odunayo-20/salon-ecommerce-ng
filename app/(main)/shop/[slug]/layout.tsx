import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/structured-data";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      image: true,
      price: true,
      category: { select: { name: true } },
    },
  });

  if (!product) {
    return { title: "Product Not Found" };
  }

  const title = `${product.name} | MecBill Tech Salon`;
  const description =
    product.description?.slice(0, 160) ||
    `Shop ${product.name} at MecBill Tech Salon. Premium hair care products.`;

  const ogImage = product.image
    ? product.image.startsWith("http")
      ? product.image
      : `${APP_URL}${product.image}`
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${APP_URL}/shop/${slug}`,
      siteName: "MecBill Tech Salon",
      type: "website",
      images: ogImage ? [{ url: ogImage, width: 800, height: 800, alt: product.name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function ShopSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      name: true, description: true, image: true, price: true,
      stock: true, category: { select: { name: true } },
    },
  });

  const availability = product && product.stock > 0 ? "InStock" as const : "OutOfStock" as const;

  return (
    <>
      {product && (
        <ProductJsonLd
          name={product.name}
          description={product.description}
          image={product.image}
          price={Number(product.price)}
          availability={availability}
          url={`${APP_URL}/shop/${slug}`}
        />
      )}
      {product?.category && (
        <BreadcrumbJsonLd items={[
          { name: "Home", url: APP_URL },
          { name: "Shop", url: `${APP_URL}/shop` },
          { name: product.category.name, url: `${APP_URL}/shop?category=${encodeURIComponent(product.category.name)}` },
          { name: product.name, url: `${APP_URL}/shop/${slug}` },
        ]} />
      )}
      {children}
    </>
  );
}
