"use client";

const services = [
  { id: "1", name: "Knotless Braids", category: "Hair", price: 25000, duration: "3 hrs", active: true },
  { id: "2", name: "Wig Installation", category: "Hair", price: 15000, duration: "2 hrs", active: true },
  { id: "3", name: "Silk Press", category: "Hair", price: 12000, duration: "1.5 hrs", active: true },
  { id: "4", name: "Natural Hair Treatment", category: "Hair", price: 8000, duration: "1 hr", active: true },
  { id: "5", name: "Acrylic Nails", category: "Nails", price: 5000, duration: "1 hr", active: true },
  { id: "6", name: "Manicure", category: "Nails", price: 3000, duration: "30 min", active: false },
];

export default function AdminServicesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-charcoal">Services</h1>
        <button className="bg-charcoal text-white hover:bg-charcoal-light rounded-full px-6 py-2.5 text-xs font-semibold tracking-wider uppercase">Add Service</button>
      </div>
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-cream/50">{["Service", "Category", "Price", "Duration", "Status", "Actions"].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-cream/30">
                <td className="px-5 py-4 font-medium text-charcoal">{s.name}</td>
                <td className="px-5 py-4 text-muted-foreground">{s.category}</td>
                <td className="px-5 py-4 text-charcoal">₦{s.price.toLocaleString()}</td>
                <td className="px-5 py-4 text-muted-foreground">{s.duration}</td>
                <td className="px-5 py-4"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${s.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-500"}`}>{s.active ? "Active" : "Inactive"}</span></td>
                <td className="px-5 py-4"><button className="text-gold hover:text-gold-dark text-xs font-medium">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
