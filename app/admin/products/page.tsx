"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, X } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  active: boolean;
}

const initialProducts: Product[] = [
  { id: "1", name: "Premium Brazilian Hair", category: "Hair Extensions", price: 45000, stock: 25, description: "100% virgin Brazilian hair", active: true },
  { id: "2", name: "Full Lace Wig", category: "Wigs", price: 85000, stock: 10, description: "Premium full lace wig", active: true },
  { id: "3", name: "Growth Oil Serum", category: "Hair Care", price: 4500, stock: 100, description: "Natural growth oil", active: true },
  { id: "4", name: "Edge Control Gel", category: "Hair Care", price: 2500, stock: 120, description: "Strong hold edge control", active: true },
  { id: "5", name: "5x5 HD Closure", category: "Closures", price: 25000, stock: 30, description: "Transparent HD closure", active: true },
];

const emptyForm = { name: "", category: "Hair Extensions", price: 0, stock: 0, description: "", active: true };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [successMsg, setSuccessMsg] = useState("");

  const openAdd = () => {
    setEditingProduct(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({ name: p.name, category: p.category, price: p.price, stock: p.stock, description: p.description, active: p.active });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingProduct) {
      setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? { ...p, ...formData } : p)));
      setSuccessMsg("Product updated!");
    } else {
      const newProduct: Product = { id: String(Date.now()), ...formData };
      setProducts((prev) => [...prev, newProduct]);
      setSuccessMsg("Product added!");
    }
    setShowModal(false);
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this product?")) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-charcoal">Products</h1>
        <Button onClick={openAdd} className="bg-charcoal text-white hover:bg-charcoal-light rounded-full text-xs font-semibold tracking-wider uppercase px-6">
          <Plus className="w-4 h-4 mr-1" /> Add Product
        </Button>
      </div>

      {successMsg && (
        <div className="mb-4 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">{successMsg}</div>
      )}

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-cream/50">
              {["Product", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-cream/30">
                <td className="px-5 py-4 font-medium text-charcoal">{p.name}</td>
                <td className="px-5 py-4 text-muted-foreground">{p.category}</td>
                <td className="px-5 py-4 text-charcoal">₦{p.price.toLocaleString()}</td>
                <td className="px-5 py-4">
                  <span className={`font-medium ${p.stock <= 10 ? "text-amber-600" : "text-charcoal"}`}>{p.stock}</span>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${p.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-500"}`}>
                    {p.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-4 flex gap-2">
                  <button onClick={() => openEdit(p)} className="text-gold hover:text-gold-dark text-xs font-medium flex items-center gap-1">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-600 text-xs font-medium flex items-center gap-1">
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
              <h2 className="font-heading text-lg font-bold text-charcoal">{editingProduct ? "Edit Product" : "Add Product"}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" placeholder="Product name" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold">
                  <option value="Hair Extensions">Hair Extensions</option>
                  <option value="Wigs">Wigs</option>
                  <option value="Hair Care">Hair Care</option>
                  <option value="Nail Care">Nail Care</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Price (₦)</label>
                  <input type="number" value={formData.price || ""} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Stock</label>
                  <input type="number" value={formData.stock || ""} onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" rows={3} placeholder="Product description" />
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
              <Button onClick={handleSave} className="bg-gold text-white hover:bg-gold/90">Save Product</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
