import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import { db } from "@/lib/db";
import { siteConfig } from "@/site.config";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const settings: any = db.settings.get() || {};

  return (
    <>
      <Navbar brandName={settings.brandName} />
      <Cart />
      <main className="min-h-screen bg-[var(--background)] py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-10 flex flex-col items-center">
            <h1 className="font-serif text-5xl tracking-wider">NOTRE HISTOIRE</h1>
            <div className="mt-3 h-px w-16 bg-[var(--primary)]" />
          </div>
          <div className="prose mx-auto max-w-2xl whitespace-pre-line text-sm leading-relaxed text-[var(--foreground)]/80">
            {settings.about || "Histoire à venir…"}
          </div>
        </div>
      </main>
      <Footer brandName={settings.brandName} />
    </>
  );
}