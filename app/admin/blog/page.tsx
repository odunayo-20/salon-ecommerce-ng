"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2, PenTool, Plus, Pencil, Trash2, X, Search, Eye, EyeOff, Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdminBlog, useUpsertBlogPost, useDeleteBlogPost } from "@/hooks/queries";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const CATEGORIES = ["Hair Care", "Styling Tips", "Product Reviews", "Tutorials", "Industry News", "Salon Life", "General"];

const emptyForm = {
  title: "", slug: "", excerpt: "", content: "",
  coverImage: "", category: "Hair Care", tags: "",
  isPublished: false, isFeatured: false,
};

export default function AdminBlogPage() {
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<{ id: string; title: string; slug: string; excerpt: string | null; content: string; coverImage: string | null; category: string; tags: string[]; isPublished: boolean; isFeatured: boolean } | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
  const [uploading, setUploading] = useState(false);
  const [confirmState, setConfirmState] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({ open: false, title: "", message: "", onConfirm: () => {} });

  const { data, isLoading } = useAdminBlog({ search: search || undefined });
  const posts = data?.posts || [];
  const upsertPost = useUpsertBlogPost();
  const deletePost = useDeleteBlogPost();

  useEffect(() => { if (successMsg) { const t = setTimeout(() => setSuccessMsg(""), 3000); return () => clearTimeout(t); } }, [successMsg]);

  const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); setErrorMsg(""); };

  const openEdit = (p: typeof posts[0]) => {
    setEditing(p);
    setForm({
      title: p.title, slug: p.slug, excerpt: p.excerpt || "",
      content: p.content, coverImage: p.coverImage || "",
      category: p.category, tags: p.tags.join(", "),
      isPublished: p.isPublished, isFeatured: p.isFeatured,
    });
    setShowModal(true);
    setErrorMsg("");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "blog");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm((f) => ({ ...f, coverImage: data.url }));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
    } finally { setUploading(false); }
  };

  const authorId = (session?.user as Record<string, unknown>)?.id as string | undefined;

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) { setErrorMsg("Title and content are required"); return; }
    if (!editing && !authorId) { setErrorMsg("Cannot determine author"); return; }
    setSaving(true);
    setErrorMsg("");
    try {
      const payload = {
        method: editing ? "PATCH" : "POST",
        ...(editing ? { id: editing.id } : {}),
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        excerpt: form.excerpt.trim() || undefined,
        content: form.content.trim(),
        coverImage: form.coverImage.trim() || undefined,
        category: form.category,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        isPublished: form.isPublished,
        isFeatured: form.isFeatured,
        ...(!editing ? { authorId } : {}),
      };

      await upsertPost.mutateAsync(payload);
      setSuccessMsg(editing ? "Post updated" : "Post created");
      setShowModal(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    } finally { setSaving(false); }
  };

  const handleDelete = async (p: typeof posts[0]) => {
    setConfirmState({
      open: true,
      title: "Delete blog post",
      message: `Delete "${p.title}"? This cannot be undone.`,
      onConfirm: async () => {
        setConfirmState((s) => ({ ...s, open: false }));
        try {
          await deletePost.mutateAsync(p.id);
          setSuccessMsg("Post deleted");
        } catch (err) { setErrorMsg(err instanceof Error ? err.message : "Failed to delete"); }
      },
    });
  };

  const togglePublished = async (p: typeof posts[0]) => {
    try {
      await upsertPost.mutateAsync({ method: "PATCH", id: p.id, title: p.title, slug: p.slug, content: p.content, category: p.category, tags: p.tags, isPublished: !p.isPublished, isFeatured: p.isFeatured, excerpt: p.excerpt || undefined, coverImage: p.coverImage || undefined });
      setSuccessMsg(p.isPublished ? "Unpublished" : "Published");
    } catch { setErrorMsg("Failed to toggle"); }
  };

  const toggleFeatured = async (p: typeof posts[0]) => {
    try {
      await upsertPost.mutateAsync({ method: "PATCH", id: p.id, title: p.title, slug: p.slug, content: p.content, category: p.category, tags: p.tags, isPublished: p.isPublished, isFeatured: !p.isFeatured, excerpt: p.excerpt || undefined, coverImage: p.coverImage || undefined });
    } catch { setErrorMsg("Failed to toggle"); }
  };

  const filtered = posts.filter((p) => {
    if (filterStatus === "published" && !p.isPublished) return false;
    if (filterStatus === "draft" && p.isPublished) return false;
    return true;
  });

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-charcoal tracking-tight">Blog Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">{posts.length} total posts</p>
        </div>
        <Button onClick={openAdd} className="bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold tracking-wider uppercase px-6 min-h-[44px] min-w-[44px]">
          <Plus className="h-4 w-4 mr-2" />New Post
        </Button>
      </div>

      {successMsg && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between"><span>{successMsg}</span><button onClick={() => setSuccessMsg("")} className="min-h-[44px] min-w-[44px] flex items-center justify-center"><X className="h-4 w-4" /></button></div>}
      {errorMsg && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between"><span>{errorMsg}</span><button onClick={() => setErrorMsg("")} className="min-h-[44px] min-w-[44px] flex items-center justify-center"><X className="h-4 w-4" /></button></div>}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts..." className="w-full bg-white border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold min-h-[44px]" />
        </div>
        <div className="flex gap-1 bg-white border border-border rounded-lg p-1">
          {(["all", "published", "draft"] as const).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize min-h-[44px]", filterStatus === s ? "bg-charcoal text-white" : "text-muted-foreground hover:text-charcoal")}>{s}</button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center"><Loader2 className="h-6 w-6 text-gold animate-spin mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <PenTool className="h-10 w-10 text-border mx-auto mb-3" />
          <p className="text-muted-foreground">{posts.length === 0 ? "No blog posts yet" : "No posts match this filter"}</p>
          {posts.length === 0 && <Button onClick={openAdd} variant="outline" className="mt-4 rounded-full text-xs font-semibold tracking-wider uppercase min-h-[44px] min-w-[44px]"><Plus className="h-4 w-4 mr-2" />Write your first post</Button>}
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="sm:hidden divide-y divide-border">
            {filtered.map((p) => (
              <div key={p.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-charcoal truncate">{p.title}</p>
                      {p.isFeatured && <Star className="h-3 w-3 text-gold fill-gold shrink-0" />}
                    </div>
                    <code className="text-[10px] text-muted-foreground">/blog/{p.slug}</code>
                  </div>
                  <span className={cn("inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider shrink-0", p.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{p.isPublished ? "Live" : "Draft"}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="bg-cream px-2.5 py-1 rounded-full font-medium">{p.category}</span>
                  <span>{p.author?.name || "\u2014"}</span>
                  <span>{formatDate(p.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button onClick={() => togglePublished(p)} className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0", p.isPublished ? "bg-gold" : "bg-border")}>
                    <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform", p.isPublished ? "translate-x-[18px]" : "translate-x-[3px]")} />
                  </button>
                  <span className="flex-1" />
                  {p.isPublished && <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" className="p-2.5 min-h-[44px] min-w-[44px] rounded-lg text-muted-foreground hover:text-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center"><ExternalLink className="h-4 w-4" /></a>}
                  <button onClick={() => toggleFeatured(p)} className={cn("p-2.5 min-h-[44px] min-w-[44px] rounded-lg transition-colors flex items-center justify-center", p.isFeatured ? "text-gold hover:bg-gold/10" : "text-muted-foreground hover:text-gold hover:bg-gold/10")} title={p.isFeatured ? "Unfeature" : "Feature"}>
                    <Star className={cn("h-4 w-4", p.isFeatured && "fill-gold")} />
                  </button>
                  <button onClick={() => openEdit(p)} className="p-2.5 min-h-[44px] min-w-[44px] rounded-lg text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors flex items-center justify-center"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(p)} className="p-2.5 min-h-[44px] min-w-[44px] rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto hidden sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-cream/50">
                  {["Title", "Category", "Author", "Date", "Status", "Views", "Actions"].map((h) => (
                    <th key={h} className={cn("text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider", h === "Actions" && "text-right")}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-cream/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-14 rounded-lg bg-cream flex items-center justify-center shrink-0 overflow-hidden">
                          {p.coverImage ? <img src={p.coverImage} alt="" className="h-full w-full object-cover" /> : <PenTool className="h-4 w-4 text-gold" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-charcoal truncate">{p.title}</p>
                            {p.isFeatured && <Star className="h-3 w-3 text-gold fill-gold shrink-0" />}
                          </div>
                          <code className="text-[10px] text-muted-foreground">/blog/{p.slug}</code>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-[10px] bg-cream px-2.5 py-1 rounded-full text-muted-foreground font-medium">{p.category}</span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">{p.author?.name || "\u2014"}</span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">{formatDate(p.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => togglePublished(p)} className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 min-h-[44px] min-w-[44px] justify-center", p.isPublished ? "bg-gold" : "bg-border")}>
                          <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform", p.isPublished ? "translate-x-[18px]" : "translate-x-[3px]")} />
                        </button>
                        <span className={cn("inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider", p.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{p.isPublished ? "Live" : "Draft"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">{p.viewCount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {p.isPublished && <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" className="p-2.5 min-h-[44px] min-w-[44px] rounded-lg text-muted-foreground hover:text-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center"><ExternalLink className="h-4 w-4" /></a>}
                        <button onClick={() => toggleFeatured(p)} className={cn("p-2.5 min-h-[44px] min-w-[44px] rounded-lg transition-colors flex items-center justify-center", p.isFeatured ? "text-gold hover:bg-gold/10" : "text-muted-foreground hover:text-gold hover:bg-gold/10")} title={p.isFeatured ? "Unfeature" : "Feature"}>
                          <Star className={cn("h-4 w-4", p.isFeatured && "fill-gold")} />
                        </button>
                        <button onClick={() => openEdit(p)} className="p-2.5 min-h-[44px] min-w-[44px] rounded-lg text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors flex items-center justify-center"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(p)} className="p-2.5 min-h-[44px] min-w-[44px] rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-border bg-cream/30">
            <p className="text-xs text-muted-foreground">{filtered.length} posts</p>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 pb-8 pt-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-heading text-lg font-bold text-charcoal">{editing ? "Edit Post" : "New Post"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2.5 min-h-[44px] min-w-[44px] rounded-lg text-muted-foreground hover:text-charcoal hover:bg-cream transition-colors flex items-center justify-center"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {errorMsg && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{errorMsg}</div>}

              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: f.slug || slugify(e.target.value) }))} className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold min-h-[44px]" placeholder="Your amazing blog post title" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">Slug</label>
                <input type="text" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal font-mono focus:outline-none focus:border-gold min-h-[44px]" placeholder="auto-generated-from-title" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">Category</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold min-h-[44px]">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">Tags</label>
                  <input type="text" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold min-h-[44px]" placeholder="hair, tips, tutorial" />
                  <p className="text-[10px] text-muted-foreground mt-1">Comma-separated</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">Excerpt</label>
                <textarea value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} rows={2} className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold resize-none" placeholder="Brief summary shown in blog listings..." />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">Content *</label>
                <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={10} className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold resize-y font-mono" placeholder="Write your blog post content here. Separate paragraphs with blank lines." />
                <p className="text-[10px] text-muted-foreground mt-1">{form.content.split(/\s+/).filter(Boolean).length} words · ~{Math.max(1, Math.ceil(form.content.split(/\s+/).filter(Boolean).length / 200))} min read</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">Cover Image</label>
                <div className="flex items-center gap-3">
                  <input type="text" value={form.coverImage} onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))} className="flex-1 bg-white border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold min-h-[44px]" placeholder="Image URL or upload below" />
                  <label className={cn("shrink-0 flex items-center gap-2 bg-white border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal cursor-pointer hover:bg-cream transition-colors min-h-[44px] min-w-[44px] justify-center", uploading && "opacity-50 pointer-events-none")}>
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Upload
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                {form.coverImage && <div className="mt-3 h-32 rounded-lg overflow-hidden bg-cream"><img src={form.coverImage} alt="" className="w-full h-full object-cover" /></div>}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))} className="rounded border-border text-gold focus:ring-gold" />
                  <span className="text-sm text-charcoal">Publish immediately</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} className="rounded border-border text-gold focus:ring-gold" />
                  <span className="text-sm text-charcoal">Featured post</span>
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <Button variant="outline" onClick={() => setShowModal(false)} className="rounded-full text-xs font-semibold tracking-wider uppercase min-h-[44px] min-w-[44px]">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-gold text-white hover:bg-gold-dark rounded-full text-xs font-semibold tracking-wider uppercase px-8 min-h-[44px] min-w-[44px]">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={(open) => setConfirmState((s) => ({ ...s, open }))}
        title={confirmState.title}
        description={confirmState.message}
        onConfirm={confirmState.onConfirm}
      />
    </div>
  );
}
