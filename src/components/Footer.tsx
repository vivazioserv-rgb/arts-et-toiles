import Link from "next/link";
import { siteConfig } from "@/site.config";

export default function Footer({ brandName = siteConfig.brand.name }: { brandName?: string }) {
  return (
    <footer className="mt-auto border-t border-[var(--accent)] bg-[var(--muted)]">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 md:grid-cols-3 text-center md:text-left">
        <div>
          <h3 className="font-serif text-lg">{brandName}</h3>
          <p className="mt-1 text-xs text-[var(--foreground)]/60">{siteConfig.brand.tagline}</p>
          <p className="mt-2 text-xs text-[var(--foreground)]/50">{siteConfig.contact.zone}</p>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider">Liens</p>
          <div className="space-y-1 text-xs text-[var(--foreground)]/60">
            <Link href="/catalogue" className="block hover:text-[var(--primary)]">Nos créations</Link>
            <Link href="/sur-mesure" className="block hover:text-[var(--primary)]">Pièce montée</Link>
            <Link href="/a-propos" className="block hover:text-[var(--primary)]">Notre histoire</Link>
            <Link href="/contact" className="block hover:text-[var(--primary)]">Contact</Link>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider">Contact</p>
          <p className="text-xs text-[var(--foreground)]/60">{siteConfig.contact.email}</p>
          <p className="text-xs text-[var(--foreground)]/60">{siteConfig.contact.phone}</p>
        </div>
      </div>
      <div className="border-t border-[var(--accent)] py-5 text-center text-xs text-[var(--foreground)]/50">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/a-propos" className="hover:text-[var(--primary)]">À propos</Link>
          <span aria-hidden="true">·</span>
          <Link href="/contact" className="hover:text-[var(--primary)]">Contact</Link>
          <span aria-hidden="true">·</span>
          <Link href="/rgpd" className="hover:text-[var(--primary)]">Confidentialité</Link>
        </div>
        <p className="mt-3">© {new Date().getFullYear()} {brandName} — Tous droits réservés</p>
      </div>
    </footer>
  );
}