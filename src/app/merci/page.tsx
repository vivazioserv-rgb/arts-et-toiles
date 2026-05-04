import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import { CheckCircle2 } from "lucide-react";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function MerciPage() {
  const settings: any = db.settings.get() || {};

  return (
    <>
      <Navbar brandName={settings.brandName} />
      <Cart />
      <main className="min-h-screen bg-[var(--background)] py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="rounded-2xl bg-[var(--muted)] p-10 shadow-sm">
            <CheckCircle2 className="mx-auto h-14 w-14 text-[var(--primary)]" />
            <h1 className="mt-4 font-serif text-3xl">Merci pour votre commande</h1>
            <p className="mt-4 text-sm text-[var(--foreground)]/70">
              Nous vous confirmons la réception de votre commande. Vous recevrez un email de confirmation sous peu.
            </p>
            <Link href="/" className="mt-8 inline-block rounded-sm bg-[var(--primary)] px-8 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--background)] hover:bg-[var(--primary-dark)]">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </main>
      <Footer brandName={settings.brandName} />
    </>
  );
}