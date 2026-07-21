"use client";

const customers = [
  { id: "1", name: "Adaeze Okonkwo", email: "adaeze@email.com", phone: "+234 801 234 5678", orders: 8, spent: 345000, joined: "2024-01-05" },
  { id: "2", name: "Folake Mohammed", email: "folake@email.com", phone: "+234 802 345 6789", orders: 5, spent: 215000, joined: "2024-01-10" },
  { id: "3", name: "Ngozi Adeyemi", email: "ngozi@email.com", phone: "+234 803 456 7890", orders: 12, spent: 560000, joined: "2023-11-20" },
  { id: "4", name: "Blessing Eze", email: "blessing@email.com", phone: "+234 804 567 8901", orders: 3, spent: 89000, joined: "2024-01-18" },
];

export default function AdminCustomersPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-charcoal mb-6">Customers</h1>
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-cream/50">{["Customer", "Email", "Phone", "Orders", "Total Spent", "Joined"].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-border/50 last:border-0 hover:bg-cream/30">
                <td className="px-5 py-4 font-medium text-charcoal">{c.name}</td>
                <td className="px-5 py-4 text-muted-foreground">{c.email}</td>
                <td className="px-5 py-4 text-muted-foreground">{c.phone}</td>
                <td className="px-5 py-4 text-charcoal">{c.orders}</td>
                <td className="px-5 py-4 font-medium text-charcoal">₦{c.spent.toLocaleString()}</td>
                <td className="px-5 py-4 text-muted-foreground">{c.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
