"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, PenTool } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogPost { id: string; title: string; slug: string; category: string; isPublished: boolean; viewCount: number; createdAt: string; author: { name: string | null }; }

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/blog?limit=50");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-charcoal">Blog Posts</h1>
      </div>
      {loading ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center"><Loader2 className="h-6 w-6 text-gold animate-spin mx-auto" /></div>
      ) : posts.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center"><PenTool className="h-10 w-10 text-border mx-auto mb-3" /><p className="text-muted-foreground">No blog posts yet. Create one via the API.</p></div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-cream/50">{["Title", "Category", "Author", "Date", "Status", "Views"].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-cream/30">
                  <td className="px-5 py-4 font-medium text-charcoal">{p.title}</td>
                  <td className="px-5 py-4 text-muted-foreground">{p.category}</td>
                  <td className="px-5 py-4 text-muted-foreground">{p.author?.name || "—"}</td>
                  <td className="px-5 py-4 text-muted-foreground">{formatDate(p.createdAt)}</td>
                  <td className="px-5 py-4"><span className={cn("inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider", p.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{p.isPublished ? "Published" : "Draft"}</span></td>
                  <td className="px-5 py-4 text-muted-foreground">{p.viewCount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
