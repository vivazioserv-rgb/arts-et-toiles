// ═══════════════════════════════════════════════════════════════════
// Base de données — JSON (développement & production)
// Turso disponible en optionnel (si TURSO_DATABASE_URL est défini)
// ═══════════════════════════════════════════════════════════════════

import { getTursoDb } from "./turso";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const useTurso = !!(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);

function dbPath(collection: string) {
  return path.join(DATA_DIR, `${collection}.json`);
}

function readJson<T>(collection: string): T[] {
  const fp = dbPath(collection);
  if (!fs.existsSync(fp)) return [];
  try {
    return JSON.parse(fs.readFileSync(fp, "utf-8"));
  } catch {
    return [];
  }
}

function writeJson<T>(collection: string, data: T[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(dbPath(collection), JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    // Sur Vercel, l'écriture peut échouer (filesystem read-only)
    // Dans ce cas, on utilise Turso si disponible
    console.warn(`⚠️ Cannot write ${collection}.json:`, e);
  }
}

let idCounter = Date.now();
export function genId() {
  return (++idCounter).toString(36);
}

export function now() {
  return new Date().toISOString();
}

export const db = {
  categories: {
    all: async () => {
      if (useTurso) { try { const d = await getTursoDb(); const r = await d.execute("SELECT * FROM categories ORDER BY name"); return r.rows.map(rowToCategory); } catch {} }
      return readJson<any>("categories");
    },
    active: async () => { const all = await db.categories.all(); return all.filter((c: any) => c.active !== false); },
    get: async (id: string) => {
      if (useTurso) { try { const d = await getTursoDb(); const r = await d.execute({ sql: "SELECT * FROM categories WHERE _id = ?", args: [id] }); if (r.rows.length) return rowToCategory(r.rows[0]); } catch {} }
      return readJson<any>("categories").find((c) => c._id === id) || null;
    },
    create: async (data: any) => {
      const doc = { _id: genId(), createdAt: now(), ...data };
      if (useTurso) { try { const d = await getTursoDb(); await d.execute({ sql: "INSERT INTO categories (_id, name, emoji, imageUrl, active) VALUES (?, ?, ?, ?, ?)", args: [doc._id, doc.name, doc.emoji || "", doc.imageUrl || "", doc.active !== false ? 1 : 0] }); return doc; } catch {} }
      const items = readJson<any>("categories"); items.push(doc); writeJson("categories", items); return doc;
    },
    update: async (id: string, data: Partial<any>) => {
      if (useTurso) { try { const d = await getTursoDb(); const sets: string[] = []; const args: any[] = []; Object.entries(data).forEach(([k, v]) => { if (k !== '_id' && k !== 'createdAt') { sets.push(`${k} = ?`); args.push(v ?? ''); } }); if (sets.length) { args.push(id); await d.execute({ sql: `UPDATE categories SET ${sets.join(", ")} WHERE _id = ?`, args }); } const r = await d.execute({ sql: "SELECT * FROM categories WHERE _id = ?", args: [id] }); if (r.rows.length) return rowToCategory(r.rows[0]); } catch {} }
      const items = readJson<any>("categories"); const idx = items.findIndex((c) => c._id === id); if (idx === -1) return null; items[idx] = { ...items[idx], ...data }; writeJson("categories", items); return items[idx];
    },
    remove: async (id: string) => {
      if (useTurso) { try { const d = await getTursoDb(); await d.execute({ sql: "DELETE FROM categories WHERE _id = ?", args: [id] }); return; } catch {} }
      const items = readJson<any>("categories"); writeJson("categories", items.filter((c) => c._id !== id));
    },
  },

  products: {
    all: async () => {
      if (useTurso) { try { const d = await getTursoDb(); const r = await d.execute("SELECT * FROM products ORDER BY createdAt DESC"); return r.rows.map(rowToProduct); } catch {} }
      return readJson<any>("products");
    },
    get: async (id: string) => {
      if (useTurso) { try { const d = await getTursoDb(); const r = await d.execute({ sql: "SELECT * FROM products WHERE _id = ?", args: [id] }); if (r.rows.length) return rowToProduct(r.rows[0]); } catch {} }
      return readJson<any>("products").find((p) => p._id === id) || null;
    },
    create: async (data: any) => {
      const doc = { _id: genId(), createdAt: now(), ...data };
      if (useTurso) { try { const d = await getTursoDb(); await d.execute({ sql: `INSERT INTO products (_id, name, shortDesc, longDesc, basePrice, delay, isNew, status, imageUrl, images, allergens, category, flavors, sizes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, args: [doc._id, doc.name, doc.shortDesc || "", doc.longDesc || "", doc.basePrice, doc.delay || 48, doc.isNew ? 1 : 0, doc.status || "available", doc.imageUrl || "", JSON.stringify(doc.images || []), doc.allergens || "", doc.category || "", JSON.stringify(doc.flavors || []), JSON.stringify(doc.sizes || []), doc.createdAt] }); return doc; } catch {} }
      const items = readJson<any>("products"); items.push(doc); writeJson("products", items); return doc;
    },
    update: async (id: string, data: Partial<any>) => {
      if (useTurso) { try { const d = await getTursoDb(); const sets: string[] = []; const args: any[] = []; Object.entries(data).forEach(([k, v]) => { if (k !== '_id' && k !== 'createdAt') { const val = Array.isArray(v) ? JSON.stringify(v) : v; sets.push(`${k} = ?`); args.push(val); } }); if (sets.length) { args.push(id); await d.execute({ sql: `UPDATE products SET ${sets.join(", ")} WHERE _id = ?`, args }); } const r = await d.execute({ sql: "SELECT * FROM products WHERE _id = ?", args: [id] }); if (r.rows.length) return rowToProduct(r.rows[0]); } catch {} }
      const items = readJson<any>("products"); const idx = items.findIndex((p) => p._id === id); if (idx === -1) return null; items[idx] = { ...items[idx], ...data }; writeJson("products", items); return items[idx];
    },
    remove: async (id: string) => {
      if (useTurso) { try { const d = await getTursoDb(); await d.execute({ sql: "DELETE FROM products WHERE _id = ?", args: [id] }); return; } catch {} }
      const items = readJson<any>("products"); writeJson("products", items.filter((p) => p._id !== id));
    },
  },

  orders: {
    all: async (filter?: any) => {
      if (useTurso) { try { const d = await getTursoDb(); let sql = "SELECT * FROM orders"; const args: any[] = []; if (filter?.status) { sql += " WHERE status = ?"; args.push(filter.status); } sql += " ORDER BY createdAt DESC"; const r = await d.execute({ sql, args }); return r.rows.map(rowToOrder); } catch {} }
      let items = readJson<any>("orders"); if (filter?.status) items = items.filter((o: any) => o.status === filter.status); return items.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    get: async (id: string) => {
      if (useTurso) { try { const d = await getTursoDb(); const r = await d.execute({ sql: "SELECT * FROM orders WHERE _id = ?", args: [id] }); if (r.rows.length) return rowToOrder(r.rows[0]); } catch {} }
      return readJson<any>("orders").find((o) => o._id === id) || null;
    },
    create: async (data: any) => {
      const doc = { _id: genId(), createdAt: now(), ...data };
      if (useTurso) { try { const d = await getTursoDb(); await d.execute({ sql: `INSERT INTO orders (_id, client, email, phone, items, total, pickupDate, slot, mode, address, note, status, paymentStatus, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, args: [doc._id, doc.client, doc.email, doc.phone || "", JSON.stringify(doc.items || []), doc.total, doc.pickupDate || "", doc.slot || "", doc.mode || "delivery", doc.address || "", doc.note || "", doc.status || "pending", doc.paymentStatus || "pending", doc.createdAt] }); return doc; } catch {} }
      const items = readJson<any>("orders"); items.push(doc); writeJson("orders", items); return doc;
    },
    update: async (id: string, data: Partial<any>) => {
      if (useTurso) { try { const d = await getTursoDb(); const sets: string[] = []; const args: any[] = []; Object.entries(data).forEach(([k, v]) => { if (k !== '_id' && k !== 'createdAt') { const val = Array.isArray(v) ? JSON.stringify(v) : v; sets.push(`${k} = ?`); args.push(val); } }); if (sets.length) { args.push(id); await d.execute({ sql: `UPDATE orders SET ${sets.join(", ")} WHERE _id = ?`, args }); } const r = await d.execute({ sql: "SELECT * FROM orders WHERE _id = ?", args: [id] }); if (r.rows.length) return rowToOrder(r.rows[0]); } catch {} }
      const items = readJson<any>("orders"); const idx = items.findIndex((o) => o._id === id); if (idx === -1) return null; items[idx] = { ...items[idx], ...data }; writeJson("orders", items); return items[idx];
    },
  },

  settings: {
    get: async () => {
      if (useTurso) { try { const d = await getTursoDb(); const r = await d.execute("SELECT * FROM settings LIMIT 1"); if (r.rows.length) return rowToSettings(r.rows[0]); } catch {} }
      const items = readJson<any>("settings"); return items[0] || null;
    },
    upsert: async (data: Partial<any>) => {
      if (useTurso) { try { const d = await getTursoDb(); const existing = await d.execute("SELECT * FROM settings LIMIT 1"); if (existing.rows.length > 0) { const sets: string[] = []; const args: any[] = []; const nowId = (existing.rows[0] as any)._id; Object.entries(data).forEach(([k, v]) => { if (k !== '_id') { sets.push(`${k} = ?`); args.push(v ?? ''); } }); if (sets.length) { args.push(nowId); await d.execute({ sql: `UPDATE settings SET ${sets.join(", ")} WHERE _id = ?`, args }); } const r = await d.execute({ sql: "SELECT * FROM settings WHERE _id = ?", args: [nowId] }); if (r.rows.length) return rowToSettings(r.rows[0]); } else { const doc = { _id: genId(), ...data }; const cols = Object.keys(doc).join(", "); const vals = Object.keys(doc).map(() => "?").join(", "); await d.execute({ sql: `INSERT INTO settings (${cols}) VALUES (${vals})`, args: Object.values(doc) }); return doc; } } catch {} }
      const items = readJson<any>("settings"); if (items.length > 0) { items[0] = { ...items[0], ...data }; writeJson("settings", items); return items[0]; } const doc = { _id: genId(), ...data }; writeJson("settings", [doc]); return doc;
    },
  },
};

// Row mappers
function rowToCategory(row: any) { return { _id: row._id, name: row.name, emoji: row.emoji || "", imageUrl: row.imageUrl || "", active: row.active === 1 || row.active === true }; }
function rowToProduct(row: any) { return { _id: row._id, name: row.name, shortDesc: row.shortDesc || "", longDesc: row.longDesc || "", basePrice: Number(row.basePrice), delay: Number(row.delay || 48), isNew: row.isNew === 1 || row.isNew === true, status: row.status || "available", imageUrl: row.imageUrl || "", images: safeParse(row.images, []), allergens: row.allergens || "", category: row.category || null, flavors: safeParse(row.flavors, []), sizes: safeParse(row.sizes, []), createdAt: row.createdAt || new Date().toISOString(), categoryObj: null }; }
function rowToOrder(row: any) { return { _id: row._id, client: row.client, email: row.email, phone: row.phone || "", items: safeParse(row.items, []), total: Number(row.total), pickupDate: row.pickupDate || "", slot: row.slot || "", mode: row.mode || "delivery", address: row.address || "", note: row.note || "", status: row.status || "pending", paymentStatus: row.paymentStatus || "pending", createdAt: row.createdAt || new Date().toISOString() }; }
function rowToSettings(row: any) { return { _id: row._id, brandName: row.brandName || "", brandTagline: row.brandTagline || "", heroTitle: row.heroTitle || "", heroSubtitle: row.heroSubtitle || "", heroImageUrl: row.heroImageUrl || "", commissionImageUrl: row.commissionImageUrl || "", email: row.email || "", phone: row.phone || "", zone: row.zone || "", adminPassword: row.adminPassword || "", slots: safeParse(row.slots, []), openWeekdays: safeParse(row.openWeekdays, [1,2,3,4,5,6]), closedDates: safeParse(row.closedDates, []), minDelay: Number(row.minDelay || 72), about: row.about || "", cgv: row.cgv || "", rgpd: row.rgpd || "", cookiesPolicy: row.cookiesPolicy || "" }; }
function safeParse(str: any, fallback: any) { if (!str) return fallback; if (typeof str === "object") return str; try { return JSON.parse(str); } catch { return fallback; } }