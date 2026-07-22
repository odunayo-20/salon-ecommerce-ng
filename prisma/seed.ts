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

const products = [
  { name: "Raw Brazilian Clipper Bundles", slug: "raw-brazilian-clipper-bundles", description: "100% raw virgin Brazilian hair. Silky, tangle-free, and can be dyed. Available in 12-30 inches.", shortDesc: "Premium raw Brazilian hair bundles", price: 85000, comparePrice: 95000, sku: "EXT-BRA-001", categorySlug: "hair-extensions", stock: 45, isFeatured: true, hairTexture: "Straight/Wavy", hairLength: "12-30 inches", hairColor: "Natural Black" },
  { name: "Raw Peruvian Body Wave Bundles", slug: "raw-peruvian-body-wave", description: "Luxurious raw Peruvian hair with a natural body wave pattern. Minimal shedding, maximum volume.", shortDesc: "Natural body wave Peruvian hair", price: 75000, comparePrice: 0, sku: "EXT-PER-001", categorySlug: "hair-extensions", stock: 30, isFeatured: false, hairTexture: "Body Wave", hairLength: "14-28 inches", hairColor: "Natural Black" },
  { name: "Clip-In Human Hair Extensions", slug: "clip-in-extensions", description: "Quick and easy clip-in extensions for instant volume and length. 7-piece set with 120g weight.", shortDesc: "Easy clip-in hair extensions", price: 35000, comparePrice: 42000, sku: "EXT-CLI-001", categorySlug: "hair-extensions", stock: 60, isFeatured: false, hairTexture: "Straight", hairLength: "16-22 inches", hairColor: "Natural Black" },

  { name: "HD Lace Frontal Wig — Body Wave", slug: "hd-lace-frontal-wig", description: "Premium HD lace frontal wig with transparent lace. Pre-plucked hairline, natural density. 150% density.", shortDesc: "HD lace frontal body wave wig", price: 120000, comparePrice: 140000, sku: "WIG-HD-001", categorySlug: "wigs", stock: 20, isFeatured: true, hairTexture: "Body Wave", hairLength: "18-26 inches", hairColor: "Natural Black" },
  { name: "5x5 HD Closure Wig — Straight", slug: "5x5-hd-closure-wig", description: "Glueless 5x5 HD closure wig for easy install. Bleached knots, pre-plucked, baby hairs included.", shortDesc: "Glueless HD closure wig", price: 85000, comparePrice: 0, sku: "WIG-HD-002", categorySlug: "wigs", stock: 25, isFeatured: false, hairTexture: "Straight", hairLength: "16-24 inches", hairColor: "Natural Black" },
  { name: "Full Lace Wig — Curly", slug: "full-lace-curly-wig", description: "Full lace wig with tight curly pattern. Versatile styling, can be put in high ponytail. 180% density.", shortDesc: "Full lace curly wig", price: 110000, comparePrice: 125000, sku: "WIG-FL-001", categorySlug: "wigs", stock: 15, isFeatured: false, hairTexture: "Deep Curly", hairLength: "16-22 inches", hairColor: "Natural Black" },

  { name: "Argan Oil Hair Serum", slug: "argan-oil-serum", description: "Moroccan argan oil serum for frizz control and shine. Heat protectant up to 230°C.", shortDesc: "Frizz control argan oil serum", price: 8500, comparePrice: 10000, sku: "HC-ARG-001", categorySlug: "hair-care", stock: 120, isFeatured: true, hairTexture: null, hairLength: null, hairColor: null },
  { name: "Shea Moisture Deep Conditioner", slug: "shea-moisture-deep-conditioner", description: "Intensive deep conditioning mask with shea butter and honey. Repairs damage, restores moisture.", shortDesc: "Deep conditioning hair mask", price: 5500, comparePrice: 0, sku: "HC-SMD-001", categorySlug: "hair-care", stock: 85, isFeatured: false, hairTexture: null, hairLength: null, hairColor: null },
  { name: "Edge Control Gel — Extra Hold", slug: "edge-control-gel", description: "Extra strong hold edge control gel. Lays edges smoothly without flaking. 48-hour hold.", shortDesc: "Extra hold edge control", price: 2500, comparePrice: 3000, sku: "HC-ECG-001", categorySlug: "hair-care", stock: 200, isFeatured: false, hairTexture: null, hairLength: null, hairColor: null },
  { name: "Wild Growth Hair Oil", slug: "wild-growth-hair-oil", description: "Natural hair growth oil with biotin, castor oil, and coconut oil. Promotes healthy growth.", shortDesc: "Natural hair growth oil", price: 4500, comparePrice: 0, sku: "HC-WGO-001", categorySlug: "hair-care", stock: 95, isFeatured: true, hairTexture: null, hairLength: null, hairColor: null },

  { name: "Premium Gel Nail Polish Set — 12 Colors", slug: "gel-nail-polish-set", description: "Professional gel nail polish set with 12 trending colors. Long-lasting, chip-resistant.", shortDesc: "12-color gel polish set", price: 15000, comparePrice: 18000, sku: "NC-GNP-001", categorySlug: "nail-care", stock: 40, isFeatured: false, hairTexture: null, hairLength: null, hairColor: null },
  { name: "Acrylic Nail Kit — Starter", slug: "acrylic-nail-kit", description: "Complete acrylic nail kit for beginners. Includes acrylic powder, liquid monomer, brushes, tips.", shortDesc: "Beginner acrylic nail kit", price: 22000, comparePrice: 28000, sku: "NC-ANK-001", categorySlug: "nail-care", stock: 35, isFeatured: false, hairTexture: null, hairLength: null, hairColor: null },

  { name: "MecBill Gift Card — ₦10,000", slug: "gift-card-10000", description: "Digital gift card worth ₦10,000. Redeemable for any service or product at MecBill Tech Salon.", shortDesc: "₦10,000 digital gift card", price: 10000, comparePrice: 0, sku: "GC-10K", categorySlug: "gift-cards", stock: 999, isFeatured: false, hairTexture: null, hairLength: null, hairColor: null },
  { name: "MecBill Gift Card — ₦25,000", slug: "gift-card-25000", description: "Digital gift card worth ₦25,000. The perfect gift for hair and beauty lovers.", shortDesc: "₦25,000 digital gift card", price: 25000, comparePrice: 0, sku: "GC-25K", categorySlug: "gift-cards", stock: 999, isFeatured: true, hairTexture: null, hairLength: null, hairColor: null },
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

  console.log("\nSeeding products...");
  for (const prod of products) {
    const existing = await prisma.product.findUnique({ where: { slug: prod.slug } });
    if (!existing) {
      const category = await prisma.category.findUnique({ where: { slug: prod.categorySlug } });
      if (!category) {
        console.log(`  Skipped: ${prod.name} (category "${prod.categorySlug}" not found)`);
        continue;
      }
      await prisma.product.create({
        data: {
          name: prod.name,
          slug: prod.slug,
          description: prod.description,
          shortDesc: prod.shortDesc,
          price: prod.price,
          comparePrice: prod.comparePrice || null,
          sku: prod.sku,
          categoryId: category.id,
          stock: prod.stock,
          isFeatured: prod.isFeatured,
          hairTexture: prod.hairTexture,
          hairLength: prod.hairLength,
          hairColor: prod.hairColor,
        },
      });
      console.log(`  Created: ${prod.name}`);
    } else {
      console.log(`  Exists:  ${prod.name}`);
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
