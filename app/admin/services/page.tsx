"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, X } from "lucide-react";

interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: string;
  description: string;
  active: boolean;
}

const initialServices: Service[] = [
  { id: "1", name: "Knotless Braids", category: "Hair", price: 25000, duration: "3 hrs", description: "Beautiful knotless braids", active: true },
  { id: "2", name: "Wig Installation", category: "Hair", price: 15000, duration: "2 hrs", description: "Professional wig installation", active: true },
  { id: "3", name: "Silk Press", category: "Hair", price: 12000, duration: "1.5 hrs", description: "Silky smooth press", active: true },
  { id: "4", name: "Natural Hair Treatment", category: "Hair", price: 8000, duration: "1 hr", description: "Deep conditioning treatment", active: true },
  { id: "5", name: "Acrylic Nails", category: "Nails", price: 5000, duration: "1 hr", description: "Custom acrylic nails", active: true },
  { id: "6", name: "Manicure", category: "Nails", price: 3000, duration: "30 min", description: "Classic manicure", active: false },
];

const emptyForm = { name: "", category: "Hair", price: 0, duration: "", description: "", active: true };

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [successMsg, setSuccessMsg] = useState("");

  const openAdd = () => {
    setEditingService(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = (s: Service) => {
    setEditingService(s);
    setFormData({ name: s.name, category: s.category, price: s.price, duration: s.duration, description: s.description, active: s.active });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingService) {
      setServices((prev) => prev.map((s) => (s.id === editingService.id ? { ...s, ...formData } : s)));
      setSuccessMsg("Service updated!");
    } else {
      const newService: Service = { id: String(Date.now()), ...formData };
      setServices((prev) => [...prev, newService]);
      setSuccessMsg("Service added!");
    }
    setShowModal(false);
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this service?")) {
      setServices((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-charcoal">Services</h1>
        <Button onClick={openAdd} className="bg-charcoal text-white hover:bg-charcoal-light rounded-full text-xs font-semibold tracking-wider uppercase px-6">
          <Plus className="w-4 h-4 mr-1" /> Add Service
        </Button>
      </div>

      {successMsg && (
        <div className="mb-4 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">{successMsg}</div>
      )}

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-cream/50">
              {["Service", "Category", "Price", "Duration", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-cream/30">
                <td className="px-5 py-4 font-medium text-charcoal">{s.name}</td>
                <td className="px-5 py-4 text-muted-foreground">{s.category}</td>
                <td className="px-5 py-4 text-charcoal">₦{s.price.toLocaleString()}</td>
                <td className="px-5 py-4 text-muted-foreground">{s.duration}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${s.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-500"}`}>
                    {s.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-4 flex gap-2">
                  <button onClick={() => openEdit(s)} className="text-gold hover:text-gold-dark text-xs font-medium flex items-center gap-1">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-600 text-xs font-medium flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-2xl max-w-lg w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-lg font-bold text-charcoal">{editingService ? "Edit Service" : "Add Service"}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" placeholder="Service name" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold">
                  <option value="Hair">Hair</option>
                  <option value="Nails">Nails</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Price (₦)</label>
                  <input type="number" value={formData.price || ""} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Duration</label>
                  <input type="text" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" placeholder="e.g. 1 hr" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" rows={3} placeholder="Service description" />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active</label>
                <button type="button" onClick={() => setFormData({ ...formData, active: !formData.active })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.active ? "bg-gold" : "bg-gray-300"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.active ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-gold text-white hover:bg-gold/90">Save Service</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
