"use client";

const posts = [
  { id: "1", title: "The Complete Guide to Knotless Braids", category: "Protective Styles", author: "Amara J.", date: "2024-01-28", status: "published", views: 1250 },
  { id: "2", title: "5 Natural Hair Treatments at Home", category: "Natural Hair Care", author: "Fatima A.", date: "2024-01-22", status: "published", views: 890 },
  { id: "3", title: "How to Choose the Perfect Wig", category: "Beauty Tips", author: "Chioma O.", date: "2024-01-15", status: "draft", views: 0 },
];

export default function AdminBlogPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-charcoal">Blog Posts</h1>
        <button className="bg-charcoal text-white hover:bg-charcoal-light rounded-full px-6 py-2.5 text-xs font-semibold tracking-wider uppercase">New Post</button>
      </div>
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-cream/50">{["Title", "Category", "Author", "Date", "Status", "Views", "Actions"].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-cream/30">
                <td className="px-5 py-4 font-medium text-charcoal">{p.title}</td>
                <td className="px-5 py-4 text-muted-foreground">{p.category}</td>
                <td className="px-5 py-4 text-muted-foreground">{p.author}</td>
                <td className="px-5 py-4 text-muted-foreground">{p.date}</td>
                <td className="px-5 py-4"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${p.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{p.status}</span></td>
                <td className="px-5 py-4 text-muted-foreground">{p.views.toLocaleString()}</td>
                <td className="px-5 py-4"><button className="text-gold hover:text-gold-dark text-xs font-medium">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
