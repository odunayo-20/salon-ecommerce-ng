"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, Loader2 } from "lucide-react";

interface BlogPost { id: string; title: string; slug: string; excerpt: string | null; category: string; coverImage: string | null; createdAt: string; author: { name: string | null }; viewCount: number; }

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      const params = new URLSearchParams({ isPublished: "true", limit: "50" });
      if (activeCategory !== "All") params.set("category", activeCategory);
      const res = await fetch(`/api/blog?${params}`);
      const data = await res.json();
      setPosts(data.posts || []);
      if (!data.posts?.length && activeCategory === "All") {
        const allRes = await fetch("/api/blog?isPublished=true&limit=50");
        const allData = await allRes.json();
        const cats: string[] = [...new Set((allData.posts || []).map((p: BlogPost) => p.category).filter(Boolean))] as string[];
        setCategories(["All", ...cats]);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [activeCategory]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  useEffect(() => {
    if (categories.length <= 1 && posts.length > 0) {
      const cats = [...new Set(posts.map((p) => p.category))];
      setCategories(["All", ...cats]);
    }
  }, [posts, categories.length]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
  const readTime = (text: string) => `${Math.max(1, Math.ceil(text.split(" ").length / 200))} min`;

  return (
    <div className="min-h-screen">
      <div className="bg-charcoal py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">Beauty Blog</h1>
          <p className="text-white/60 mt-2">Expert tips, trends, and inspiration for your hair journey</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-colors shrink-0 ${activeCategory === cat ? "bg-charcoal text-white border-charcoal" : "bg-white text-charcoal border-border hover:border-charcoal"}`}>{cat}</button>
            ))}
          </div>
        )}
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="h-8 w-8 text-gold animate-spin mx-auto" /></div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center"><p className="text-muted-foreground">No blog posts yet. Check back soon!</p></div>
        ) : (
          <>
            {posts[0] && (
              <Link href={`/blog/${posts[0].slug}`} className="group block mb-12">
                <div className="grid md:grid-cols-2 gap-8 bg-cream rounded-2xl overflow-hidden">
                  <div className="aspect-[4/3] bg-border/30 flex items-center justify-center text-muted-foreground text-sm">{posts[0].coverImage ? <img src={posts[0].coverImage} alt={posts[0].title} className="w-full h-full object-cover" /> : "Featured Image"}</div>
                  <div className="flex flex-col justify-center p-8">
                    <span className="text-gold text-xs font-semibold tracking-wider uppercase mb-3">{posts[0].category}</span>
                    <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal group-hover:text-gold transition-colors">{posts[0].title}</h2>
                    {posts[0].excerpt && <p className="text-muted-foreground mt-3 leading-relaxed">{posts[0].excerpt}</p>}
                    <div className="flex items-center gap-4 mt-6 text-xs text-muted-foreground">
                      <span>{posts[0].author?.name || "MecBill Team"}</span><span>·</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(posts[0].createdAt)}</span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-gold text-xs font-semibold mt-6 group-hover:gap-2.5 transition-all">Read Article <ArrowRight className="h-3.5 w-3.5" /></span>
                  </div>
                </div>
              </Link>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.slice(1).map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                  <article className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-all">
                    <div className="aspect-[16/10] bg-cream flex items-center justify-center text-muted-foreground text-sm">{post.coverImage ? <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" /> : "Image"}</div>
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-[10px] font-semibold text-gold bg-gold/10 px-2.5 py-1 rounded-full uppercase tracking-wider">{post.category}</span>
                      </div>
                      <h3 className="font-heading font-semibold text-charcoal group-hover:text-gold transition-colors line-clamp-2">{post.title}</h3>
                      {post.excerpt && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{post.excerpt}</p>}
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
                        <div className="h-6 w-6 rounded-full bg-cream flex items-center justify-center text-[10px] font-bold text-charcoal">{(post.author?.name || "M").charAt(0)}</div>
                        <div><p className="text-xs font-medium text-charcoal">{post.author?.name || "MecBill Team"}</p><p className="text-[10px] text-muted-foreground">{formatDate(post.createdAt)}</p></div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
