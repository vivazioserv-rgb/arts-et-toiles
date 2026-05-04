import Link from "next/link";
import { Palette, Award, Truck, MessageCircle, Sparkles, HeartHandshake } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import AddToCartButton from "@/components/AddToCartButton";
import ProductCard from "@/components/ProductCard";
import { db } from "@/lib/db";
import { siteConfig } from "@/site.config";

export const dynamic = "force-dynamic";

const ART_FIL_CATEGORY_ID = "artafil";

async function loadData() {
  const products = db.products.all();
  const categories = db.categories.active();
  const settings = db.settings.get() || {};
  const enriched = products.map((p: any) => ({ ...p, categoryObj: p.category ? db.categories.get(p.category) : null }));
  return { products: enriched, categories, settings: JSON.parse(JSON.stringify(settings)) };
}

export default async function HomePage() {
  const { products, categories, settings } = await loadData();
  const newItems = products.filter((p: any) => p.isNew && p.status !== "unavailable").slice(0, 5);
  const displayedNew = newItems.length > 0 ? newItems : products.filter((p: any) => p.status !== "unavailable").slice(0, 5);
  const newIds = new Set(displayedNew.map((p: any) => p._id));
  const previewProducts = products.filter((p: any) => p.status !== "unavailable" && !newIds.has(p._id)).slice(0, 8);

  // Products "Art à Fil"
  const artAFilProducts = products.filter((p: any) => p.category === ART_FIL_CATEGORY_ID && p.status !== "unavailable").slice(0, 4);
  // Products digitaux (non art à fil)
  const digitalProducts = products.filter((p: any) => p.category !== ART_FIL_CATEGORY_ID && p.status !== "unavailable" && !newIds.has(p._id)).slice(0, 8);

  const brandName = settings.brandName || siteConfig.brand.name;
  const heroImage = settings.heroImageUrl || siteConfig.hero.defaultImageUrl;
  const heroTitle = settings.heroTitle || siteConfig.hero.defaultTitle;
  const heroSubtitle = settings.heroSubtitle || siteConfig.hero.defaultSubtitle;

  return (
    <>
      <Navbar brandName={brandName} />
      <Cart />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[var(--accent)] to-[var(--muted)]">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:gap-16 lg:py-28">
            <div className="flex flex-col">
              <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.4em] text-[var(--primary)]">
                Art Digital & Art à Fil
              </p>
              <h1 className="font-serif text-4xl leading-[1.05] text-[var(--foreground)] sm:text-5xl lg:text-6xl">
                {heroTitle}
              </h1>
              <p className="mt-8 max-w-xl text-justify text-base leading-relaxed text-[var(--foreground)]/70">
                {heroSubtitle}
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/catalogue" className="rounded-sm bg-[var(--primary)] px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-[var(--primary-dark)]">
                  Explorer la galerie
                </Link>
                <Link href="/sur-mesure" className="rounded-sm border border-[var(--primary)] px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white">
                  Commander une œuvre
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative mx-auto aspect-square w-full max-w-lg overflow-hidden rounded-sm ring-4 ring-[var(--primary)]/20 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroImage} alt="Art contemporain" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* Piliers — deux univers */}
        <section className="border-y border-[var(--accent)] bg-[var(--muted)]">
          <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:grid-cols-4">
            <FeatureItem icon={<Sparkles className="h-5 w-5 text-[var(--primary)]" />} title="Art Digital" text="Impressions sur toile, éditions limitées numérotées" />
            <FeatureItem icon={<HeartHandshake className="h-5 w-5 text-[var(--primary)]" />} title="Art à Fil" text="Tableaux artisanaux faits main, pièces uniques" divider />
            <FeatureItem icon={<Award className="h-5 w-5 text-[var(--primary)]" />} title="Qualité Premium" text="Matériaux nobles, finition soignée" divider />
            <FeatureItem icon={<Truck className="h-5 w-5 text-[var(--primary)]" />} title="Livraison offerte" text="En France dès 100€" />
          </div>
        </section>

        {/* Catégories */}
        {categories.length > 0 && (
          <section className="py-20">
            <div className="mx-auto max-w-7xl px-6">
              <SectionHeader title="NOS COLLECTIONS" />
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-6">
                {categories.map((cat: any) => (
                  <Link key={cat._id} href={`/catalogue?cat=${cat._id}`} className="group flex flex-col items-center">
                    <div className="relative h-36 w-36 overflow-hidden rounded-sm bg-gradient-to-br from-[var(--accent)] to-[var(--muted)] shadow-md transition-transform group-hover:scale-105">
                      {cat.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={cat.imageUrl} alt={cat.name} className="h-full w-full object-cover" />
                      ) : cat.emoji ? (
                        <div className="flex h-full w-full items-center justify-center text-6xl">{cat.emoji}</div>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-serif text-5xl text-[var(--primary)]/50">{cat.name?.[0]?.toUpperCase() || "?"}</div>
                      )}
                    </div>
                    <h3 className="mt-4 font-serif text-sm font-medium uppercase tracking-wider">{cat.name}</h3>
                    {cat._id === ART_FIL_CATEGORY_ID && (
                      <span className="mt-0.5 text-[9px] uppercase tracking-wider text-[var(--primary)]">🧵 Fait main</span>
                    )}
                    <p className="mt-1 text-xs text-[var(--primary)] group-hover:underline">Voir la collection →</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Section Art à Fil */}
        {artAFilProducts.length > 0 && (
          <section className="bg-gradient-to-br from-[var(--muted)] to-[var(--accent)] py-20">
            <div className="mx-auto max-w-7xl px-6">
              <div className="mb-12 flex flex-col items-center text-center">
                <span className="mb-3 text-4xl">🧵</span>
                <h2 className="font-serif text-4xl tracking-wider">ART À FIL</h2>
                <div className="mt-3 h-px w-16 bg-[var(--primary)]" />
                <p className="mt-6 max-w-xl text-sm text-[var(--foreground)]/70 leading-relaxed">
                  Des centaines de fils tendus à la main sur des panneaux de bois massif. Chaque pièce est une œuvre
                  artisanale unique, où la tension du fil crée des jeux d'ombre et de lumière.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                {artAFilProducts.map((p: any) => <ProductCard key={p._id} product={p} />)}
              </div>
              <div className="mt-10 flex justify-center">
                <Link href="/catalogue?cat=artafil" className="rounded-sm border border-[var(--primary)] px-8 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white">
                  Voir tous les tableaux art à fil →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Processus Art à Fil */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeader title="LE SAVOIR-FAIRE" />
            <div className="grid gap-8 md:grid-cols-3">
              <ProcessStep
                step="01"
                title="Conception"
                description="Chaque motif est dessiné et optimisé pour la technique du string art : courbes, angles, densité des clous."
              />
              <ProcessStep
                step="02"
                title="Fabrication"
                description="Des centaines de clous sont plantés un à un, puis le fil est tendu manuellement avec une précision millimétrique."
              />
              <ProcessStep
                step="03"
                title="Finition"
                description="Le tableau est verni, monté sur cadre et livré avec son certificat d'authenticité et système d'accrochage."
              />
            </div>
          </div>
        </section>

        {/* Nouveautés */}
        {displayedNew.length > 0 && (
          <section className="bg-[var(--muted)] py-20">
            <div className="mx-auto max-w-7xl px-6">
              <SectionHeader title="NOUVELLES ŒUVRES" />
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
                {displayedNew.map((p: any) => <ProductCard key={p._id} product={p} />)}
              </div>
            </div>
          </section>
        )}

        {/* Galerie Digital (aperçu) */}
        {digitalProducts.length > 0 && (
          <section className="py-20">
            <div className="mx-auto max-w-7xl px-6">
              <SectionHeader title="ART DIGITAL" />
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                {digitalProducts.map((p: any) => <ProductCard key={p._id} product={p} />)}
              </div>
              <div className="mt-10 flex justify-center">
                <Link href="/catalogue" className="rounded-sm border border-[var(--primary)] px-8 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white">
                  Voir toutes les œuvres →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Commission CTA */}
        <section className="bg-[var(--muted)] py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-2">
            <div className="flex flex-col justify-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">Œuvre sur-mesure</p>
              <h2 className="font-serif text-4xl leading-tight">
                UN PROJET ?<br />
                <span className="text-[var(--primary)]">CRÉONS ENSEMBLE.</span>
              </h2>
              <p className="mt-6 max-w-md text-base text-[var(--foreground)]/70">
                Portrait filaire, reproduction d'œuvre, décoration d'entreprise — racontez-nous votre projet, nous créons l'œuvre unique qui habillera votre espace.
              </p>
              <div className="mt-8">
                <Link href="/sur-mesure" className="inline-block rounded-sm bg-[var(--primary)] px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white hover:bg-[var(--primary-dark)]">
                  Commander une œuvre
                </Link>
              </div>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-sm shadow-inner md:aspect-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&auto=format&fit=crop&q=85" alt="Atelier d'artiste" className="h-full w-full object-cover" />
            </div>
          </div>
        </section>
      </main>
      <Footer brandName={brandName} />

      {siteConfig.features.whatsappButton && (
        <a href={settings.phone ? `https://wa.me/${settings.phone.replace(/\D/g, "")}` : "#"} target="_blank" rel="noopener noreferrer" aria-label="Contact WhatsApp"
          className="fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110">
          <MessageCircle className="h-6 w-6" />
        </a>
      )}
    </>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-12 flex flex-col items-center">
      <h2 className="font-serif text-3xl tracking-wider">{title}</h2>
      <div className="mt-3 h-px w-16 bg-[var(--primary)]" />
    </div>
  );
}

function FeatureItem({ icon, title, text, divider }: { icon: React.ReactNode; title: string; text: string; divider?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${divider ? "md:border-x md:border-[var(--accent)] md:px-6" : ""}`}>
      {icon}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">{title}</p>
        <p className="text-xs text-[var(--foreground)]/60">{text}</p>
      </div>
    </div>
  );
}

function ProcessStep({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="font-serif text-5xl text-[var(--primary)]/30">{step}</span>
      <h3 className="mt-4 font-serif text-lg tracking-wider">{title}</h3>
      <div className="mt-2 h-px w-8 bg-[var(--primary)]" />
      <p className="mt-4 text-sm text-[var(--foreground)]/70 leading-relaxed">{description}</p>
    </div>
  );
}