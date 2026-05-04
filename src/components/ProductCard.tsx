import Link from "next/link";
import AddToCartButton from "./AddToCartButton";

const AFT_FIL_CATEGORY = "artafil";

export default function ProductCard({ product }: { product: any }) {
  const isArtAFil = product.category === AFT_FIL_CATEGORY;
  return (
    <article className="group relative overflow-hidden rounded-lg bg-[var(--muted)] shadow-sm transition-shadow hover:shadow-lg">
      <div className="absolute right-2 top-2 z-10 flex flex-col gap-1.5 items-end">
        {product.isNew && (
          <span className="rounded bg-[var(--primary)] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[var(--background)]">
            Nouveau
          </span>
        )}
        {isArtAFil && (
          <span className="rounded bg-[var(--foreground)] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[var(--accent)] flex items-center gap-1">
            <span>🧵</span> Fait Main
          </span>
        )}
      </div>
      <Link href={`/produit/${product._id}`}>
        <div className="aspect-square overflow-hidden bg-gradient-to-br from-[var(--accent)] to-white">
          {product.imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl">🍰</div>
          )}
        </div>
      </Link>
      <div className="p-3">
        <Link href={`/produit/${product._id}`}>
          <h3 className="line-clamp-2 text-xs font-medium hover:text-[var(--primary)]">{product.name}</h3>
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{product.basePrice.toFixed(2)}€</span>
            {isArtAFil && (
              <span className="text-[9px] text-[var(--primary)] uppercase tracking-wider">Pièce unique</span>
            )}
          </div>
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}