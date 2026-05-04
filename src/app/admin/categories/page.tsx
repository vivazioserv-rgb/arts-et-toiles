"use client";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("");

  useEffect(() => {
    fetch("/api/categories?all=true", { cache: "no-store" })
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function add() {
    if (!newName.trim()) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), emoji: newEmoji.trim() || "📁", active: true }),
    });
    if (res.ok) {
      const cat = await res.json();
      setCategories((p) => [...p, cat]);
      setNewName("");
      setNewEmoji("");
    }
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cette catégorie ?")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    setCategories((p) => p.filter((x) => x._id !== id));
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl">Catégories</h1>
      {loading ? <p className="text-sm text-gray-500">Chargement…</p> : (
        <>
          <div className="mb-6 flex gap-3">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nom de la catégorie" className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <input value={newEmoji} onChange={(e) => setNewEmoji(e.target.value)} placeholder="Emoji (🧵)" className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm text-center" />
            <button onClick={add} className="rounded-sm bg-[var(--primary)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[var(--primary-dark)]">
              Ajouter
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c: any) => (
              <div key={c._id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{c.emoji || "📁"}</span>
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.active ? "Active" : "Inactive"}</p>
                  </div>
                </div>
                <button onClick={() => remove(c._id)} className="rounded p-1 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}