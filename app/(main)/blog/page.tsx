"use client";

import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";

const blogPosts = [
  { id: "1", title: "The Complete Guide to Knotless Braids", slug: "complete-guide-knotless-braids", excerpt: "Discover why knotless braids have become the go-to protective style.", category: "Protective Styles", author: "Amara Johnson", date: "2024-01-28", readTime: "8 min", featured: true },
  { id: "2", title: "5 Natural Hair Treatments You Can Make at Home", slug: "natural-hair-treatments-home", excerpt: "Simple, effective treatments using natural ingredients.", category: "Natural Hair Care", author: "Fatima Ali", date: "2024-01-22", readTime: "6 min" },
  { id: "3", title: "How to Choose the Perfect Wig for Your Face Shape", slug: "choose-wig-face-shape", excerpt: "Find the most flattering wig style for your face shape.", category: "Beauty Tips", author: "Chioma Obi", date: "2024-01-15", readTime: "5 min" },
  { id: "4", title: "Hair Growth Tips for Longer, Healthier Hair", slug: "hair-growth-tips", excerpt: "Expert advice and proven strategies for hair growth.", category: "Hair Growth", author: "Fatima Ali", date: "2024-01-10", readTime: "7 min" },
  { id: "5", title: "MecBill Tech: Our Journey to Lagos Top Hair Destination", slug: "mecbill-tech-journey", excerpt: "Behind the scenes of how we built a premium hair brand.", category: "Salon News", author: "MecBill Team", date: "2024-01-05", readTime: "4 min" },
  { id: "6", title: "Silk Press 101: What to Expect", slug: "silk-press-101", excerpt: "Everything you need to know about getting a silk press.", category: "Natural Hair Care", author: "Chioma Obi", date: "2024-01-01", readTime: "6 min" },
];

const categories = ["All", "Natural Hair Care", "Hair Growth", "Protective Styles", "Beauty Tips", "Salon News"];

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-charcoal py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">Beauty Blog</h1>
          <p className="text-white/60 mt-2">Expert tips, trends, and inspiration for your hair journey</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
          {categories.map((cat) => (
            <button key={cat} className="px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap border border-border hover:border-charcoal transition-colors shrink-0">{cat}</button>
          ))}
        </div>
        <Link href={`/blog/${blogPosts[0].slug}`} className="group block mb-12">
          <div className="grid md:grid-cols-2 gap-8 bg-cream rounded-2xl overflow-hidden">
            <div className="aspect-[4/3] bg-border/30 flex items-center justify-center text-muted-foreground text-sm">Featured Image</div>
            <div className="flex flex-col justify-center p-8">
              <span className="text-gold text-xs font-semibold tracking-wider uppercase mb-3">{blogPosts[0].category}</span>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal group-hover:text-gold transition-colors">{blogPosts[0].title}</h2>
              <p className="text-muted-foreground mt-3 leading-relaxed">{blogPosts[0].excerpt}</p>
              <div className="flex items-center gap-4 mt-6 text-xs text-muted-foreground">
                <span>{blogPosts[0].author}</span><span>·</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{blogPosts[0].date}</span><span>·</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{blogPosts[0].readTime}</span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-gold text-xs font-semibold mt-6 group-hover:gap-2.5 transition-all">Read Article <ArrowRight className="h-3.5 w-3.5" /></span>
            </div>
          </div>
        </Link>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.slice(1).map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group">
              <article className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-all">
                <div className="aspect-[16/10] bg-cream flex items-center justify-center text-muted-foreground text-sm">Image</div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-semibold text-gold bg-gold/10 px-2.5 py-1 rounded-full uppercase tracking-wider">{post.category}</span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime}</span>
                  </div>
                  <h3 className="font-heading font-semibold text-charcoal group-hover:text-gold transition-colors line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
                    <div className="h-6 w-6 rounded-full bg-cream flex items-center justify-center text-[10px] font-bold text-charcoal">{post.author.charAt(0)}</div>
                    <div><p className="text-xs font-medium text-charcoal">{post.author}</p><p className="text-[10px] text-muted-foreground">{post.date}</p></div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
