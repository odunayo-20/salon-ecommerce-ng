import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  // Service categories
  { name: "Braids & Twists", slug: "braids-twists", description: "All braiding and twisting services", type: "service", sortOrder: 1 },
  { name: "Natural Hair", slug: "natural-hair", description: "Natural hair care and styling", type: "service", sortOrder: 2 },
  { name: "Wigs & Weaves", slug: "wigs-weaves", description: "Wig installation, maintenance, and weave services", type: "service", sortOrder: 3 },
  { name: "Locs", slug: "locs", description: "Loc installation, retwist, and maintenance", type: "service", sortOrder: 4 },
  { name: "Nail Services", slug: "nail-services", description: "Manicure, pedicure, acrylic, and gel nails", type: "service", sortOrder: 5 },
  { name: "Color & Treatment", slug: "color-treatment", description: "Hair coloring, deep conditioning, and treatments", type: "service", sortOrder: 6 },

  // Product categories
  { name: "Hair Extensions", slug: "hair-extensions", description: "Raw bundles, clip-ins, and tape-ins", type: "product", sortOrder: 10 },
  { name: "Wigs", slug: "wigs", description: "Lace frontals, closures, and full wigs", type: "product", sortOrder: 11 },
  { name: "Hair Care", slug: "hair-care", description: "Shampoos, conditioners, oils, and serums", type: "product", sortOrder: 12 },
  { name: "Nail Care", slug: "nail-care", description: "Polish, gels, tools, and accessories", type: "product", sortOrder: 13 },
  { name: "Beauty Products", slug: "beauty-products", description: "Skincare, makeup, and beauty accessories", type: "product", sortOrder: 14 },
  { name: "Gift Cards", slug: "gift-cards", description: "Digital and physical gift cards", type: "product", sortOrder: 15 },
];

async function main() {
  console.log("Seeding categories...");

  for (const category of categories) {
    const existing = await prisma.category.findUnique({ where: { slug: category.slug } });
    if (!existing) {
      await prisma.category.create({ data: category });
      console.log(`  Created: ${category.name}`);
    } else {
      console.log(`  Exists:  ${category.name}`);
    }
  }

  console.log("Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
