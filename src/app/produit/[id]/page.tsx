import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import AddToCartButton from "@/components/AddToCartButton";
import { db } from "@/lib/db";
import { siteConfig } from "@/site.config";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await db.products.get(id);
  if (!p) notFound();

  const settings = (await db.settings.get()) || {};
  const categoryObj = p.category ? await db.categories.get(p.category) : null;
  const product: any = { ...p, categoryObj };
  const brandName = (settings as any)?.brandName || siteConfig.brand.name;
  const allProducts = (await db.products.all()).filter((x: any) => x._id !== id && x.status !== "unavailable");

  return (
    <>
      <Navbar brandName={brandName} />
      <Cart />
      <main className="min-h-screen bg-[var(--background)] py-16">
        <div className="mx-auto max-w-7xl px-6">
          {/* Fil d'Ariane */}
          <nav className="mb-8 text-xs text-[var(--foreground)]/50">
            <Link href="/" className="hover:text-[var(--primary)]">Accueil</Link>
            <span className="mx-2">/</span>
            <Link href="/catalogue" className="hover:text-[var(--primary)]">Catalogue</Link>
            <span className="mx-2">/</span>
            <span className="text-[var(--foreground)]/80">{product.name}</span>
          </nav>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Image */}
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--muted)] shadow-lg">
              {product.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full min-h-[400px] items-center justify-center text-8xl">🖼️</div>
              )}
            </div>

            {/* Détails */}
            <div className="flex flex-col">
              {product.categoryObj && (
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--primary)]">
                  {product.categoryObj.emoji} {product.categoryObj.name}
                </p>
              )}
              <h1 className="font-serif text-4xl leading-tight">{product.name}</h1>
              <div className="mt-3 h-px w-12 bg-[var(--primary)]" />
              <p className="mt-6 text-lg leading-relaxed text-[var(--foreground)]/70">{product.shortDesc}</p>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[var(--foreground)]/60">{product.longDesc}</p>

              {/* Prix */}
              <div className="mt-8 flex items-center gap-4">
                <span className="font-serif text-4xl text-[var(--primary)]">{product.basePrice.toFixed(2)}€</span>
                {product.isNew && (
                  <span className="rounded bg-[var(--primary)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Nouveau</span>
                )}
              </div>

              {/* Délai */}
              <p className="mt-4 text-xs text-[var(--foreground)]/50">
                Délai de fabrication : {product.delay} heures
              </p>

              {/* Bouton ajouter au panier */}
              <div className="mt-8">
                <AddToCartButton product={product} />
              </div>
            </div>
          </div>

          {/* Produits suggérés */}
          {allProducts.length > 0 && (
            <section className="mt-24">
              <h2 className="mb-8 font-serif text-2xl tracking-wider">Vous aimerez aussi</h2>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                {allProducts.slice(0, 4).map((sug: any) => (
                  <Link key={sug._id} href={`/produit/${sug._id}`} className="group overflow-hidden rounded-lg bg-[var(--muted)] shadow-sm hover:shadow-lg">
                    <div className="aspect-square overflow-hidden bg-gradient-to-br from-[var(--accent)] to-white">
                      {sug.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={sug.imageUrl} alt={sug.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-4xl">🖼️</div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-xs font-medium hover:text-[var(--primary)]">{sug.name}</h3>
                      <p className="mt-1 text-sm font-semibold">{sug.basePrice.toFixed(2)}€</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer brandName={brandName} />
    </>
  );
}