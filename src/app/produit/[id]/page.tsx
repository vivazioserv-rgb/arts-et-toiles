import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import ProductCard from "@/components/ProductCard";
import AddToCartButton from "@/components/AddToCartButton";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { siteConfig } from "@/site.config";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = db.products.get(id);
  if (!p) notFound();
  const settings = db.settings.get() || {};
  const product: any = { ...p, categoryObj: p.category ? db.categories.get(p.category) : null };
  const brandName = (settings as any)?.brandName || siteConfig.brand.name;

  const allProducts = db.products.all().filter((x) => x._id !== id && x.status !== "unavailable").slice(0, 4);
  const suggestions: any[] = JSON.parse(JSON.stringify(allProducts));
  const galleryImages = [p.imageUrl, ...(p.images || [])].filter(Boolean).filter((url, i, arr) => arr.indexOf(url) === i);

  return (
    <>
      <Navbar brandName={brandName} />
      <Cart />
      <main className="min-h-screen bg-[var(--background)] py-10">
        <div className="mx-auto max-w-6xl px-6">
          <Link href="/catalogue" className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--foreground)]/60 hover:text-[var(--primary)]">
            <ArrowLeft className="h-4 w-4" /> Retour à la boutique
          </Link>
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <div className="aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-[var(--accent)] to-white">
                {galleryImages[0] ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={galleryImages[0]} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-6xl">🍰</div>
                )}
              </div>
            </div>
            <div>
              {product.categoryObj && <p className="mb-2 text-xs uppercase tracking-widest text-[var(--primary)]">{product.categoryObj.name}</p>}
              <h1 className="font-serif text-4xl">{product.name}</h1>
              {product.shortDesc && <p className="mt-3 text-[var(--foreground)]/70">{product.shortDesc}</p>}
              <div className="mt-6 text-3xl font-semibold text-[var(--primary)]">{product.basePrice.toFixed(2)}€</div>
              {product.longDesc && <div className="mt-6 whitespace-pre-line text-sm text-[var(--foreground)]/80">{product.longDesc}</div>}
              {product.allergens && <p className="mt-4 rounded-lg bg-[var(--muted)] p-3 text-xs text-[var(--foreground)]/70"><strong>{siteConfig.product.allergensLabel} :</strong> {product.allergens}</p>}

              {/* Flavor selector */}
              {(product.flavors?.length ?? 0) > 0 && (
                <div className="mt-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-2">{siteConfig.product.variant1.label}</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.flavors.map((f: any) => (
                      <span key={f._id} className="rounded-full border border-[var(--primary)] px-3 py-1 text-xs">
                        {f.name}{f.surcharge > 0 ? ` +${f.surcharge}€` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Size selector */}
              {(product.sizes?.length ?? 0) > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-2">{siteConfig.product.variant2.label}</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s: any) => (
                      <span key={s._id} className="rounded-full border border-[var(--primary)] px-3 py-1 text-xs">
                        {s.name}{s.surcharge > 0 ? ` +${s.surcharge}€` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {product.delay > 0 && (
                <p className="mt-4 text-xs text-[var(--foreground)]/60">
                  {siteConfig.product.delayLabel} : <strong>{product.delay}{siteConfig.product.delayUnit === "days" ? " jour(s)" : "h"}</strong>
                </p>
              )}

              <div className="mt-6">
                <AddToCartButton product={product} size="md" />
              </div>
            </div>
          </div>

          {suggestions.length > 0 && (
            <section className="mt-20">
              <div className="mb-8 flex flex-col items-center">
                <h2 className="font-serif text-3xl tracking-wider">VOUS AIMEREZ AUSSI</h2>
                <div className="mt-3 h-px w-16 bg-[var(--primary)]" />
              </div>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {suggestions.map((s) => <ProductCard key={s._id} product={s} />)}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer brandName={brandName} />
    </>
  );
}