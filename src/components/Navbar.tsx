"use client";
import Link from "next/link";
import { useCart } from "@/context/CartProvider";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { siteConfig } from "@/site.config";

export default function Navbar({ brandName = siteConfig.brand.name }: { brandName?: string }) {
  const { cartCount, setCartOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = siteConfig.navbar.links.filter((l) => {
    if (l.href === "/sur-mesure" && !siteConfig.features.customOrders) return false;
    return true;
  });

  return (
    <>
      <div className="bg-[var(--primary)] py-2.5 text-center text-[10px] font-semibold tracking-[0.35em] text-[var(--background)]">
        {siteConfig.brand.banner} <span className="ml-1">{siteConfig.brand.bannerSymbol}</span>
      </div>
      <header className="sticky top-0 z-40 border-b border-[var(--accent)] bg-[var(--background)]/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2" aria-label={brandName}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-[var(--background)]">
              DA
            </div>
            <div>
              <p className="font-serif text-lg leading-tight">{brandName}</p>
              <p className="text-[9px] uppercase tracking-widest text-[var(--primary)]">{siteConfig.brand.tagline}</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-[var(--primary)] transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <button onClick={() => setCartOpen(true)} aria-label="Panier" className="relative hover:text-[var(--primary)]">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[10px] font-bold text-[var(--background)]">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={() => setMobileOpen(true)} aria-label="Menu" className="md:hidden hover:text-[var(--primary)]">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="flex-1 bg-black/70" onClick={() => setMobileOpen(false)} />
            <aside className="w-72 border-l border-[var(--accent)] bg-[var(--background)] p-6 shadow-2xl">
              <button onClick={() => setMobileOpen(false)} className="mb-6 ml-auto block">
                <X className="h-5 w-5" />
              </button>
              <nav className="space-y-4">
                {links.map((l) => (
                  <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block text-lg font-medium hover:text-[var(--primary)]">
                    {l.label}
                  </Link>
                ))}
              </nav>
            </aside>
          </div>
        )}
      </header>
    </>
  );
}