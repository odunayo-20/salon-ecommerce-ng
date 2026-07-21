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

const services = [
  { name: "Box Braids", slug: "box-braids", description: "Classic box braids in your preferred size — small, medium, or jumbo. Includes consultation, parting, braiding, and sealing.", duration: 180, price: 25000, depositAmount: 7500, categorySlug: "braids-twists", isPopular: true, sortOrder: 1 },
  { name: "Knotless Braids", slug: "knotless-braids", description: "Painless knotless braids for a natural, lightweight feel. Feeds in hair gradually for zero tension on your edges.", duration: 240, price: 30000, depositAmount: 9000, categorySlug: "braids-twists", isPopular: true, sortOrder: 2 },
  { name: "Goddess Braids", slug: "goddess-braids", description: "Elegant goddess braids with curly ends for a bohemian, ethereal look.", duration: 210, price: 28000, depositAmount: 8400, categorySlug: "braids-twists", isPopular: false, sortOrder: 3 },
  { name: "Feed-in Braids", slug: "feed-in-braids", description: "Seamless feed-in cornrows that look natural and last for weeks. Available in various patterns.", duration: 150, price: 22000, depositAmount: 6600, categorySlug: "braids-twists", isPopular: false, sortOrder: 4 },
  { name: "Twists (Senegalese/Rope)", slug: "twists", description: "Two-strand twists inSenegalese or rope style. Lightweight, versatile, and perfect for natural hair.", duration: 150, price: 20000, depositAmount: 6000, categorySlug: "braids-twists", isPopular: false, sortOrder: 5 },

  { name: "Silk Press", slug: "silk-press", description: "Professional silk press for silky, bouncy straight hair. Includes deep conditioning and heat protection.", duration: 90, price: 15000, depositAmount: 4500, categorySlug: "natural-hair", isPopular: true, sortOrder: 10 },
  { name: "Natural Hair Treatment", slug: "natural-hair-treatment", description: "Deep conditioning treatment with protein or moisture balance depending on your hair needs.", duration: 60, price: 8000, depositAmount: 0, categorySlug: "natural-hair", isPopular: false, sortOrder: 11 },
  { name: "Blowout & Style", slug: "blowout-style", description: "Professional blowout with your choice of style — curls, waves, or straight.", duration: 75, price: 10000, depositAmount: 0, categorySlug: "natural-hair", isPopular: false, sortOrder: 12 },

  { name: "Wig Installation", slug: "wig-installation", description: "Expert lace wig installation with melting, plucking, and styling. Bring your own wig or purchase from our shop.", duration: 120, price: 20000, depositAmount: 6000, categorySlug: "wigs-weaves", isPopular: true, sortOrder: 20 },
  { name: "Wig Maintenance", slug: "wig-maintenance", description: "Refresh your installed wig — re-glue, restyle, and touch up your hairline.", duration: 60, price: 8000, depositAmount: 0, categorySlug: "wigs-weaves", isPopular: false, sortOrder: 21 },
  { name: "Weave Installation", slug: "weave-installation", description: "Sew-in weave installation with or without bonding. Full or partial tracks.", duration: 150, price: 18000, depositAmount: 5400, categorySlug: "wigs-weaves", isPopular: false, sortOrder: 22 },

  { name: "Loc Installation", slug: "loc-installation", description: "Start your loc journey with sisterlocks, traditional locs, or faux locs.", duration: 240, price: 35000, depositAmount: 10500, categorySlug: "locs", isPopular: false, sortOrder: 30 },
  { name: "Loc Retwist", slug: "loc-retwist", description: "Keep your locs fresh with a professional retwist and styling.", duration: 120, price: 15000, depositAmount: 4500, categorySlug: "locs", isPopular: true, sortOrder: 31 },

  { name: "Gel Manicure", slug: "gel-manicure", description: "Long-lasting gel manicure with your choice of color. Includes cuticle care and hand massage.", duration: 45, price: 5000, depositAmount: 0, categorySlug: "nail-services", isPopular: true, sortOrder: 40 },
  { name: "Acrylic Nails", slug: "acrylic-nails", description: "Full set or fill of custom acrylic nails. French tips, designs, and nail art available.", duration: 90, price: 8000, depositAmount: 0, categorySlug: "nail-services", isPopular: false, sortOrder: 41 },
  { name: "Spa Pedicure", slug: "spa-pedicure", description: "Luxurious spa pedicure with exfoliation, mask, massage, and polish.", duration: 60, price: 6000, depositAmount: 0, categorySlug: "nail-services", isPopular: false, sortOrder: 42 },

  { name: "Hair Coloring", slug: "hair-coloring", description: "Full or partial color, highlights, or balayage. Consultation included to find your perfect shade.", duration: 120, price: 25000, depositAmount: 7500, categorySlug: "color-treatment", isPopular: false, sortOrder: 50 },
  { name: "Deep Conditioning", slug: "deep-conditioning", description: "Intensive deep conditioning treatment for damaged or dry hair. Restores moisture and shine.", duration: 45, price: 5000, depositAmount: 0, categorySlug: "color-treatment", isPopular: false, sortOrder: 51 },
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

  console.log("\nSeeding services...");
  for (const svc of services) {
    const existing = await prisma.service.findUnique({ where: { slug: svc.slug } });
    if (!existing) {
      const category = await prisma.category.findUnique({ where: { slug: svc.categorySlug } });
      if (!category) {
        console.log(`  Skipped: ${svc.name} (category "${svc.categorySlug}" not found)`);
        continue;
      }
      await prisma.service.create({
        data: {
          name: svc.name,
          slug: svc.slug,
          description: svc.description,
          duration: svc.duration,
          price: svc.price,
          depositAmount: svc.depositAmount || null,
          categoryId: category.id,
          isPopular: svc.isPopular,
          sortOrder: svc.sortOrder,
        },
      });
      console.log(`  Created: ${svc.name}`);
    } else {
      console.log(`  Exists:  ${svc.name}`);
    }
  }

  console.log("\nDone!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
