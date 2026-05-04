"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import ProductActions from "@/components/ProductActions";

export default function ClientProductPage({ id }: { id: string }) {
  const [product, setProduct] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((all: any[]) => {
        const p = all.find((x: any) => x._id === id);
        if (p) {
          setProduct(p);
          setSuggestions(all.filter((x: any) => x._id !== id && x.status !== "unavailable").slice(0, 4));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)]">
        <h1 className="font-serif text-2xl">Produit introuvable</h1>
        <Link href="/" className="mt-4 text-sm text-[var(--primary)] hover:underline">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <>
      <Navbar brandName="" />
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

              {/* ProductActions avec sélecteurs + ajout panier */}
              <ProductActions product={product} />
            </div>
          </div>

          {/* Produits suggérés */}
          {suggestions.length > 0 && (
            <section className="mt-24">
              <h2 className="mb-8 font-serif text-2xl tracking-wider">Vous aimerez aussi</h2>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                {suggestions.map((sug: any) => (
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
      <Footer brandName="" />
    </>
  );
}