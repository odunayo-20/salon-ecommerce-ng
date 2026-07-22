"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft, Hash, Globe, MessageCircle, BookOpen, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlogPost {
  id: string; title: string; slug: string; excerpt: string | null; content: string;
  coverImage: string | null; category: string; tags: string[]; viewCount: number;
  createdAt: string; author: { id: string; name: string | null; image: string | null };
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/blog?slug=${slug}`);
        if (!res.ok) { setNotFound(true); return; }
        const data = await res.json();
        setPost(data.post);
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    })();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 text-gold animate-spin" /></div>;

  if (notFound || !post) {
    return (
      <div className="min-h-screen">
        <div className="bg-charcoal py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">Post Not Found</h1>
            <p className="text-white/60 mt-2">The blog post you&apos;re looking for doesn&apos;t exist.</p>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
          <Link href="/blog"><Button variant="outline" className="gap-2"><ArrowLeft className="h-4 w-4" />Back to Blog</Button></Link>
        </div>
      </div>
    );
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-NG", { month: "long", day: "numeric", year: "numeric" });
  const wordCount = post.content.split(/\s+/).length;
  const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

  return (
    <div className="min-h-screen">
      <div className="bg-charcoal py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <nav className="flex items-center justify-center gap-2 text-sm text-white/40 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link><span>/</span>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link><span>/</span>
            <span className="text-white/70">{post.title}</span>
          </nav>
          <span className="text-gold text-xs font-semibold tracking-wider uppercase mb-3 inline-block">{post.category}</span>
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">{post.title}</h1>
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-white/50">
            <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{post.author?.name || "MecBill Team"}</span>
            <span>·</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{formatDate(post.createdAt)}</span>
            <span>·</span>
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{readTime}</span>
            <span>·</span>
            <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" />{wordCount} words</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {post.coverImage && <div className="aspect-[16/9] bg-cream rounded-xl overflow-hidden mb-12"><img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" /></div>}

        <div className="prose-custom">
          {post.content.split("\n\n").map((paragraph, i) => (
            <p key={i} className="text-muted-foreground leading-relaxed mb-6">{paragraph}</p>
          ))}
        </div>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8">
            {post.tags.map((tag) => <span key={tag} className="text-[10px] bg-cream px-3 py-1 rounded-full text-muted-foreground font-medium">{tag}</span>)}
          </div>
        )}

        <div className="border-t border-border mt-12 pt-8">
          <h3 className="font-heading text-sm font-semibold text-charcoal mb-4">Share this article</h3>
          <div className="flex items-center gap-3">
            <button className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center text-gold hover:bg-gold/20 transition-colors"><Hash className="h-4 w-4" /></button>
            <button className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center text-gold hover:bg-gold/20 transition-colors"><Globe className="h-4 w-4" /></button>
            <button className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center text-gold hover:bg-gold/20 transition-colors"><MessageCircle className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="bg-cream rounded-xl p-6 mt-10 flex gap-4 items-start">
          <div className="h-14 w-14 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-lg shrink-0">{(post.author?.name || "M").charAt(0)}</div>
          <div>
            <p className="text-[10px] text-muted-foreground font-medium mb-1">Written by</p>
            <h4 className="font-heading font-semibold text-charcoal">{post.author?.name || "MecBill Team"}</h4>
          </div>
        </div>
      </div>
    </div>
  );
}
