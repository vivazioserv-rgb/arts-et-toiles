"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Upload } from "lucide-react";

export default function AjouterProduitPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  // Formulaire
  const [name, setName] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [longDesc, setLongDesc] = useState("");
  const [basePrice, setBasePrice] = useState("59");
  const [delay, setDelay] = useState("48");
  const [isNew, setIsNew] = useState(true);
  const [status, setStatus] = useState("available");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Variantes
  const [flavors, setFlavors] = useState<{ name: string; surcharge: number }[]>([
    { name: "Option standard", surcharge: 0 },
  ]);
  const [sizes, setSizes] = useState<{ name: string; surcharge: number }[]>([
    { name: "Format standard", surcharge: 0 },
  ]);

  // Upload
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/categories?all=true", { cache: "no-store" })
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.url);
      } else {
        alert("Erreur lors de l'upload. Utilise une URL externe à la place.");
      }
    } catch {
      alert("L'upload n'est pas disponible pour l'instant. Colle une URL externe.");
    }
    setUploading(false);
  }

  function addFlavor() { setFlavors((p) => [...p, { name: "", surcharge: 0 }]); }
  function updateFlavor(i: number, field: string, value: any) {
    setFlavors((p) => p.map((f, idx) => idx === i ? { ...f, [field]: field === "surcharge" ? Number(value) : value } : f));
  }
  function removeFlavor(i: number) { setFlavors((p) => p.filter((_, idx) => idx !== i)); }

  function addSize() { setSizes((p) => [...p, { name: "", surcharge: 0 }]); }
  function updateSize(i: number, field: string, value: any) {
    setSizes((p) => p.map((s, idx) => idx === i ? { ...s, [field]: field === "surcharge" ? Number(value) : value } : s));
  }
  function removeSize(i: number) { setSizes((p) => p.filter((_, idx) => idx !== i)); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !basePrice) return;

    setSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          shortDesc: shortDesc.trim(),
          longDesc: longDesc.trim(),
          basePrice: Number(basePrice),
          delay: Number(delay),
          isNew,
          status,
          category: category || undefined,
          imageUrl: imageUrl || undefined,
          images: imageUrl ? [imageUrl] : [],
          flavors: flavors.filter((f) => f.name.trim()),
          sizes: sizes.filter((s) => s.name.trim()),
        }),
      });

      if (res.ok) {
        router.push("/admin/produits");
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Erreur lors de la création");
      }
    } catch {
      alert("Erreur réseau");
    }
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-8 font-serif text-3xl">Ajouter un produit</h1>

      <form onSubmit={submit} className="space-y-8">
        {/* Infos générales */}
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Informations générales</h2>
          <div className="space-y-4">
            <Input label="Nom du produit" value={name} onChange={setName} required />
            <Input label="Description courte" value={shortDesc} onChange={setShortDesc} />
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Description longue</label>
              <textarea value={longDesc} onChange={(e) => setLongDesc(e.target.value)} rows={5}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Prix de base (€)" value={basePrice} onChange={setBasePrice} type="number" required />
              <Input label="Délai (heures)" value={delay} onChange={setDelay} type="number" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Statut</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none">
                  <option value="available">Disponible</option>
                  <option value="unavailable">Indisponible</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Catégorie</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none">
                  <option value="">Sélectionner…</option>
                  {categories.map((c: any) => (
                    <option key={c._id} value={c._id}>{c.emoji} {c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} className="rounded" />
              Marquer comme Nouveau
            </label>
          </div>
        </section>

        {/* Image */}
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Image du produit</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">URL de l'image</label>
              <div className="flex gap-2">
                <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://exemple.com/image.jpg"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none" />
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
                  <Upload className="h-4 w-4" />
                  Upload
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
                </label>
              </div>
              {uploading && <p className="mt-1 text-xs text-gray-500">Upload en cours…</p>}
              <p className="mt-1 text-xs text-gray-400">Colle une URL ou upload une image. L'upload Cloudflare R2 sera activé dès la configuration.</p>
            </div>
            {imageUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={imageUrl} alt="Aperçu" className="h-40 w-full rounded-lg border border-gray-200 object-cover" />
            )}
          </div>
        </section>

        {/* Variantes : Finitions / Types de fil */}
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Finitions / Types de fil</h2>
            <button type="button" onClick={addFlavor} className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline">
              <Plus className="h-3 w-3" /> Ajouter une option
            </button>
          </div>
          <div className="space-y-2">
            {flavors.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={f.name} onChange={(e) => updateFlavor(i, "name", e.target.value)}
                  placeholder="Nom (ex: Toile tendue)" className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                <input value={f.surcharge} onChange={(e) => updateFlavor(i, "surcharge", e.target.value)}
                  placeholder="Suppl. (€)" type="number" className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                {flavors.length > 1 && (
                  <button type="button" onClick={() => removeFlavor(i)} className="rounded p-1 text-red-500 hover:bg-red-50">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Variantes : Formats / Dimensions */}
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Formats / Dimensions</h2>
            <button type="button" onClick={addSize} className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline">
              <Plus className="h-3 w-3" /> Ajouter un format
            </button>
          </div>
          <div className="space-y-2">
            {sizes.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={s.name} onChange={(e) => updateSize(i, "name", e.target.value)}
                  placeholder="Nom (ex: 40×60 cm)" className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                <input value={s.surcharge} onChange={(e) => updateSize(i, "surcharge", e.target.value)}
                  placeholder="Suppl. (€)" type="number" className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                {sizes.length > 1 && (
                  <button type="button" onClick={() => removeSize(i)} className="rounded p-1 text-red-500 hover:bg-red-50">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Submit */}
        <div className="flex gap-3">
          <button type="submit" disabled={saving || !name.trim()}
            className="rounded-sm bg-[var(--primary)] px-8 py-3 text-xs font-semibold uppercase tracking-widest text-white hover:bg-[var(--primary-dark)] disabled:opacity-60">
            {saving ? "Création en cours…" : "Créer le produit"}
          </button>
          <button type="button" onClick={() => router.back()}
            className="rounded-sm border border-gray-300 px-8 py-3 text-xs font-semibold uppercase tracking-widest text-gray-600 hover:bg-gray-50">
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, value, onChange, type, required }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      <input type={type || "text"} value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none" />
    </div>
  );
}