// ═══════════════════════════════════════════════════════════════════
// Turso — Base de données SQLite serverless
// ═══════════════════════════════════════════════════════════════════

import { createClient } from "@libsql/client";

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

// Fallback pour le développement local avec un fichier SQLite
const isDev = process.env.NODE_ENV !== "production";

export function getDb() {
  if (tursoUrl && tursoToken) {
    return createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });
  }
  // Fallback local (développement)
  return createClient({
    url: `file:${process.cwd()}/data/local.db`,
  });
}

export async function initDatabase() {
  const db = getDb();

  // Catégories
  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      _id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      emoji TEXT DEFAULT '',
      imageUrl TEXT DEFAULT '',
      active INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT (datetime('now'))
    )
  `);

  // Produits
  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      _id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      shortDesc TEXT DEFAULT '',
      longDesc TEXT DEFAULT '',
      basePrice REAL NOT NULL,
      delay INTEGER DEFAULT 48,
      isNew INTEGER DEFAULT 0,
      status TEXT DEFAULT 'available',
      imageUrl TEXT DEFAULT '',
      images TEXT DEFAULT '[]',
      allergens TEXT DEFAULT '',
      category TEXT DEFAULT '',
      flavors TEXT DEFAULT '[]',
      sizes TEXT DEFAULT '[]',
      createdAt TEXT DEFAULT (datetime('now'))
    )
  `);

  // Commandes
  await db.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      _id TEXT PRIMARY KEY,
      client TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT DEFAULT '',
      items TEXT DEFAULT '[]',
      total REAL NOT NULL,
      pickupDate TEXT DEFAULT '',
      slot TEXT DEFAULT '',
      mode TEXT DEFAULT 'delivery',
      address TEXT DEFAULT '',
      note TEXT DEFAULT '',
      status TEXT DEFAULT 'pending',
      paymentStatus TEXT DEFAULT 'pending',
      createdAt TEXT DEFAULT (datetime('now'))
    )
  `);

  // Paramètres
  await db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      _id TEXT PRIMARY KEY,
      brandName TEXT DEFAULT '',
      brandTagline TEXT DEFAULT '',
      heroTitle TEXT DEFAULT '',
      heroSubtitle TEXT DEFAULT '',
      heroImageUrl TEXT DEFAULT '',
      commissionImageUrl TEXT DEFAULT '',
      email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      zone TEXT DEFAULT '',
      adminPassword TEXT DEFAULT '',
      slots TEXT DEFAULT '[]',
      openWeekdays TEXT DEFAULT '[1,2,3,4,5,6]',
      closedDates TEXT DEFAULT '[]',
      minDelay INTEGER DEFAULT 72,
      about TEXT DEFAULT '',
      cgv TEXT DEFAULT '',
      rgpd TEXT DEFAULT '',
      cookiesPolicy TEXT DEFAULT ''
    )
  `);

  return db;
}

let _db: ReturnType<typeof getDb> | null = null;

export async function getTursoDb() {
  if (!_db) {
    _db = getDb();
    await initDatabase();
  }
  return _db;
}

// ═══════════════════════════════════════════════════════════════════
// Helpers de migration : importer les données JSON vers Turso
// ═══════════════════════════════════════════════════════════════════

export async function seedFromJson() {
  const db = await getTursoDb();
  const fs = await import("fs");
  const path = await import("path");
  const dataDir = path.join(process.cwd(), "data");

  // Vérifier si des données existent déjà
  const count = await db.execute("SELECT COUNT(*) as c FROM products");
  if ((count.rows[0] as any).c > 0) return; // déjà seedé

  // Importer les catégories
  try {
    const cats = JSON.parse(fs.readFileSync(path.join(dataDir, "categories.json"), "utf-8"));
    for (const c of cats) {
      await db.execute({
        sql: "INSERT INTO categories (_id, name, emoji, imageUrl, active) VALUES (?, ?, ?, ?, ?)",
        args: [c._id, c.name, c.emoji || "", c.imageUrl || "", c.active ? 1 : 0],
      });
    }
  } catch {}

  // Importer les produits
  try {
    const prods = JSON.parse(fs.readFileSync(path.join(dataDir, "products.json"), "utf-8"));
    for (const p of prods) {
      await db.execute({
        sql: "INSERT INTO products (_id, name, shortDesc, longDesc, basePrice, delay, isNew, status, imageUrl, images, allergens, category, flavors, sizes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        args: [
          p._id, p.name, p.shortDesc || "", p.longDesc || "",
          p.basePrice, p.delay || 48, p.isNew ? 1 : 0, p.status || "available",
          p.imageUrl || "", JSON.stringify(p.images || []),
          p.allergens || "", p.category || "",
          JSON.stringify(p.flavors || []), JSON.stringify(p.sizes || []),
          p.createdAt || new Date().toISOString(),
        ],
      });
    }
  } catch {}

  // Importer les paramètres
  try {
    const settings = JSON.parse(fs.readFileSync(path.join(dataDir, "settings.json"), "utf-8"));
    if (settings.length > 0) {
      const s = settings[0];
      await db.execute({
        sql: "INSERT INTO settings (_id, brandName, brandTagline, heroTitle, heroSubtitle, heroImageUrl, email, phone, zone, adminPassword, about) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        args: [
          s._id, s.brandName || "", s.brandTagline || "",
          s.heroTitle || "", s.heroSubtitle || "", s.heroImageUrl || "",
          s.email || "", s.phone || "", s.zone || "",
          s.adminPassword || "", s.about || "",
        ],
      });
    }
  } catch {}

  return true;
}