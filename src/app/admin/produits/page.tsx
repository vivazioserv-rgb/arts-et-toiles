"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function AdminProduitsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function del(id: string) {
    if (!confirm("Supprimer ce produit ?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setProducts((p) => p.filter((x) => x._id !== id));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl">Produits</h1>
        <Link href="/admin/produits/ajouter" className="flex items-center gap-2 rounded-sm bg-[var(--primary)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[var(--primary-dark)]">
          <Plus className="h-4 w-4" /> Ajouter
        </Link>
      </div>
      {loading ? <p className="text-sm text-gray-500">Chargement…</p> : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium">Nom</th>
                <th className="px-4 py-3 font-medium">Catégorie</th>
                <th className="px-4 py-3 font-medium">Prix</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any) => (
                <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500">{p.categoryObj?.name || "-"}</td>
                  <td className="px-4 py-3">{p.basePrice.toFixed(2)}€</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${p.status === "available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {p.status === "available" ? "Disponible" : "Indisponible"}
                    </span>
                  </td>
                  <td className="flex gap-2 px-4 py-3">
                    <button className="rounded p-1 text-blue-600 hover:bg-blue-50"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => del(p._id)} className="rounded p-1 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}