import { NextResponse } from "next/server";
import { getDb, initDatabase } from "@/lib/turso";
import { siteConfig } from "@/site.config";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

async function seed() {
  const db = getDb();
  await initDatabase();

  // Vérifier si déjà seedé
  const count = await db.execute("SELECT COUNT(*) as c FROM products");
  if ((count.rows[0] as any).c > 0) {
    return { alreadySeeded: true };
  }

  const catData = [
    { name: "Abstrait", emoji: "🎨", active: 1 },
    { name: "Paysages", emoji: "🌅", active: 1 },
    { name: "Portraits", emoji: "🧑‍🎨", active: 1 },
    { name: "Design", emoji: "◽", active: 1 },
    { name: "Street Art", emoji: "🎭", active: 1 },
    { name: "Art à Fil", emoji: "🧵", active: 1 },
  ];

  // Importer depuis les fichiers JSON si disponibles
  let catsToCreate = catData;
  let productsToCreate: any[] = [];

  try {
    const jsonCats = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "categories.json"), "utf-8"));
    if (jsonCats.length > 0) {
      catsToCreate = jsonCats.map((c: any) => ({
        name: c.name,
        emoji: c.emoji || "",
        active: c.active ? 1 : 0,
      }));
    }

    const jsonProds = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "products.json"), "utf-8"));
    if (jsonProds.length > 0) {
      productsToCreate = jsonProds;
    }
  } catch {}

  // Créer les catégories
  const catMap: Record<string, string> = {};
  for (const c of catsToCreate) {
    const r = await db.execute({
      sql: "INSERT INTO categories (_id, name, emoji, active) VALUES (?, ?, ?, ?)",
      args: [genId(), c.name, c.emoji || "", c.active ? 1 : 0],
    });
    // Récupérer l'ID créé
    const inserted = await db.execute("SELECT _id FROM categories WHERE name = ?", [c.name]);
    catMap[c.name] = (inserted.rows[0] as any)._id;
  }

  // Créer les produits
  for (const p of productsToCreate) {
    await db.execute({
      sql: `INSERT INTO products (_id, name, shortDesc, longDesc, basePrice, delay, isNew, status, imageUrl, images, allergens, category, flavors, sizes, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        p._id, p.name, p.shortDesc || "", p.longDesc || "",
        p.basePrice, p.delay || 48, p.isNew ? 1 : 0, p.status || "available",
        p.imageUrl || "", JSON.stringify(p.images || []),
        p.allergens || "", p.category || catMap[p.category] || "",
        JSON.stringify(p.flavors || []), JSON.stringify(p.sizes || []),
        p.createdAt || new Date().toISOString(),
      ],
    });
  }

  // Settings
  let adminPassword = await bcrypt.hash("Art1234!", 10);
  try {
    const jsonSettings = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "settings.json"), "utf-8"));
    if (jsonSettings.length > 0) {
      const s = jsonSettings[0];
      await db.execute({
        sql: `INSERT INTO settings (_id, brandName, brandTagline, heroTitle, heroSubtitle, heroImageUrl, commissionImageUrl, email, phone, zone, adminPassword, slots, openWeekdays, closedDates, minDelay, about, cgv, rgpd, cookiesPolicy)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          genId(), s.brandName || siteConfig.brand.name, s.brandTagline || siteConfig.brand.tagline,
          s.heroTitle || siteConfig.hero.defaultTitle, s.heroSubtitle || siteConfig.hero.defaultSubtitle,
          s.heroImageUrl || siteConfig.hero.defaultImageUrl, s.commissionImageUrl || "",
          s.email || siteConfig.contact.email, s.phone || siteConfig.contact.phone,
          s.zone || siteConfig.contact.zone, s.adminPassword || adminPassword,
          JSON.stringify(s.slots || []), JSON.stringify(s.openWeekdays || [1,2,3,4,5,6]),
          JSON.stringify(s.closedDates || []), s.minDelay || 72,
          s.about || "", s.cgv || "", s.rgpd || "", s.cookiesPolicy || "",
        ],
      });
    }
  } catch {
    // Settings par défaut
    await db.execute({
      sql: `INSERT INTO settings (_id, brandName, brandTagline, heroTitle, heroSubtitle, heroImageUrl, email, phone, zone, adminPassword) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        genId(), siteConfig.brand.name, siteConfig.brand.tagline,
        siteConfig.hero.defaultTitle, siteConfig.hero.defaultSubtitle,
        siteConfig.hero.defaultImageUrl, siteConfig.contact.email,
        siteConfig.contact.phone, siteConfig.contact.zone, adminPassword,
      ],
    });
  }

  const totalCats = await db.execute("SELECT COUNT(*) as c FROM categories");
  const totalProds = await db.execute("SELECT COUNT(*) as c FROM products");

  return {
    created: {
      categories: (totalCats.rows[0] as any).c,
      products: (totalProds.rows[0] as any).c,
      settings: true,
    },
    adminPassword: "Art1234!",
    alreadySeeded: false,
  };
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export async function POST() {
  try {
    const result = await seed();
    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Erreur seed" }, { status: 500 });
  }
}