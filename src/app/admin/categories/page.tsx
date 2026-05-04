"use client";
import { useEffect, useState } from "react";
import { Pencil, Trash2, Check, X, Upload } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmoji, setEditEmoji] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");

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

  function startEdit(c: any) {
    setEditing(c._id);
    setEditName(c.name);
    setEditEmoji(c.emoji || "");
    setEditImageUrl(c.imageUrl || "");
  }

  function cancelEdit() {
    setEditing(null);
    setEditName("");
    setEditEmoji("");
    setEditImageUrl("");
  }

  async function saveEdit(id: string) {
    if (!editName.trim()) return;
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName.trim(),
        emoji: editEmoji.trim() || "📁",
        imageUrl: editImageUrl || undefined,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCategories((p) => p.map((c) => (c._id === id ? updated : c)));
      cancelEdit();
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl">Catégories</h1>
      {loading ? <p className="text-sm text-gray-500">Chargement…</p> : (
        <>
          <div className="mb-6 flex gap-3">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nom de la catégorie" className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <input value={newEmoji} onChange={(e) => setNewEmoji(e.target.value)} placeholder="Emoji (🧵)" className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm text-center" />
            <button onClick={add} className="rounded-sm bg-[var(--primary)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[var(--primary-dark)] whitespace-nowrap">
              + Ajouter
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c: any) => (
              <div key={c._id} className="rounded-lg border border-gray-200 bg-white p-4">
                {editing === c._id ? (
                  // Mode édition
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input value={editEmoji} onChange={(e) => setEditEmoji(e.target.value)} placeholder="Emoji" className="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-center" />
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nom" className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm" />
                    </div>
                    <input value={editImageUrl} onChange={(e) => setEditImageUrl(e.target.value)} placeholder="URL de l'image (optionnelle)" className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm" />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => saveEdit(c._id)} className="rounded p-1 text-green-600 hover:bg-green-50"><Check className="h-4 w-4" /></button>
                      <button onClick={cancelEdit} className="rounded p-1 text-red-500 hover:bg-red-50"><X className="h-4 w-4" /></button>
                    </div>
                  </div>
                ) : (
                  // Mode affichage
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {c.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={c.imageUrl} alt={c.name} className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <span className="text-2xl">{c.emoji || "📁"}</span>
                      )}
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.active ? "Active" : "Inactive"}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(c)} className="rounded p-1 text-blue-500 hover:bg-blue-50"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => remove(c._id)} className="rounded p-1 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}