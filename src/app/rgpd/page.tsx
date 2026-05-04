import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function RgpdPage() {
  const settings: any = db.settings.get() || {};

  return (
    <>
      <Navbar brandName={settings.brandName} />
      <Cart />
      <main className="min-h-screen bg-[var(--background)] py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-10 flex flex-col items-center">
            <h1 className="font-serif text-5xl tracking-wider">CONFIDENTIALITÉ</h1>
            <div className="mt-3 h-px w-16 bg-[var(--primary)]" />
          </div>
          <div className="space-y-8">
            {settings.rgpd && <Section title="RGPD - Protection des données" text={settings.rgpd} />}
            {settings.cookiesPolicy && <Section title="Politique des cookies" text={settings.cookiesPolicy} />}
            {settings.cgv && <Section title="Conditions générales de vente" text={settings.cgv} />}
          </div>
        </div>
      </main>
      <Footer brandName={settings.brandName} />
    </>
  );
}

function Section({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-[var(--muted)] p-6 shadow-sm">
      <h2 className="mb-3 font-serif text-xl">{title}</h2>
      <p className="whitespace-pre-line text-sm text-[var(--foreground)]/80">{text}</p>
    </div>
  );
}