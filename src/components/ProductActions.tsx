"use client";

import { useState } from "react";
import { useCart } from "@/context/CartProvider";
import { ShoppingBag, Check } from "lucide-react";

export default function ProductActions({ product }: { product: any }) {
  const { addToCart } = useCart();
  const hasFlavors = (product.flavors?.length ?? 0) > 0;
  const hasSizes = (product.sizes?.length ?? 0) > 0;
  const unavailable = product.status === "unavailable";

  const [selectedFlavor, setSelectedFlavor] = useState(hasFlavors ? product.flavors[0]?.name || "" : "");
  const [selectedSize, setSelectedSize] = useState(hasSizes ? product.sizes[0]?.name || "" : "");
  const [added, setAdded] = useState(false);

  if (unavailable) {
    return <span className="text-sm font-medium uppercase text-red-500">Indisponible</span>;
  }

  const getPrice = () => {
    let price = product.basePrice;
    if (selectedFlavor && hasFlavors) {
      const f = product.flavors.find((x: any) => x.name === selectedFlavor);
      if (f?.price) price = f.price;
    }
    if (selectedSize && hasSizes) {
      const s = product.sizes.find((x: any) => x.name === selectedSize);
      if (s?.price) price = s.price;
    }
    return price;
  };

  const handleAdd = () => {
    const label = [selectedFlavor, selectedSize].filter(Boolean).join(" / ");
    addToCart({
      productId: product._id,
      name: product.name,
      price: getPrice(),
      imageUrl: product.imageUrl,
      options: label,
    } as any);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Prix */}
      <div className="flex items-center gap-4">
        <span className="font-serif text-4xl text-[var(--primary)]">{getPrice().toFixed(2)}€</span>
        {product.isNew && (
          <span className="rounded bg-[var(--primary)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Nouveau</span>
        )}
      </div>

      {/* Délai */}
      <p className="text-xs text-[var(--foreground)]/50">Délai de fabrication : {product.delay} heures</p>

      {/* Sélecteur de saveur/style */}
      {hasFlavors && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]/70">
            {product.flavors[0]?.name ? "Style / Couleur" : "Option"}
          </p>
          <div className="flex flex-wrap gap-2">
            {product.flavors.map((f: any) => {
              const active = selectedFlavor === f.name;
              return (
                <button
                  key={f.name}
                  onClick={() => setSelectedFlavor(f.name)}
                  className={`rounded-sm border px-4 py-2 text-xs font-medium transition-all ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                      : "border-[var(--accent)] text-[var(--foreground)]/70 hover:border-[var(--primary)]"
                  }`}
                >
                  {f.emoji && <span className="mr-1">{f.emoji}</span>}
                  {f.name}
                  {f.price && f.price !== product.basePrice && (
                    <span className="ml-1 opacity-70">+{(f.price - product.basePrice).toFixed(2)}€</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sélecteur de taille */}
      {hasSizes && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]/70">Taille / Format</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s: any) => {
              const active = selectedSize === s.name;
              return (
                <button
                  key={s.name}
                  onClick={() => setSelectedSize(s.name)}
                  className={`rounded-sm border px-4 py-2 text-xs font-medium transition-all ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                      : "border-[var(--accent)] text-[var(--foreground)]/70 hover:border-[var(--primary)]"
                  }`}
                >
                  {s.name}
                  {s.price && s.price !== product.basePrice && (
                    <span className="ml-1 opacity-70">+{(s.price - product.basePrice).toFixed(2)}€</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bouton ajouter */}
      <button
        onClick={handleAdd}
        disabled={added}
        className={`flex items-center justify-center gap-2 rounded-sm px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] transition-all ${
          added
            ? "bg-green-600 text-white"
            : "bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]"
        }`}
      >
        {added ? (
          <>
            <Check className="h-4 w-4" /> Ajouté au panier
          </>
        ) : (
          <>
            <ShoppingBag className="h-4 w-4" /> Ajouter au panier
          </>
        )}
      </button>
    </div>
  );
}