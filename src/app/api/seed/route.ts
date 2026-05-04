import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteConfig } from "@/site.config";
import bcrypt from "bcryptjs";

export async function POST() {
  // ═══════════════════════════════════════════════════════════════
  // Catégories artistiques
  // ═══════════════════════════════════════════════════════════════
  const catData = [
    { name: "Abstrait", emoji: "🎨", active: true },
    { name: "Paysages", emoji: "🌅", active: true },
    { name: "Portraits", emoji: "🧑‍🎨", active: true },
    { name: "Design", emoji: "◽", active: true },
    { name: "Street Art", emoji: "🎭", active: true },
    { name: "Art à Fil", emoji: "🧵", active: true },
  ];

  const catMap: Record<string, string> = {};
  for (const c of catData) {
    const created = await db.categories.create(c);
    catMap[created.name] = created._id;
  }

  // ═══════════════════════════════════════════════════════════════
  // PRODUITS
  // ═══════════════════════════════════════════════════════════════

  const finitions = [
    { name: "Toile tendue (châssis bois)", surcharge: 0 },
    { name: "Alu Dibond brossé", surcharge: 35 },
    { name: "Poster premium roulé", surcharge: -15 },
    { name: "Impression photo Fine Art", surcharge: 20 },
  ];

  const formatsMoyen = [
    { name: "40×60 cm", surcharge: 0 },
    { name: "60×90 cm", surcharge: 40 },
    { name: "80×120 cm", surcharge: 85 },
    { name: "Fichier numérique HD", surcharge: -30 },
  ];

  const formatsGrand = [
    { name: "60×90 cm", surcharge: 0 },
    { name: "80×120 cm", surcharge: 55 },
    { name: "100×150 cm", surcharge: 120 },
    { name: "120×180 cm (sur devis)", surcharge: 0 },
  ];

  const formatsPetit = [
    { name: "30×40 cm", surcharge: 0 },
    { name: "40×60 cm", surcharge: 20 },
    { name: "50×70 cm", surcharge: 35 },
  ];

  await db.products.create({
    name: "Éclats d'Azur",
    shortDesc: "Œuvre abstraite contemporaine, nuances de bleu et or",
    longDesc: "Composition abstraite où le bleu profond rencontre des éclats dorés à la feuille d'or. Édition limitée à 50 exemplaires numérotés.",
    basePrice: 89, delay: 48, isNew: true, status: "available",
    category: catMap["Abstrait"], imageUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=1200&auto=format&fit=crop&q=85",
    flavors: finitions, sizes: formatsMoyen,
  });

  await db.products.create({
    name: "Crépuscule #7",
    shortDesc: "Photographie d'art, coucher de soleil sur l'Atlantique",
    longDesc: "Tirage Fine Art. Papier Hahnemühle 308g, édition limitée à 25 exemplaires.",
    basePrice: 120, delay: 72, isNew: true, status: "available",
    category: catMap["Paysages"], imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop&q=85",
    flavors: [
      { name: "Papier Fine Art (Hahnemühle)", surcharge: 0 },
      { name: "Toile Fine Art Canvas", surcharge: 15 },
      { name: "Alu Dibond satiné", surcharge: 30 },
      { name: "Poster premium roulé", surcharge: -25 },
    ],
    sizes: formatsGrand,
  });

  await db.products.create({
    name: "Portrait Éphémère",
    shortDesc: "Série Portraits Contemporains, édition limitée",
    longDesc: "Portrait extrait de la série 'Éphémères'. Tirage Fine Art sur papier baryté 320g, limité à 10 exemplaires.",
    basePrice: 150, delay: 96, isNew: false, status: "available",
    category: catMap["Portraits"], imageUrl: "https://images.unsplash.com/photo-1554188248-986adbb73be4?w=1200&auto=format&fit=crop&q=85",
    flavors: [
      { name: "Papier Baryté Premium", surcharge: 0 },
      { name: "Toile Fine Art", surcharge: 20 },
      { name: "Fichier numérique HD (usage personnel)", surcharge: -50 },
    ],
    sizes: formatsMoyen,
  });

  await db.products.create({
    name: "Minimal #03",
    shortDesc: "Art digital minimaliste, lignes et équilibre",
    longDesc: "Création digitale minimaliste. Disponible en impression HD ou téléchargement numérique.",
    basePrice: 59, delay: 24, isNew: true, status: "available",
    category: catMap["Design"], imageUrl: "https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=1200&auto=format&fit=crop&q=85",
    flavors: [
      { name: "Poster premium", surcharge: 0 },
      { name: "Alu Dibond", surcharge: 25 },
      { name: "Toile tendue", surcharge: 15 },
      { name: "Fichier numérique HD + licence", surcharge: -20 },
    ],
    sizes: formatsPetit,
  });

  await db.products.create({
    name: "Urban Soul", shortDesc: "Street art mural, technique mixte digitale",
    longDesc: "Inspiré du street art new-yorkais. Collection 'Urban Stories', édition limitée à 100 exemplaires.",
    basePrice: 79, delay: 48, isNew: true, status: "available",
    category: catMap["Street Art"], imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&auto=format&fit=crop&q=85",
    flavors: [
      { name: "Poster premium (60×90)", surcharge: 0 },
      { name: "Toile tendue (châssis)", surcharge: 20 },
      { name: "Alu Dibond brillant", surcharge: 35 },
      { name: "Fichier numérique HD", surcharge: -30 },
    ],
    sizes: formatsMoyen,
  });

  // ═══════════════════════════════════════════════════════════════
  // Settings
  // ═══════════════════════════════════════════════════════════════
  await db.settings.upsert({
    brandName: siteConfig.brand.name,
    brandTagline: siteConfig.brand.tagline,
    heroTitle: siteConfig.hero.defaultTitle,
    heroSubtitle: siteConfig.hero.defaultSubtitle,
    heroImageUrl: siteConfig.hero.defaultImageUrl,
    email: siteConfig.contact.email,
    phone: siteConfig.contact.phone,
    zone: siteConfig.contact.zone,
    adminPassword: await bcrypt.hash("Art1234!", 10),
    slots: siteConfig.defaults.slots,
    openWeekdays: siteConfig.defaults.openWeekdays,
    closedDates: [],
    minDelay: siteConfig.defaults.minDelay,
    about: `"Arts & Toiles" est née d'une passion pour l'art contemporain accessible.\n\nNotre mission : rendre l'art abordable sans compromis sur la qualité.`,
    cgv: "Toutes nos œuvres sont des éditions limitées numérotées et signées.",
    rgpd: `Vos données personnelles sont collectées uniquement pour le traitement de vos commandes. Contact : ${siteConfig.contact.email}`,
    cookiesPolicy: "Ce site utilise uniquement des cookies essentiels au fonctionnement.",
  });

  const products = await db.products.all();
  const categories = await db.categories.all();

  return NextResponse.json({
    ok: true,
    created: { categories: categories.length, products: products.length, settings: true },
    adminPassword: "Art1234!",
  });
}