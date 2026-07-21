"use client";

import Link from "next/link";
import { Calendar, Clock, ArrowLeft, ArrowRight, Hash, Globe, MessageCircle, BookOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  wordCount: number;
  content: { subheading?: string; text: string }[];
}

const blogPosts: Record<string, BlogPost> = {
  "complete-guide-knotless-braids": {
    id: "1",
    title: "The Complete Guide to Knotless Braids",
    slug: "complete-guide-knotless-braids",
    excerpt: "Discover why knotless braids have become the go-to protective style for natural hair.",
    category: "Protective Styles",
    author: "Amara Johnson",
    authorRole: "Senior Hair Stylist at MecBill Tech",
    date: "January 28, 2024",
    readTime: "8 min read",
    wordCount: 1840,
    content: [
      {
        text: "Knotless braids have taken the hair world by storm, and for good reason. Unlike traditional box braids that start with a knot at the scalp, knotless braids use a feed-in technique that creates a seamless, natural-looking finish. This method not only looks more realistic but also puts significantly less tension on your scalp, making it a preferred choice for those with sensitive skin or fragile hairlines.",
      },
      {
        subheading: "What Are Knotless Braids?",
        text: "Knotless braids are a type of box braid that begins with your natural hair and gradually feeds in small pieces of braiding hair as the braid progresses. The result is a flat, smooth braid that lies flush against the scalp without the bulky knot found in traditional box braids. They can be styled in various lengths, from shoulder-length bob braids to waist-length goddess braids, and work beautifully with both synthetic and human hair extensions.",
      },
      {
        subheading: "Benefits of Choosing Knotless Braids",
        text: "The most significant advantage of knotless braids is the reduced tension on your scalp. Traditional braids can cause discomfort, headaches, and even traction alopecia over time. Knotless braids distribute the weight of the extensions more evenly, allowing for a comfortable wearing experience from day one. Additionally, they offer a more natural appearance because the braids start thin at the root and gradually thicken, mimicking the way natural hair grows.",
      },
      {
        text: "Another major benefit is versatility. Knotless braids can be styled in updos, ponytails, half-up styles, and more without the bulkiness that traditional braids sometimes create. They also tend to be lighter, which means less strain on your neck and shoulders. For those transitioning from relaxed to natural hair, knotless braids serve as an excellent protective style that keeps your natural hair tucked away while looking effortlessly chic.",
      },
      {
        subheading: "How to Prepare for Your Knotless Braid Appointment",
        text: "Preparation is key to getting the best results from your knotless braids. Start by washing and deep conditioning your hair a few days before your appointment. A clean, well-moisturized scalp will make the braiding process smoother and help your style last longer. Make sure your hair is completely dry before your appointment, as braiding damp hair can lead to mildew and an unpleasant odor after a few days.",
      },
      {
        text: "Communication with your stylist is equally important. Bring reference photos of the exact style you want, including the length, thickness, and parting pattern. Discuss any concerns you have about scalp sensitivity, and don't hesitate to speak up during the braiding process if you feel any discomfort. At MecBill Tech, our stylists are trained to work with a gentle hand, ensuring your knotless braids are both beautiful and comfortable.",
      },
    ],
  },
  "natural-hair-treatments-home": {
    id: "2",
    title: "5 Natural Hair Treatments You Can Make at Home",
    slug: "natural-hair-treatments-home",
    excerpt: "Simple, effective treatments using natural ingredients from your kitchen.",
    category: "Natural Hair Care",
    author: "Fatima Ali",
    authorRole: "Hair Care Specialist at MecBill Tech",
    date: "January 22, 2024",
    readTime: "6 min read",
    wordCount: 1200,
    content: [
      {
        text: "You don't need to spend a fortune on hair products to keep your natural hair healthy and moisturized. Some of the most effective hair treatments can be made with ingredients you already have in your kitchen. These homemade treatments are free from harsh chemicals and can be customized to suit your specific hair needs.",
      },
      {
        subheading: "1. Honey and Olive Oil Deep Conditioner",
        text: "Honey is a natural humectant, meaning it draws moisture from the air into your hair. When combined with olive oil, which is rich in fatty acids and antioxidants, you get a deeply conditioning treatment that softens and strengthens your hair. Mix three tablespoons of raw honey with two tablespoons of extra virgin olive oil, warm it slightly, and apply it from root to tip. Cover your hair with a plastic cap and leave it on for 30 minutes before shampooing out.",
      },
      {
        subheading: "2. Banana and Coconut Milk Mask",
        text: "Bananas are packed with potassium, silica, and natural oils that help prevent breakage and improve elasticity. Coconut milk provides hydration and shine. Blend one ripe banana with half a cup of coconut milk until smooth, then apply to clean, damp hair. Let it sit for 20 to 30 minutes. Make sure to blend thoroughly to avoid chunks that can get stuck in your hair.",
      },
      {
        subheading: "3. Rice Water Rinse for Growth",
        text: "Rice water has been used for centuries in Asian cultures for achieving long, strong hair. The starch in rice water coats the hair shaft, providing a protective layer that reduces friction and breakage. Simply rinse half a cup of rice, then soak the rice in two cups of water for 12 to 24 hours. Strain the water and use it as a final rinse after shampooing. Leave it on for 5 to 10 minutes before rinsing with cool water.",
      },
      {
        subheading: "4. Avocado and Egg Protein Treatment",
        text: "Avocado is loaded with vitamins B and E, which help repair and strengthen hair at the cellular level. Eggs provide protein, which is essential for maintaining the structural integrity of your hair. Mash one ripe avocado and mix it with one egg until you get a smooth paste. Apply to damp hair, cover with a shower cap, and leave on for 20 minutes. Rinse with cool water to prevent the egg from cooking in your hair.",
      },
      {
        text: "Incorporating these natural treatments into your hair care routine once or twice a month can make a noticeable difference in the health and appearance of your natural hair. Remember to always patch test new ingredients and listen to what your hair needs. Every strand is unique, and what works for one person may not work for another.",
      },
    ],
  },
  "choose-wig-face-shape": {
    id: "3",
    title: "How to Choose the Perfect Wig for Your Face Shape",
    slug: "choose-wig-face-shape",
    excerpt: "Find the most flattering wig style for your face shape.",
    category: "Beauty Tips",
    author: "Chioma Obi",
    authorRole: "Beauty Consultant at MecBill Tech",
    date: "January 15, 2024",
    readTime: "5 min read",
    wordCount: 980,
    content: [
      {
        text: "Choosing the right wig is about more than just picking a color and length you like. Your face shape plays a huge role in how different wig styles will look on you. Understanding your face shape and which styles complement it can make the difference between a wig that looks natural and one that feels off. Let's break down the most common face shapes and the wig styles that work best for each.",
      },
      {
        subheading: "Oval Face Shape",
        text: "If you have an oval face, you're in luck. This face shape is considered the most versatile because of its balanced proportions. Almost any wig style will work on an oval face, from short bobs to long, flowing layers. The key is to avoid styles that add too much volume at the top, as this can elongate your face further. Straight or slightly wavy wigs in medium to long lengths are particularly flattering.",
      },
      {
        subheading: "Round Face Shape",
        text: "For round faces, the goal is to create the illusion of length and add angles. Look for wigs with layers that fall below the chin, as these will elongate your face. A long bob or a wig with side-swept bangs can do wonders for softening the fullness of a round face. Avoid short, voluminous styles that can make your face appear wider. V-part wigs and lace frontals with a side part are excellent choices.",
      },
      {
        subheading: "Heart Face Shape",
        text: "Heart-shaped faces have a wider forehead and a narrower chin. The best wig styles for this face shape are those that add volume at the chin level to balance the proportions. Chin-length bobs, wavy styles, and wigs with layers that start below the chin are ideal. Avoid heavy bangs and styles that add volume at the top of the head, as these will emphasize the width of the forehead.",
      },
      {
        text: "At MecBill Tech, our consultants can help you determine your face shape and recommend the perfect wig to complement your features. We carry a wide range of premium wigs in various styles, lengths, and textures so you can find your perfect match. Visit us for a personalized fitting and take the guesswork out of choosing your next wig.",
      },
    ],
  },
};

const allPosts = Object.values(blogPosts);

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts[slug];

  if (!post) {
    return (
      <div className="min-h-screen">
        <div className="bg-charcoal py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">Post Not Found</h1>
            <p className="text-white/60 mt-2">The blog post you&apos;re looking for doesn&apos;t exist.</p>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
          <Link href="/blog">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const relatedPosts = allPosts.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <div className="min-h-screen">
      <div className="bg-charcoal py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <nav className="flex items-center justify-center gap-2 text-sm text-white/40 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-white/70">{post.title}</span>
          </nav>
          <span className="text-gold text-xs font-semibold tracking-wider uppercase mb-3 inline-block">{post.category}</span>
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">{post.title}</h1>
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-white/50">
            <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{post.author}</span>
            <span>·</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{post.date}</span>
            <span>·</span>
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{post.readTime}</span>
            <span>·</span>
            <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" />{post.wordCount} words</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="aspect-[16/9] bg-cream rounded-xl flex items-center justify-center text-muted-foreground text-sm mb-12">Featured Image</div>

        <div className="prose-custom">
          {post.content.map((block, index) => (
            <div key={index}>
              {block.subheading && (
                <h2 className="font-heading text-xl font-semibold text-charcoal mt-8 mb-4">{block.subheading}</h2>
              )}
              <p className="text-muted-foreground leading-relaxed mb-6">{block.text}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-border mt-12 pt-8">
          <h3 className="font-heading text-sm font-semibold text-charcoal mb-4">Share this article</h3>
          <div className="flex items-center gap-3">
            <button className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center text-gold hover:bg-gold/20 transition-colors">
              <Hash className="h-4 w-4" />
            </button>
            <button className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center text-gold hover:bg-gold/20 transition-colors">
              <Globe className="h-4 w-4" />
            </button>
            <button className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center text-gold hover:bg-gold/20 transition-colors">
              <MessageCircle className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="bg-cream rounded-xl p-6 mt-10 flex gap-4 items-start">
          <div className="h-14 w-14 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-lg shrink-0">{post.author.charAt(0)}</div>
          <div>
            <p className="text-[10px] text-muted-foreground font-medium mb-1">Written by</p>
            <h4 className="font-heading font-semibold text-charcoal">{post.author}</h4>
            <p className="text-sm text-muted-foreground mt-1">{post.authorRole}</p>
          </div>
        </div>
      </div>

      <div className="bg-cream py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-2xl font-bold text-charcoal tracking-tight text-center mb-8">You Might Also Like</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.map((related) => (
              <Link key={related.id} href={`/blog/${related.slug}`} className="group">
                <article className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-all">
                  <div className="aspect-[16/10] bg-cream flex items-center justify-center text-muted-foreground text-sm">Image</div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[10px] font-semibold text-gold bg-gold/10 px-2.5 py-1 rounded-full uppercase tracking-wider">{related.category}</span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{related.readTime}</span>
                    </div>
                    <h3 className="font-heading font-semibold text-charcoal group-hover:text-gold transition-colors line-clamp-2">{related.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{related.excerpt}</p>
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
                      <div className="h-6 w-6 rounded-full bg-cream flex items-center justify-center text-[10px] font-bold text-charcoal">{related.author.charAt(0)}</div>
                      <div><p className="text-xs font-medium text-charcoal">{related.author}</p><p className="text-[10px] text-muted-foreground">{related.date}</p></div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 left-4 right-4 md:hidden z-50">
        <Link href="/booking">
          <Button className="w-full bg-gold text-charcoal hover:bg-gold/90 font-semibold shadow-lg">Book Appointment</Button>
        </Link>
      </div>
    </div>
  );
}
