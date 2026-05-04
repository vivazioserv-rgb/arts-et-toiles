"use client";
import { useEffect, useState } from "react";
import { Save, Upload } from "lucide-react";

export default function AdminParametresPage() {
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState<"hero" | "commission" | null>(null);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setForm(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function update(key: string, value: any) {
    setForm((prev: any) => ({ ...prev, [key]: value }));
    setSuccess(false);
  }

  async function handleUpload(field: "heroImageUrl" | "commissionImageUrl", e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const label = field === "heroImageUrl" ? "hero" : "commission";
    setUploading(label);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        if (data.url) update(field, data.url);
      } else {
        const err = await res.json();
        alert(err.error || "Erreur upload");
      }
    } catch {
      alert("Erreur réseau lors de l'upload");
    }
    setUploading(null);
  }

  async function save() {
    setSaving(true);
    setSuccess(false);
    try {
      const body = { ...form };
      if (body._newPassword) {
        body.adminPassword = body._newPassword;
      }
      delete body._newPassword;
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) setSuccess(true);
    } catch {}
    setSaving(false);
  }

  if (loading) return <p className="text-sm text-gray-500">Chargement…</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl">Paramètres</h1>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-sm bg-[var(--primary)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[var(--primary-dark)] disabled:opacity-60">
          <Save className="h-4 w-4" /> {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
      {success && <div className="mb-4 rounded-lg bg-green-50 p-3 text-xs text-green-700">Paramètres mis à jour.</div>}

      <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
        <Section label="Marque">
          <Field label="Nom" value={form.brandName} onChange={(v: string) => update("brandName", v)} />
          <Field label="Slogan" value={form.brandTagline} onChange={(v: string) => update("brandTagline", v)} />
        </Section>

        <Section label="Page d'accueil — Hero">
          <Field label="Titre" value={form.heroTitle} onChange={(v: string) => update("heroTitle", v)} />
          <Field label="Sous-titre" value={form.heroSubtitle} onChange={(v: string) => update("heroSubtitle", v)} large />
          <ImageFieldWithUpload
            label="Image Hero"
            value={form.heroImageUrl}
            onChange={(v) => update("heroImageUrl", v)}
            onUpload={(e) => handleUpload("heroImageUrl", e)}
            uploading={uploading === "hero"}
          />
        </Section>

        <Section label="Page d'accueil — Image section Commission / Sur-mesure">
          <ImageFieldWithUpload
            label="Image Commission"
            value={form.commissionImageUrl || ""}
            onChange={(v) => update("commissionImageUrl", v)}
            onUpload={(e) => handleUpload("commissionImageUrl", e)}
            uploading={uploading === "commission"}
          />
        </Section>

        <Section label="Contact">
          <Field label="Email" value={form.email} onChange={(v: string) => update("email", v)} />
          <Field label="Téléphone" value={form.phone} onChange={(v: string) => update("phone", v)} />
          <Field label="Zone de livraison" value={form.zone} onChange={(v: string) => update("zone", v)} />
        </Section>

        <Section label="Mot de passe admin">
          <Field label="Nouveau mot de passe" value={form._newPassword || ""} onChange={(v: string) => update("_newPassword", v)} type="password" />
          <p className="mt-1 text-xs text-gray-400">Laissez vide pour conserver le mot de passe actuel.</p>
        </Section>

        <Section label="Contenu">
          <Field label="À propos" value={form.about || ""} onChange={(v: string) => update("about", v)} large />
        </Section>
      </div>
    </div>
  );
}

function ImageFieldWithUpload({ label, value, onChange, onUpload, uploading }: {
  label: string; value: string; onChange: (v: string) => void; onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; uploading: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      <div className="flex gap-2">
        <input type="url" value={value} onChange={(e) => onChange(e.target.value)}
          placeholder="https://exemple.com/image.jpg"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none" />
        <label className={`flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 ${uploading ? "opacity-50" : ""}`}>
          <Upload className="h-4 w-4" />
          {uploading ? "..." : "Upload"}
          <input type="file" accept="image/*" onChange={onUpload} className="hidden" disabled={uploading} />
        </label>
      </div>
      {value && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={value} alt="Aperçu" className="mt-2 h-32 w-full rounded-lg border border-gray-200 object-cover" />
      )}
    </div>
  );
}

function ImagePreview({ url }: { url?: string }) {
  if (!url) return null;
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src={url} alt="Aperçu" className="mt-2 h-32 w-full rounded-lg border border-gray-200 object-cover" />
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, large, type }: { label: string; value: string; onChange: (v: string) => void; large?: boolean; type?: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      {large ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={5} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none" />
      ) : (
        <input type={type || "text"} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none" />
      )}
    </div>
  );
}