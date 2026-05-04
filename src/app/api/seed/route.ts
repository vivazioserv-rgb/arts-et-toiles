import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteConfig } from "@/site.config";

export async function POST() {
  // Clear existing data
  ["categories", "products", "orders"].forEach((coll) => {
    const fs = require("fs");
    const path = require("path");
    const fp = path.join(process.cwd(), "data", `${coll}.json`);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  });

  // ═══════════════════════════════════════════════════════════════
  // Catégories artistiques
  // ═══════════════════════════════════════════════════════════════
  const cats = [
    { name: "Abstrait", emoji: "🎨", imageUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&auto=format&fit=crop&q=85", active: true },
    { name: "Paysages", emoji: "🌅", imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=85", active: true },
    { name: "Portraits", emoji: "🧑‍🎨", imageUrl: "https://images.unsplash.com/photo-1554188248-986adbb73be4?w=800&auto=format&fit=crop&q=85", active: true },
    { name: "Design", emoji: "◽", imageUrl: "https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=800&auto=format&fit=crop&q=85", active: true },
    { name: "Street Art", emoji: "🎭", imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&auto=format&fit=crop&q=85", active: true },
  ];

  const createdCats = cats.map((c) => db.categories.create(c));
  const catMap: Record<string, string> = {};
  createdCats.forEach((c) => { catMap[c.name] = c._id; });

  // ═══════════════════════════════════════════════════════════════
  // Variantes artistiques (finitions et formats)
  // ═══════════════════════════════════════════════════════════════

  // Finitions (supports physiques)
  const finitions = [
    { name: "Toile tendue (châssis bois)", surcharge: 0 },
    { name: "Alu Dibond brossé", surcharge: 35 },
    { name: "Poster premium roulé", surcharge: -15 },
    { name: "Impression photo Fine Art", surcharge: 20 },
  ];

  // Format digital (téléchargement) — ajouté manuellement aux produits concernés
  const digitalFormat = { name: "Fichier numérique HD (JPEG 300dpi)", surcharge: 0 };

  // Formats / dimensions
  const formatsPetit = [
    { name: "30×40 cm", surcharge: 0 },
    { name: "40×60 cm", surcharge: 20 },
    { name: "50×70 cm", surcharge: 35 },
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

  // ═══════════════════════════════════════════════════════════════
  // PRODUITS — ŒUVRES D'ART
  // ═══════════════════════════════════════════════════════════════

  db.products.create({
    name: "Éclats d'Azur",
    shortDesc: "Œuvre abstraite contemporaine, nuances de bleu et or",
    longDesc: "Une composition abstraite où le bleu profond rencontre des éclats dorés à la feuille d'or. Cette œuvre numérique éditée en 50 exemplaires numérotés capture la lumière et le mouvement. Idéale pour un salon contemporain ou un bureau d'architecte. Livrée avec certificat d'authenticité et numéro d'édition. \n\nDisponible en tirage sur toile tendue, Alu Dibond, poster ou fichier numérique HD pour usage personnel.",
    basePrice: 89,
    delay: 48,
    isNew: true,
    status: "available",
    category: catMap["Abstrait"],
    allergens: "",
    imageUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=1200&auto=format&fit=crop&q=85",
    images: ["https://images.unsplash.com/photo-1549490349-8643362247b5?w=1200&auto=format&fit=crop&q=85", "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1200&auto=format&fit=crop&q=85"],
    flavors: finitions,
    sizes: formatsMoyen,
  });

  db.products.create({
    name: "Crépuscule #7",
    shortDesc: "Photographie d'art, coucher de soleil sur l'Atlantique",
    longDesc: "Tirage Fine Art d'une photographie primée. Pris au coucher du soleil sur la côte atlantique française, ce cliché capture l'instant où le ciel embrase l'océan. Tirage limité à 25 exemplaires, signé et numéroté. \n\nPapier Fine Art Hahnemühle 308g, encres pigmentaires Epson UltraChrome HD. Chaque tirage est livré sous pochette neutre avec certificat d'authenticité.",
    basePrice: 120,
    delay: 72,
    isNew: true,
    status: "available",
    category: catMap["Paysages"],
    allergens: "",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop&q=85",
    images: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop&q=85", "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=85"],
    flavors: [
      { name: "Papier Fine Art (Hahnemühle)", surcharge: 0 },
      { name: "Toile Fine Art Canvas", surcharge: 15 },
      { name: "Alu Dibond satiné", surcharge: 30 },
      { name: "Poster premium roulé", surcharge: -25 },
    ],
    sizes: formatsGrand,
  });

  db.products.create({
    name: "Portrait Éphémère",
    shortDesc: "Série Portraits Contemporains, édition limitée",
    longDesc: "Portrait extrait de la série 'Éphémères', une exploration des expressions humaines capturées en lumière naturelle. Chaque tirage est unique, développé à la main en laboratoire. \n\nTirage Fine Art sur papier baryté 320g, tirage limité à 10 exemplaires. Numéroté, signé, avec certificat. Encadrement possible sur demande (nous contacter).",
    basePrice: 150,
    delay: 96,
    isNew: false,
    status: "available",
    category: catMap["Portraits"],
    allergens: "",
    imageUrl: "https://images.unsplash.com/photo-1554188248-986adbb73be4?w=1200&auto=format&fit=crop&q=85",
    images: ["https://images.unsplash.com/photo-1554188248-986adbb73be4?w=1200&auto=format&fit=crop&q=85"],
    flavors: [
      { name: "Papier Baryté Premium", surcharge: 0 },
      { name: "Toile Fine Art", surcharge: 20 },
      { name: "Fichier numérique HD (usage personnel)", surcharge: -50 },
    ],
    sizes: formatsMoyen,
  });

  db.products.create({
    name: "Minimal #03",
    shortDesc: "Art digital minimaliste, lignes et équilibre",
    longDesc: "Création digitale minimaliste où la simplicité des formes rencontre l'harmonie des proportions. Une œuvre apaisante pour les espaces épurés.  \n\nDisponible en impression haute définition sur tout support ou en téléchargement numérique HD pour une utilisation illimitée (impression chez votre artisan, fond d'écran, etc.). Licence personnelle incluse.",
    basePrice: 59,
    delay: 24,
    isNew: true,
    status: "available",
    category: catMap["Design"],
    allergens: "",
    imageUrl: "https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=1200&auto=format&fit=crop&q=85",
    images: ["https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=1200&auto=format&fit=crop&q=85"],
    flavors: [
      { name: "Poster premium", surcharge: 0 },
      { name: "Alu Dibond", surcharge: 25 },
      { name: "Toile tendue", surcharge: 15 },
      { name: "Fichier numérique HD + licence", surcharge: -20 },
    ],
    sizes: formatsPetit,
  });

  db.products.create({
    name: "Urban Soul",
    shortDesc: "Street art mural, technique mixte digitale",
    longDesc: "Œuvre inspirée du street art new-yorkais, mêlant lettres néon, collages numériques et textures urbaines. Un travail sur la matière qui donne l'illusion de la peinture en spray et des affiches lacérées. \n\nCollection 'Urban Stories', édition limitée à 100 exemplaires. Chaque pièce est numérotée et signée numériquement.",
    basePrice: 79,
    delay: 48,
    isNew: true,
    status: "available",
    category: catMap["Street Art"],
    allergens: "",
    imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&auto=format&fit=crop&q=85",
    images: ["https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&auto=format&fit=crop&q=85", "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1200&auto=format&fit=crop&q=85"],
    flavors: [
      { name: "Poster premium (60×90)", surcharge: 0 },
      { name: "Toile tendue (châssis)", surcharge: 20 },
      { name: "Alu Dibond brillant", surcharge: 35 },
      { name: "Fichier numérique HD", surcharge: -30 },
    ],
    sizes: formatsMoyen,
  });

  db.products.create({
    name: "Nébuleuse 2.0",
    shortDesc: "Abstraction cosmique générée par IA, pièce unique",
    longDesc: "Œuvre créée par intelligence artificielle entraînée sur des milliers de photographies du télescope Hubble. Chaque tirage est une interprétation unique des confins de l'univers. \n\nPièce numérotée de la série 'Cosmos' (25 exemplaires). Certificat d'authenticité blockchain inclus. Formats jusqu'à 120×180 cm disponibles.",
    basePrice: 139,
    delay: 72,
    isNew: false,
    status: "available",
    category: catMap["Abstrait"],
    allergens: "",
    imageUrl: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1200&auto=format&fit=crop&q=85",
    images: ["https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1200&auto=format&fit=crop&q=85"],
    flavors: finitions,
    sizes: formatsGrand,
  });

  db.products.create({
    name: "Harmonie Végétale",
    shortDesc: "Photographie botanique, macrophotographie d'art",
    longDesc: "Plongez au cœur du vivant avec cette macrophotographie botanique qui révèle les détails invisibles à l'œil nu : nervures, textures, jeux de lumière sur la matière organique. \n\nImpression sur papier Fine Art Canson Infinity 310g. Édition limitée à 50 exemplaires numérotés. Encadrement caisse américaine disponible sur demande.",
    basePrice: 95,
    delay: 72,
    isNew: false,
    status: "available",
    category: catMap["Paysages"],
    allergens: "",
    imageUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&auto=format&fit=crop&q=85",
    images: ["https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&auto=format&fit=crop&q=85"],
    flavors: [
      { name: "Papier Canson Fine Art", surcharge: 0 },
      { name: "Toile Fine Art Canvas", surcharge: 15 },
      { name: "Impression métal (Alu)", surcharge: 40 },
    ],
    sizes: formatsMoyen,
  });

  db.products.create({
    name: "Abstract Geometry #5",
    shortDesc: "Art digital géométrique, vectoriel haute définition",
    longDesc: "Une composition géométrique précise où chaque angle a été calculé pour créer une harmonie visuelle parfaite. Couleurs vibrantes sur fond noir profond. \n\nVendue en téléchargement numérique HD (format 6000×9000 px, JPEG 300dpi) pour impression chez votre artisan ou utilisation digitale. Licence personnelle et professionnelle limitée incluse.",
    basePrice: 29,
    delay: 0,
    isNew: true,
    status: "available",
    category: catMap["Design"],
    allergens: "",
    imageUrl: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1200&auto=format&fit=crop&q=85",
    images: ["https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1200&auto=format&fit=crop&q=85"],
    flavors: [
      { name: "Fichier numérique HD (6000×9000px)", surcharge: 0 },
      { name: "Poster premium 40×60cm", surcharge: 20 },
    ],
    sizes: [],
  });

  db.products.create({
    name: "Graffiti Lumière",
    shortDesc: "Light painting photographique, performance nocturne",
    longDesc: "Performance photographique capturée en pose longue dans les rues de Paris. L'artiste a dessiné avec la lumière (LED) directement dans l'espace, créant des motifs kaléidoscopiques qui semblent flotter dans la nuit. \n\nTirage argentique Fine Art, édition limitée à 15 exemplaires. Tirage contrecollé sur Alu Dibond avec finition brossée. Livré avec certificat et clous d'accrochage.",
    basePrice: 180,
    delay: 96,
    isNew: true,
    status: "available",
    category: catMap["Street Art"],
    allergens: "",
    imageUrl: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1200&auto=format&fit=crop&q=85",
    images: ["https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1200&auto=format&fit=crop&q=85"],
    flavors: [
      { name: "Alu Dibond brossé", surcharge: 0 },
      { name: "Toile tendue premium", surcharge: 20 },
    ],
    sizes: formatsGrand,
  });

  // ═══════════════════════════════════════════════════════════════
  // Settings (Admin + Branding)
  // ═══════════════════════════════════════════════════════════════
  const bcrypt = require("bcryptjs");
  db.settings.upsert({
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
    about: `"Arts & Toiles" est née d'une passion pour l'art contemporain accessible.\n\nNotre mission : rendre l'art abordable sans compromis sur la qualité. Chaque œuvre que nous proposons est une édition limitée, numérotée et signée, disponible sur des supports premium : toile fine art, Alu Dibond, papier baryté, ou en fichier numérique haute définition.\n\nNotre galerie en ligne vous permet d'acquérir des œuvres originales en quelques clics, avec des options de finition et de format adaptées à tous les espaces et budgets. Du petit format pour un cadre de bureau au grand format pour habiller un salon, chaque tirage est réalisé avec soin dans notre atelier.\n\nEngagés pour l'art accessible, nous proposons également des fichiers numériques HD à prix doux, pour que chacun puisse décorer son intérieur comme il l'entend.`,
    cgv: `Toutes nos œuvres sont des éditions limitées numérotées et signées. Les tirages physiques sont expédiés sous 48h à 96h ouvrées selon le format choisi. Les fichiers numériques sont disponibles en téléchargement immédiat après paiement. Conformément à la loi, vous disposez d'un droit de rétractation de 14 jours pour les tirages physiques — hors fichiers numériques qui ne sont ni repris ni échangés. Les fichiers numériques sont livrés avec une licence d'usage personnel uniquement.`,
    rgpd: `Vos données personnelles (nom, email, adresse) sont collectées uniquement pour le traitement de vos commandes et ne sont jamais transmises à des tiers. Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour exercer ces droits, contactez-nous à ${siteConfig.contact.email}.`,
    cookiesPolicy: `Ce site utilise uniquement des cookies essentiels au fonctionnement (panier, session admin). Aucun cookie de tracking ou publicitaire n'est utilisé.`,
  });

  const products = db.products.all();

  return NextResponse.json({
    ok: true,
    created: {
      categories: createdCats.length,
      products: products.length,
      settings: true,
    },
    adminPassword: "Art1234!",
  });
}