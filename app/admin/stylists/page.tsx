"use client";

const stylists = [
  { id: "1", name: "Amara Johnson", specialties: ["Braids", "Knotless Braids", "Natural Hair"], experience: "8 years", appointments: 89, rating: 4.9, active: true },
  { id: "2", name: "Chioma Obi", specialties: ["Wig Installation", "Silk Press", "Color"], experience: "6 years", appointments: 67, rating: 4.8, active: true },
  { id: "3", name: "Fatima Ali", specialties: ["Natural Hair Treatment", "Loc Maintenance"], experience: "10 years", appointments: 78, rating: 4.9, active: true },
  { id: "4", name: "Zainab Okafor", specialties: ["Acrylic", "Gel", "Manicure", "Pedicure"], experience: "5 years", appointments: 56, rating: 4.7, active: true },
];

export default function AdminStylistsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-charcoal">Stylists</h1>
        <button className="bg-charcoal text-white hover:bg-charcoal-light rounded-full px-6 py-2.5 text-xs font-semibold tracking-wider uppercase">Add Stylist</button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {stylists.map((s) => (
          <div key={s.id} className="bg-white border border-border rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-full bg-cream flex items-center justify-center shrink-0"><span className="font-heading text-lg font-semibold text-gold">{s.name.charAt(0)}</span></div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div><h3 className="font-heading font-semibold text-charcoal">{s.name}</h3><p className="text-xs text-muted-foreground">{s.experience} experience</p></div>
                  <span className="text-xs font-semibold text-gold">★ {s.rating}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {s.specialties.map((sp) => <span key={sp} className="text-[10px] bg-cream px-2 py-0.5 rounded-full text-muted-foreground">{sp}</span>)}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">{s.appointments} appointments</span>
                  <button className="text-gold hover:text-gold-dark text-xs font-medium">Edit Profile</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
