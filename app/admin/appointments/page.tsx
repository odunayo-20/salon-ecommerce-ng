"use client";

const appointments = [
  { id: "APT-001", customer: "Adaeze O.", service: "Knotless Braids", stylist: "Amara J.", date: "2024-01-28", time: "10:00 AM", status: "confirmed", amount: 25000 },
  { id: "APT-002", customer: "Folake M.", service: "Silk Press", stylist: "Chioma O.", date: "2024-01-28", time: "11:30 AM", status: "in_progress", amount: 12000 },
  { id: "APT-003", customer: "Ngozi A.", service: "Wig Installation", stylist: "Chioma O.", date: "2024-01-28", time: "1:00 PM", status: "pending", amount: 15000 },
  { id: "APT-004", customer: "Blessing E.", service: "Gel Manicure", stylist: "Zainab O.", date: "2024-01-28", time: "2:30 PM", status: "completed", amount: 4500 },
];

const statusColors: Record<string, string> = { confirmed: "bg-emerald-50 text-emerald-700", in_progress: "bg-blue-50 text-blue-700", pending: "bg-amber-50 text-amber-700", completed: "bg-gray-50 text-gray-600", cancelled: "bg-red-50 text-red-600" };

export default function AdminAppointmentsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-charcoal">Appointments</h1>
        <div className="flex gap-2">
          <select className="px-4 py-2 bg-white border border-border rounded-full text-sm text-charcoal focus:outline-none focus:border-gold">
            <option>All Status</option>
            <option>Confirmed</option>
            <option>Pending</option>
            <option>Completed</option>
          </select>
        </div>
      </div>
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-cream/50">{["Ref", "Customer", "Service", "Stylist", "Date", "Time", "Status", "Amount"].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id} className="border-b border-border/50 last:border-0 hover:bg-cream/30">
                <td className="px-5 py-4 font-medium text-charcoal">{a.id}</td>
                <td className="px-5 py-4 text-muted-foreground">{a.customer}</td>
                <td className="px-5 py-4 text-charcoal">{a.service}</td>
                <td className="px-5 py-4 text-muted-foreground">{a.stylist}</td>
                <td className="px-5 py-4 text-muted-foreground">{a.date}</td>
                <td className="px-5 py-4 text-muted-foreground">{a.time}</td>
                <td className="px-5 py-4"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${statusColors[a.status]}`}>{a.status.replace("_", " ")}</span></td>
                <td className="px-5 py-4 font-medium text-charcoal">₦{a.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
