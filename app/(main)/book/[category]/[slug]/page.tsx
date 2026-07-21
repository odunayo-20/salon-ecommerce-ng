"use client";

import Link from "next/link";
import { Clock, CheckCircle2, ChevronDown, Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const servicesData: Record<string, Record<string, {
  name: string;
  description: string;
  longDescription: string[];
  price: number;
  duration: number;
  popular?: boolean;
  includes: string[];
  stylists: string[];
  faqs: { q: string; a: string }[];
  image?: string;
}>> = {
  hair: {
    braids: {
      name: "Braids",
      price: 20000,
      duration: 150,
      description: "Classic box braids in your preferred size and length",
      longDescription: [
        "Our classic box braids are a timeless protective style that keeps your natural hair safe while looking effortlessly beautiful. Whether you prefer small, medium, or jumbo braids, our stylists will work with you to create a look that complements your style and lifestyle.",
        "We use premium braiding hair and take extra care to ensure each braid is secure without causing tension on your scalp. Our technique prioritizes both aesthetics and hair health.",
        "During your consultation, we'll discuss length, size, color, and styling options to ensure you leave the salon feeling confident and satisfied."
      ],
      includes: [
        "Pre-service consultation",
        "Hair washing and conditioning",
        "Professional braiding with premium hair",
        "Scalp treatment and oiling",
        "Styling and finishing touches",
        "Aftercare instructions"
      ],
      stylists: ["Amara Johnson", "Fatima Ali"],
      faqs: [
        { q: "How long do box braids last?", a: "With proper care, box braids can last 6-8 weeks. We recommend moisturizing your scalp regularly and wearing a silk bonnet at night." },
        { q: "Can I choose the braid size?", a: "Yes! We offer small, medium, and jumbo sizes. We'll help you choose the best size based on your desired look and hair type." },
        { q: "Will braids damage my hair?", a: "No, our technique ensures braids are not too tight and distribute weight evenly. We always prioritize the health of your natural hair." }
      ]
    },
    "knotless-braids": {
      name: "Knotless Braids",
      price: 25000,
      duration: 180,
      popular: true,
      description: "Pain-free knotless braids with a natural, seamless look",
      longDescription: [
        "Knotless braids are the modern evolution of traditional box braids, offering a more natural look with significantly less tension on your scalp. The braiding starts with your natural hair and gradually feeds in extensions, creating a seamless, flat base.",
        "This technique is ideal for anyone with sensitive scalps or those who want a more natural-looking protective style. The result is lightweight, flexible braids that move naturally.",
        "Our stylists specialize in the knotless technique and can create various sizes from micro to jumbo, with or without color."
      ],
      includes: [
        "Pre-service consultation and strand test",
        "Hair washing and deep conditioning",
        "Professional knotless braiding",
        "Feed-in technique with premium extensions",
        "Scalp treatment and moisturizing",
        "Aftercare kit and instructions"
      ],
      stylists: ["Amara Johnson", "Chioma Obi"],
      faqs: [
        { q: "Are knotless braids better than traditional braids?", a: "Knotless braids cause less tension at the root and look more natural. They're ideal for sensitive scalps and are generally more comfortable to wear." },
        { q: "How long do knotless braids take?", a: "Depending on the size and length, knotless braids typically take 3-6 hours. Larger braids take less time while micro braids can take up to 8 hours." },
        { q: "Can I swim with knotless braids?", a: "Yes! Knotless braids are great for an active lifestyle. We recommend tying them up when swimming and rinsing with fresh water afterward." }
      ]
    },
    "wig-installation": {
      name: "Wig Installation",
      price: 15000,
      duration: 120,
      description: "Professional wig install for a flawless, natural finish",
      longDescription: [
        "Our professional wig installation service ensures your wig looks completely natural and stays secure for weeks. We specialize in both lace front and full lace wig installs using the latest techniques.",
        "The process includes proper wig preparation, custom hairline mapping, secure application, and expert styling to blend seamlessly with your natural hairline.",
        "Whether you're installing a wig you purchased from our shop or bringing your own, our stylists will ensure a perfect fit and finish every time."
      ],
      includes: [
        "Wig fitting and customization",
        "Natural hair preparation and braiding down",
        "Custom hairline and parting design",
        "Glueless or adhesive installation",
        "Customized styling and cutting",
        "Edge styling and finishing"
      ],
      stylists: ["Chioma Obi"],
      faqs: [
        { q: "How long does a wig install last?", a: "A professional install can last 2-4 weeks depending on the adhesive used and your lifestyle. We offer maintenance appointments to keep it looking fresh." },
        { q: "Can I install a wig I bought elsewhere?", a: "Absolutely! Our install service works with any wig. We can also customize and trim the lace to suit your face shape." },
        { q: "Will the installation damage my hair?", a: "No, our technique protects your natural hair underneath. We use gentle products and proper braiding methods to keep your hair healthy." }
      ]
    },
    "silk-press": {
      name: "Silk Press",
      price: 12000,
      duration: 90,
      popular: true,
      description: "Silky smooth straightening treatment without chemicals",
      longDescription: [
        "A silk press is the ultimate way to achieve silky, straight hair without using chemicals. Our stylists use professional-grade tools and heat protectants to transform your natural hair into a smooth, glossy style that moves beautifully.",
        "The process includes a thorough wash and deep conditioning treatment, followed by a meticulous blow-dry and flat iron technique that seals in moisture while creating lasting straightness.",
        "Unlike a traditional press, our silk press preserves your curl pattern so you can revert back to your natural texture whenever you want."
      ],
      includes: [
        "Clarifying shampoo wash",
        "Deep conditioning treatment",
        "Heat protectant application",
        "Professional blow-dry",
        "Precision flat iron press",
        "Silk finishing and styling"
      ],
      stylists: ["Amara Johnson", "Chioma Obi"],
      faqs: [
        { q: "How long will a silk press last?", a: "With proper care and humidity protection, a silk press can last 1-2 weeks. Avoid moisture and wear a silk bonnet at night for best results." },
        { q: "Is a silk press damaging?", a: "When done by a professional with proper heat protection, a silk press is safe. We use temperature-controlled tools suited to your hair type." },
        { q: "Can I do a silk press on color-treated hair?", a: "Yes, silk press works well on color-treated hair. We adjust our techniques and products to protect your color investment." }
      ]
    },
    "loc-maintenance": {
      name: "Loc Maintenance",
      price: 15000,
      duration: 120,
      description: "Expert retwisting, styling, and care for your locs",
      longDescription: [
        "Our loc maintenance service keeps your locs healthy, neat, and beautifully styled. From retwisting new growth to repairing thinning areas, our locticians provide comprehensive care for all types of locs.",
        "Whether you have traditional locs, sisterlocks, faux locs, or interlocks, our team has the expertise to maintain and enhance your style with precision and care.",
        "Regular maintenance every 4-6 weeks is recommended to prevent unraveling and maintain a polished look."
      ],
      includes: [
        "Scalp assessment and cleansing",
        "New growth retwisting",
        "Loc tightening and maintenance",
        "Styling and shaping",
        "Oil treatment for scalp health",
        "Personalized care consultation"
      ],
      stylists: ["Fatima Ali"],
      faqs: [
        { q: "How often should I get loc maintenance?", a: "We recommend visiting every 4-6 weeks to maintain neatness and prevent new growth from becoming unmanageable." },
        { q: "Can you fix thinning locs?", a: "Yes, we offer repair services for thinning or damaged locs. Early intervention is best, so don't wait to address any concerns." },
        { q: "Do you offer loc styling?", a: "Yes! We can style your locs in various updos, buns, barrel twists, and creative designs for special occasions or everyday wear." }
      ]
    },
    "natural-hair-treatment": {
      name: "Natural Hair Treatment",
      price: 8000,
      duration: 60,
      description: "Deep conditioning and restorative treatment for natural hair",
      longDescription: [
        "Our natural hair treatment is designed to restore moisture, strengthen strands, and revitalize your curls. Using premium natural ingredients and professional-grade products, we create a customized treatment plan based on your hair's specific needs.",
        "This service is perfect for anyone experiencing dryness, breakage, or dullness. Our deep conditioning and protein treatments work together to rebuild hair health from the inside out.",
        "You'll leave the salon with soft, hydrated, and bouncy curls that look and feel their absolute best."
      ],
      includes: [
        "Hair type and scalp analysis",
        "Customized clarifying shampoo",
        "Deep conditioning treatment",
        "Steam or heat treatment",
        "Leave-in conditioning and moisturizing",
        "Detangling and styling"
      ],
      stylists: ["Fatima Ali", "Amara Johnson"],
      faqs: [
        { q: "How often should I get a hair treatment?", a: "We recommend a treatment every 4-6 weeks, or more frequently if your hair is particularly dry or damaged." },
        { q: "Can I get a treatment on locs?", a: "Yes, our treatments are suitable for all natural hair types including locs. We'll customize the treatment to your specific needs." },
        { q: "What products do you use?", a: "We use professional-grade products featuring natural ingredients like shea butter, coconut oil, and keratin. All products are sulfate-free and paraben-free." }
      ]
    }
  },
  nails: {
    acrylic: {
      name: "Acrylic Nails",
      price: 5000,
      duration: 60,
      description: "Long-lasting acrylic extensions in any shape and design",
      longDescription: [
        "Our acrylic nail service creates beautiful, durable nail extensions that look and feel natural. Whether you prefer classic French tips, bold colors, or intricate nail art, our nail technicians bring your vision to life.",
        "We use high-quality acrylic powders and liquids that are odor-minimized and long-lasting. Our application technique ensures a natural look with no lifting for up to 3 weeks.",
        "Choose from a wide range of shapes including coffin, stiletto, almond, square, and round to match your personal style."
      ],
      includes: [
        "Nail shaping and cuticle care",
        "Professional acrylic application",
        "Your choice of shape",
        "Two coats of gel polish",
        "Nail art or design (up to 3 nails)",
        "Cuticle oil and hand massage"
      ],
      stylists: ["Zainab Okafor"],
      faqs: [
        { q: "How long do acrylic nails last?", a: "Acrylic nails typically last 2-3 weeks before needing a fill or new set. Avoid using your nails as tools to extend their lifespan." },
        { q: "Are acrylic nails damaging?", a: "When properly applied and removed by a professional, acrylics are safe. Never peel or pick them off as this can damage your natural nails." },
        { q: "Can I add nail art?", a: "Absolutely! Our service includes nail art on up to 3 nails. Additional nail art designs are available for a small extra charge." }
      ]
    },
    gel: {
      name: "Gel Nails",
      price: 4500,
      duration: 45,
      description: "Natural-looking gel polish with a glossy, chip-free finish",
      longDescription: [
        "Gel nails offer a more natural-looking enhancement with a high-shine finish that resists chips and scratches. Gel polish is cured under UV/LED light to create a hard, durable coating that lasts significantly longer than regular polish.",
        "Perfect for those who want beautiful nails without the bulk of acrylic extensions, gel nails add strength and shine while maintaining a natural appearance.",
        "With hundreds of colors to choose from, including seasonal collections and trending shades, you'll always find the perfect color for any occasion."
      ],
      includes: [
        "Nail shaping and cuticle care",
        "Base coat application",
        "Two coats of UV/LED cured gel polish",
        "Top coat and curing",
        "Cuticle oil treatment",
        "Hand moisturizing massage"
      ],
      stylists: ["Zainab Okafor"],
      faqs: [
        { q: "How long does gel polish last?", a: "Gel polish typically lasts 2-3 weeks without chipping. It's cured under UV/LED light which makes it much more durable than regular polish." },
        { q: "Is gel polish safe?", a: "Yes, gel polish is safe when applied and removed properly. We use professional-grade products and proper removal techniques to protect your nail health." },
        { q: "Can I get gel polish over my natural nails?", a: "Yes! Gel polish is applied directly to your natural nails. It adds a thin protective layer that can actually help strengthen weak nails." }
      ]
    },
    manicure: {
      name: "Manicure",
      price: 3000,
      duration: 30,
      description: "Classic or express manicure for beautifully groomed hands",
      longDescription: [
        "A professional manicure is the foundation of well-groomed hands and nails. Our manicure service includes meticulous nail care from shaping to polishing, leaving your hands looking and feeling pampered.",
        "Choose from a classic manicure with your choice of regular or gel polish, or opt for our express service when you're short on time. Both include essential nail care and moisturizing.",
        "Our nail technicians are trained in the latest techniques and hygiene standards to ensure a safe and relaxing experience every time."
      ],
      includes: [
        "Hand soaking and cleansing",
        "Nail shaping and filing",
        "Cuticle care and pushing",
        "Hand exfoliation",
        "Polish application (regular or gel)",
        "Hand lotion and massage"
      ],
      stylists: ["Zainab Okafor"],
      faqs: [
        { q: "What's the difference between regular and gel manicure?", a: "A regular manicure uses traditional air-dry polish while gel uses UV/LED-cured polish that lasts longer and is more chip-resistant." },
        { q: "How often should I get a manicure?", a: "We recommend a manicure every 1-2 weeks to keep your nails looking their best and to maintain nail health." },
        { q: "Can I bring my own polish?", a: "Of course! We're happy to apply your personal polish. However, our gel polish can only be done with professional-grade products." }
      ]
    },
    pedicure: {
      name: "Pedicure",
      price: 4000,
      duration: 40,
      description: "Relaxing foot care treatment for soft, beautiful feet",
      longDescription: [
        "Our pedicure service provides comprehensive foot care that goes beyond just nail painting. From exfoliation to moisturizing, we ensure your feet receive the attention they deserve.",
        "Begin with a soothing foot soak, followed by gentle exfoliation to remove dead skin, callus treatment, and cuticle care. Your nails are then shaped and polished to perfection.",
        "This is the perfect self-care service to keep your feet smooth, healthy, and sandal-ready throughout the year."
      ],
      includes: [
        "Aromatherapy foot soak",
        "Foot exfoliation and scrub",
        "Callus removal treatment",
        "Cuticle care and nail shaping",
        "Polish application (regular or gel)",
        "Foot massage and moisturizing"
      ],
      stylists: ["Zainab Okafor"],
      faqs: [
        { q: "How long does a pedicure last?", a: "A pedicure typically looks great for 2-3 weeks. Regular maintenance and moisturizing will help extend the results." },
        { q: "Is pedicure good for cracked heels?", a: "Yes, our pedicure includes callus removal and deep moisturizing that helps treat cracked heels. For severe cases, we recommend our intensive foot treatment." },
        { q: "Can I get gel polish on my toes?", a: "Yes, gel polish is available for pedicures and is actually recommended for feet as it lasts much longer on toenails." }
      ]
    }
  }
};

const stylistDetails: Record<string, {
  initial: string;
  specialties: string[];
  experience: number;
  rating: number;
  bio: string;
}> = {
  "Amara Johnson": { initial: "A", specialties: ["Braids", "Knotless Braids", "Silk Press"], experience: 8, rating: 4.9, bio: "Award-winning braider with a passion for creative protective styles." },
  "Chioma Obi": { initial: "C", specialties: ["Wig Installation", "Silk Press", "Color"], experience: 6, rating: 4.8, bio: "Specialist in wig installs and creative color techniques." },
  "Fatima Ali": { initial: "F", specialties: ["Loc Maintenance", "Natural Hair Treatment", "Deep Conditioning"], experience: 10, rating: 4.9, bio: "Master loctician with a decade of experience in natural hair care." },
  "Zainab Okafor": { initial: "Z", specialties: ["Acrylic", "Gel", "Manicure", "Pedicure"], experience: 5, rating: 4.7, bio: "Creative nail artist known for intricate designs and flawless finishes." },
};

export default async function ServiceDetailPage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;

  const service = servicesData[category]?.[slug];

  if (!service) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="bg-charcoal py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">Service Not Found</h1>
            <p className="text-white/60 mt-2">The service you&apos;re looking for doesn&apos;t exist.</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center">
          <Link href="/book">
            <Button className="bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold tracking-wider uppercase px-8">
              Browse All Services
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const categoryLabel = category === "hair" ? "Hair Services" : "Nail Services";
  const deposit = Math.round(service.price * 0.3);

  const assignedStylists = service.stylists
    .map((name) => ({ name, ...stylistDetails[name] }))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-charcoal py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <nav className="flex items-center justify-center gap-2 text-sm mb-4">
            <Link href="/" className="text-white/40 hover:text-white transition-colors">Home</Link>
            <span className="text-white/20">/</span>
            <Link href="/book" className="text-white/40 hover:text-white transition-colors">Book</Link>
            <span className="text-white/20">/</span>
            <span className="text-white/40">{categoryLabel}</span>
            <span className="text-white/20">/</span>
            <span className="text-white">{service.name}</span>
          </nav>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">{service.name}</h1>
          <p className="text-white/60 mt-2">{service.description}</p>
          <div className="flex items-center justify-center gap-3 mt-4">
            {service.popular && (
              <span className="text-[10px] bg-gold/20 text-gold px-3 py-1 rounded-full font-bold uppercase tracking-wider">Popular</span>
            )}
            <span className="text-[10px] bg-white/10 text-white/70 px-3 py-1 rounded-full font-medium">₦{service.price.toLocaleString()}</span>
            <span className="text-[10px] bg-white/10 text-white/70 px-3 py-1 rounded-full font-medium">{service.duration} min</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">
            <Link href="/book" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to all services
            </Link>

            <div className="aspect-[16/9] bg-cream border border-border rounded-2xl overflow-hidden flex items-center justify-center">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
                  <span className="font-heading text-2xl font-bold text-gold">{service.name.charAt(0)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{service.name}</p>
              </div>
            </div>

            <div className="space-y-4">
              {service.longDescription.map((paragraph, i) => (
                <p key={i} className="text-sm text-muted-foreground leading-relaxed">{paragraph}</p>
              ))}
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-charcoal tracking-tight mb-5">What&apos;s Included</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {service.includes.map((item) => (
                  <div key={item} className="flex items-start gap-3 bg-white border border-border rounded-xl p-4">
                    <CheckCircle2 className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                    <span className="text-sm text-charcoal">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-charcoal tracking-tight mb-5">Our Stylists</h2>
              <div className="space-y-4">
                {assignedStylists.map((stylist) => (
                  <div key={stylist.name} className="bg-white border border-border rounded-2xl p-6 flex flex-col sm:flex-row items-start gap-5">
                    <div className="h-16 w-16 rounded-full bg-cream flex items-center justify-center shrink-0">
                      <span className="font-heading text-xl font-semibold text-gold">{stylist.initial}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-heading font-semibold text-charcoal text-lg">{stylist.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{stylist.bio}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Star className="h-4 w-4 fill-gold text-gold" />
                          <span className="text-sm font-medium text-charcoal">{stylist.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-xs text-muted-foreground">{stylist.experience} years experience</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {stylist.specialties.map((spec) => (
                          <span key={spec} className="text-[10px] bg-cream px-3 py-1 rounded-full text-muted-foreground font-medium">{spec}</span>
                        ))}
                      </div>
                      <div className="mt-4">
                        <Link href="/book">
                          <Button className="bg-charcoal text-white hover:bg-charcoal-light rounded-full text-xs font-semibold tracking-wider uppercase px-6">
                            Book with {stylist.name.split(" ")[0]}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-charcoal tracking-tight mb-5">Frequently Asked Questions</h2>
              <div className="bg-white border border-border rounded-2xl overflow-hidden divide-y divide-border">
                {service.faqs.map((faq) => (
                  <details key={faq.q} className="group">
                    <summary className="cursor-pointer flex items-center justify-between py-4 px-6 font-medium text-charcoal list-none">
                      <span className="pr-4 text-sm">{faq.q}</span>
                      <ChevronDown className="h-5 w-5 text-gold shrink-0 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</div>
                  </details>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              <div className="bg-white border border-border rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="font-heading text-xl font-bold text-charcoal">{service.name}</h3>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{service.duration} minutes</span>
                  </div>
                </div>

                <div>
                  <span className="font-heading text-3xl font-bold text-charcoal">₦{service.price.toLocaleString()}</span>
                </div>

                <div className="bg-cream rounded-xl p-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-charcoal">Deposit required: </span>
                    ₦{deposit.toLocaleString()} (30%) secures your booking. The remaining ₦{(service.price - deposit).toLocaleString()} is due at the salon.
                  </p>
                </div>

                <Link href="/book" className="block">
                  <Button className="w-full bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold tracking-wider uppercase px-8 py-3">
                    Book Now
                  </Button>
                </Link>

                <div className="text-center">
                  <Link href="/contact" className="text-xs text-muted-foreground hover:text-gold transition-colors">
                    Have a question? Contact us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
