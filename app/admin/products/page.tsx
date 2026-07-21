"use client";

const products = [
  { id: "1", name: "Premium Brazilian Hair", category: "Hair Extensions", price: 45000, stock: 25, active: true },
  { id: "2", name: "Full Lace Wig", category: "Wigs", price: 85000, stock: 10, active: true },
  { id: "3", name: "Growth Oil Serum", category: "Hair Care", price: 4500, stock: 100, active: true },
  { id: "4", name: "Edge Control Gel", category: "Hair Care", price: 2500, stock: 120, active: true },
  { id: "5", name: "5x5 HD Closure", category: "Closures", price: 25000, stock: 30, active: true },
];

export default function AdminProductsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-charcoal">Products</h1>
        <button className="bg-charcoal text-white hover:bg-charcoal-light rounded-full px-6 py-2.5 text-xs font-semibold tracking-wider uppercase">Add Product</button>
      </div>
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-cream/50">{["Product", "Category", "Price", "Stock", "Status", "Actions"].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-cream/30">
                <td className="px-5 py-4 font-medium text-charcoal">{p.name}</td>
                <td className="px-5 py-4 text-muted-foreground">{p.category}</td>
                <td className="px-5 py-4 text-charcoal">₦{p.price.toLocaleString()}</td>
                <td className="px-5 py-4"><span className={`font-medium ${p.stock <= 10 ? "text-amber-600" : "text-charcoal"}`}>{p.stock}</span></td>
                <td className="px-5 py-4"><span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700">Active</span></td>
                <td className="px-5 py-4"><button className="text-gold hover:text-gold-dark text-xs font-medium">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
