// ═══════════════════════════════════════════════════════════════════
// ARTS & TOILES — Galerie d'art & Art à Fil
// ═══════════════════════════════════════════════════════════════════

export type Vertical = "patisserie" | "bijouterie" | "fleuriste" | "chocolaterie" | "generic" | "art";

export interface VariantConfig {
  key: "flavors" | "sizes" | "finitions" | "formats";
  label: string;
  labelSingular: string;
  placeholder: string;
  hasImage: boolean;
  enabled: boolean;
}

export interface NavLink { href: string; label: string; }

export interface SiteConfig {
  vertical: string;
  brand: { name: string; tagline: string; banner: string; bannerSymbol: string; logoUrl: string; storagePrefix: string; };
  theme: { background: string; foreground: string; primary: string; primaryDark: string; accent: string; muted: string; };
  meta: { title: string; description: string; };
  hero: { defaultTitle: string; defaultSubtitle: string; defaultImageUrl: string; };
  contact: { email: string; phone: string; zone: string; };
  navbar: { links: NavLink[]; };
  product: {
    variant1: VariantConfig;
    variant2: VariantConfig;
    hasAllergens: boolean;
    allergensLabel: string;
    delayLabel: string;
    delayUnit: "days" | "hours";
  };
  features: { customOrders: boolean; pickupCalendar: boolean; postalDelivery: boolean; whatsappButton: boolean; };
  customOrderEvents?: string[];
  defaults: { slots: string[]; openWeekdays: number[]; minDelay: number; };
  legalPreset: string;
}

// ═══════════════════════════════════════════════════════════════════
// ARTS & TOILES — Art digital & Art à Fil artisanaux
// Palette : blanc pur / noir / or / taupe
// ═══════════════════════════════════════════════════════════════════

export const siteConfig: SiteConfig = {
  vertical: "art",
  brand: {
    name: "Arts & Toiles",
    tagline: "Galerie d'Art Digital & Art à Fil Artisanal",
    banner: "ART DIGITAL · ART À FIL FAIT MAIN · ÉDITIONS LIMITÉES · LIVRAISON OFFERTE EN FRANCE",
    bannerSymbol: "✦",
    logoUrl: "",
    storagePrefix: "arts-toiles",
  },
  theme: {
    background: "#faf9f7",     // blanc cassé chaleureux
    foreground: "#1a1a1a",     // noir profond
    primary: "#c9a84c",        // or / doré
    primaryDark: "#b8952e",    // or plus foncé
    accent: "#e8e0d0",         // beige / taupe clair
    muted: "#f0ece4",          // ivoire
  },
  meta: {
    title: "Arts & Toiles — Art Digital & Art à Fil | Tableaux Faits Main et Impressions sur Toile",
    description: "Découvrez notre galerie mêlant art digital contemporain et tableaux artisanaux en art à fil (string art). Œuvres numériques, impressions sur toile et pièces uniques faites main. Livraison France et Europe.",
  },
  hero: {
    defaultTitle: "L'art qui habille vos murs",
    defaultSubtitle: "Impressions sur toile grand format, éditions limitées numérotées et tableaux artisanaux en art à fil. Art digital & fait main, pour transformer votre intérieur.",
    defaultImageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1600&auto=format&fit=crop&q=85",
  },
  contact: { email: "contact@arts-et-toiles.fr", phone: "06 12 34 56 78", zone: "Livraison France & Europe" },
  navbar: {
    links: [
      { href: "/", label: "Accueil" },
      { href: "/catalogue", label: "La galerie" },
      { href: "/sur-mesure", label: "Commission" },
      { href: "/a-propos", label: "L'artiste" },
      { href: "/contact", label: "Contact" },
    ],
  },
  product: {
    variant1: {
      key: "finitions",
      label: "Finition / Type de fil",
      labelSingular: "finition",
      placeholder: "Finition, support ou type de fil",
      hasImage: false,
      enabled: true,
    },
    variant2: {
      key: "formats",
      label: "Format / Dimensions",
      labelSingular: "format",
      placeholder: "Format ou dimensions (40×60, 60×90…)",
      hasImage: false,
      enabled: true,
    },
    hasAllergens: false,
    allergensLabel: "",
    delayLabel: "Délai de fabrication",
    delayUnit: "hours",
  },
  features: {
    customOrders: true,
    pickupCalendar: false,
    postalDelivery: true,
    whatsappButton: true,
  },
  customOrderEvents: [
    "Portrait sur mesure",
    "Tableau art à fil personnalisé",
    "Reproduction d'œuvre",
    "Carte filaire (France, région, cœur…)",
    "Décoration intérieure",
    "Cadeau personnalisé",
    "Autre",
  ],
  defaults: { slots: [], openWeekdays: [1, 2, 3, 4, 5, 6], minDelay: 72 },
  legalPreset: "generic",
};