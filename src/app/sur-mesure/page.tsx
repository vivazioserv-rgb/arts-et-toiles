"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import { siteConfig } from "@/site.config";
import { CheckCircle2 } from "lucide-react";

export default function SurMesurePage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", event: "", desc: "", date: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    setSent(true);
  }

  if (sent) {
    return (
      <>
        <Navbar />
        <Cart />
        <main className="min-h-screen bg-[var(--background)] py-16">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-[var(--primary)]" />
            <h2 className="mt-4 font-serif text-2xl">Demande envoyée</h2>
            <p className="mt-2 text-sm text-[var(--foreground)]/60">Nous vous recontacterons sous 48h ouvrées.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Cart />
      <main className="min-h-screen bg-[var(--background)] py-16">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-10 flex flex-col items-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">Pièce montée</p>
            <h1 className="text-center font-serif text-4xl leading-tight sm:text-5xl">
              UN ÉVÉNEMENT ?<br /><span className="text-[var(--primary)]">NOUS LE CÉLÉBRONS.</span>
            </h1>
            <div className="mt-4 h-px w-16 bg-[var(--primary)]" />
            <p className="mt-6 max-w-xl text-center text-sm text-[var(--foreground)]/70">
              Décrivez votre projet, nous vous proposons un devis sous 48h ouvrées.
            </p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Nom *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <Field label="Email *" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
            <Field label="Téléphone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <Field label="Date de l'événement" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Type d'événement</label>
              <select value={form.event} onChange={(e) => setForm({ ...form, event: e.target.value })} className="w-full rounded-lg border border-[var(--accent)] bg-white px-3 py-2 text-sm">
                <option value="">Sélectionnez</option>
                {(siteConfig.customOrderEvents || []).map((ev) => <option key={ev} value={ev}>{ev}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">Description de votre projet *</label>
              <textarea rows={5} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} required
                placeholder="Parfums souhaités, nombre de personnes, thème, couleurs, date…" 
                className="w-full rounded-lg border border-[var(--accent)] bg-white px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none" />
            </div>
            <button type="submit" disabled={sending}
              className="w-full rounded-sm bg-[var(--primary)] py-4 text-xs font-semibold uppercase tracking-widest text-[var(--background)] hover:bg-[var(--primary-dark)] disabled:opacity-60">
              {sending ? "Envoi…" : "Envoyer ma demande"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="w-full rounded-lg border border-[var(--accent)] bg-white px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none" />
    </div>
  );
}