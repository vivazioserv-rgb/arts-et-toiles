// ═══════════════════════════════════════════════════════
// Base de données unifiée
// Priorité : Turso (si dispo) → fallback JSON local
// ═══════════════════════════════════════════════════════

import { getDb, initDatabase } from "./turso";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

// ── helpers JSON ──────────────────────────────────────
function readJson<T>(col: string): T[] {
  const fp = path.join(DATA_DIR, `${col}.json`);
  if (!fs.existsSync(fp)) return [];
  try { return JSON.parse(fs.readFileSync(fp, "utf-8")); } catch { return []; }
}
function writeJson<T>(col: string, data: T[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(path.join(DATA_DIR, `${col}.json`), JSON.stringify(data, null, 2));
  } catch { /* Vercel = read-only */ }
}
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
const now = () => new Date().toISOString();

// ── détection Turso ───────────────────────────────────
let _tursoInit = false;
let _tursoDb: any = null;

async function hasTurso() {
  if (_tursoInit) return _tursoDb;
  _tursoInit = true;

  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    _tursoDb = null;
    return null;
  }

  try {
    const c = getDb();
    await initDatabase();
    await c.execute("SELECT 1");
    _tursoDb = c;
    return c;
  } catch (e: any) {
    console.warn("⚠️ Turso indisponible:", e?.message || e);
    _tursoDb = null;
    return null;
  }
}

// ═══════════════════════════════════════════════════════
export const db = {
  categories: {
    all: async () => {
      const t = await hasTurso();
      if (t) {
        const r = await t.execute("SELECT * FROM categories ORDER BY name");
        return r.rows.map((row: any) => ({ _id: row._id, name: row.name, emoji: row.emoji || "", imageUrl: row.imageUrl || "", active: row.active !== 0 }));
      }
      return readJson<any>("categories");
    },
    active: async () => { const a = await db.categories.all(); return a.filter((c: any) => c.active !== false); },
    get: async (id: string) => {
      const t = await hasTurso();
      if (t) {
        const r = await t.execute({ sql: "SELECT * FROM categories WHERE _id = ?", args: [id] });
        if (r.rows.length === 0) return null;
        const row: any = r.rows[0];
        return { _id: row._id, name: row.name, emoji: row.emoji || "", imageUrl: row.imageUrl || "", active: row.active !== 0 };
      }
      return readJson<any>("categories").find((c: any) => c._id === id) || null;
    },
    create: async (data: any) => {
      const doc = { _id: genId(), createdAt: now(), ...data };
      const t = await hasTurso();
      if (t) {
        await t.execute({ sql: "INSERT INTO categories (_id, name, emoji, imageUrl, active) VALUES (?, ?, ?, ?, ?)", args: [doc._id, doc.name, doc.emoji || "", doc.imageUrl || "", doc.active !== false ? 1 : 0] });
        return doc;
      }
      const items = readJson<any>("categories"); items.push(doc); writeJson("categories", items); return doc;
    },
    update: async (id: string, data: any) => {
      const t = await hasTurso();
      if (t) {
        const sets = Object.keys(data).filter(k => k !== "_id" && k !== "createdAt").map(k => `${k}=?`);
        const vals = sets.map((_, i) => Object.values(data).filter((_, j) => j > 0 && j <= sets.length)[i]);
        // Simple manual approach
        const fields: string[] = []; const args: any[] = [];
        if (data.name !== undefined) { fields.push("name=?"); args.push(data.name); }
        if (data.emoji !== undefined) { fields.push("emoji=?"); args.push(data.emoji); }
        if (data.imageUrl !== undefined) { fields.push("imageUrl=?"); args.push(data.imageUrl); }
        if (data.active !== undefined) { fields.push("active=?"); args.push(data.active ? 1 : 0); }
        if (fields.length > 0) { args.push(id); await t.execute({ sql: `UPDATE categories SET ${fields.join(",")} WHERE _id=?`, args }); }
        const r = await t.execute({ sql: "SELECT * FROM categories WHERE _id=?", args: [id] });
        if (r.rows.length === 0) return null;
        const row: any = r.rows[0];
        return { _id: row._id, name: row.name, emoji: row.emoji || "", imageUrl: row.imageUrl || "", active: row.active !== 0 };
      }
      const items = readJson<any>("categories"); const idx = items.findIndex((c: any) => c._id === id);
      if (idx === -1) return null; items[idx] = { ...items[idx], ...data }; writeJson("categories", items); return items[idx];
    },
    remove: async (id: string) => {
      const t = await hasTurso();
      if (t) { await t.execute({ sql: "DELETE FROM categories WHERE _id=?", args: [id] }); return; }
      writeJson("categories", readJson<any>("categories").filter((c: any) => c._id !== id));
    },
  },

  products: {
    all: async () => {
      const t = await hasTurso();
      if (t) {
        const r = await t.execute("SELECT * FROM products ORDER BY createdAt DESC");
        return r.rows.map(mapProduct);
      }
      return readJson<any>("products");
    },
    get: async (id: string) => {
      const t = await hasTurso();
      if (t) {
        const r = await t.execute({ sql: "SELECT * FROM products WHERE _id=?", args: [id] });
        if (r.rows.length === 0) return null;
        return mapProduct(r.rows[0]);
      }
      return readJson<any>("products").find((p: any) => p._id === id) || null;
    },
    create: async (data: any) => {
      const doc = { _id: genId(), createdAt: now(), ...data, flavors: data.flavors || [], sizes: data.sizes || [], images: data.images || [], imageUrl: data.imageUrl || "" };
      const t = await hasTurso();
      if (t) {
        await t.execute({
          sql: "INSERT INTO products (_id, name, shortDesc, longDesc, basePrice, delay, isNew, status, imageUrl, images, allergens, category, flavors, sizes, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
          args: [doc._id, doc.name, doc.shortDesc || "", doc.longDesc || "", doc.basePrice, doc.delay || 48, doc.isNew ? 1 : 0, doc.status || "available", doc.imageUrl, JSON.stringify(doc.images), doc.allergens || "", doc.category || "", JSON.stringify(doc.flavors), JSON.stringify(doc.sizes), doc.createdAt],
        });
        return doc;
      }
      const items = readJson<any>("products"); items.push(doc); writeJson("products", items); return doc;
    },
    update: async (id: string, data: any) => {
      const t = await hasTurso();
      if (t) {
        const fields: string[] = []; const args: any[] = [];
        const map: Record<string, any> = { name: data.name, shortDesc: data.shortDesc, longDesc: data.longDesc, basePrice: data.basePrice, delay: data.delay, isNew: data.isNew !== undefined ? (data.isNew ? 1 : 0) : undefined, status: data.status, imageUrl: data.imageUrl, allergens: data.allergens, category: data.category };
        if (data.images !== undefined) map.images = JSON.stringify(data.images);
        if (data.flavors !== undefined) map.flavors = JSON.stringify(data.flavors);
        if (data.sizes !== undefined) map.sizes = JSON.stringify(data.sizes);
        Object.entries(map).forEach(([k, v]) => { if (v !== undefined) { fields.push(`${k}=?`); args.push(v); } });
        if (fields.length > 0) { args.push(id); await t.execute({ sql: `UPDATE products SET ${fields.join(",")} WHERE _id=?`, args }); }
        const r = await t.execute({ sql: "SELECT * FROM products WHERE _id=?", args: [id] });
        if (r.rows.length === 0) return null;
        return mapProduct(r.rows[0]);
      }
      const items = readJson<any>("products"); const idx = items.findIndex((p: any) => p._id === id);
      if (idx === -1) return null; items[idx] = { ...items[idx], ...data }; writeJson("products", items); return items[idx];
    },
    remove: async (id: string) => {
      const t = await hasTurso();
      if (t) { await t.execute({ sql: "DELETE FROM products WHERE _id=?", args: [id] }); return; }
      writeJson("products", readJson<any>("products").filter((p: any) => p._id !== id));
    },
  },

  orders: {
    all: async (filter?: any) => {
      const t = await hasTurso();
      if (t) {
        let sql = "SELECT * FROM orders"; const args: any[] = [];
        if (filter?.status) { sql += " WHERE status=?"; args.push(filter.status); }
        sql += " ORDER BY createdAt DESC";
        const r = await t.execute({ sql, args });
        return r.rows.map(mapOrder);
      }
      let items = readJson<any>("orders");
      if (filter?.status) items = items.filter((o: any) => o.status === filter.status);
      return items.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    get: async (id: string) => {
      const t = await hasTurso();
      if (t) {
        const r = await t.execute({ sql: "SELECT * FROM orders WHERE _id=?", args: [id] });
        if (r.rows.length === 0) return null;
        return mapOrder(r.rows[0]);
      }
      return readJson<any>("orders").find((o: any) => o._id === id) || null;
    },
    create: async (data: any) => {
      const doc = { _id: genId(), createdAt: now(), ...data };
      const t = await hasTurso();
      if (t) {
        await t.execute({
          sql: "INSERT INTO orders (_id, client, email, phone, items, total, pickupDate, slot, mode, address, note, status, paymentStatus, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
          args: [doc._id, doc.client, doc.email, doc.phone || "", JSON.stringify(doc.items || []), doc.total, doc.pickupDate || "", doc.slot || "", doc.mode || "delivery", doc.address || "", doc.note || "", doc.status || "pending", doc.paymentStatus || "pending", doc.createdAt],
        });
        return doc;
      }
      const items = readJson<any>("orders"); items.push(doc); writeJson("orders", items); return doc;
    },
    update: async (id: string, data: any) => {
      const t = await hasTurso();
      if (t) {
        const fields: string[] = []; const args: any[] = [];
        Object.entries(data).forEach(([k, v]) => {
          if (k !== "_id" && k !== "createdAt" && v !== undefined) {
            fields.push(`${k}=?`); args.push(k === "items" ? JSON.stringify(v) : v);
          }
        });
        if (fields.length > 0) { args.push(id); await t.execute({ sql: `UPDATE orders SET ${fields.join(",")} WHERE _id=?`, args }); }
        const r = await t.execute({ sql: "SELECT * FROM orders WHERE _id=?", args: [id] });
        if (r.rows.length === 0) return null;
        return mapOrder(r.rows[0]);
      }
      const items = readJson<any>("orders"); const idx = items.findIndex((o: any) => o._id === id);
      if (idx === -1) return null; items[idx] = { ...items[idx], ...data }; writeJson("orders", items); return items[idx];
    },
  },

  settings: {
    get: async () => {
      const t = await hasTurso();
      if (t) {
        const r = await t.execute("SELECT * FROM settings LIMIT 1");
        if (r.rows.length === 0) return null;
        return mapSettings(r.rows[0]);
      }
      return readJson<any>("settings")[0] || null;
    },
    upsert: async (data: any) => {
      const t = await hasTurso();
      if (t) {
        const ex = await t.execute("SELECT _id FROM settings LIMIT 1");
        if (ex.rows.length > 0) {
          const rid = (ex.rows[0] as any)._id;
          const fields: string[] = []; const args: any[] = [];
          Object.entries(data).forEach(([k, v]) => {
            if (k !== "_id" && v !== undefined) {
              fields.push(`${k}=?`); args.push(Array.isArray(v) ? JSON.stringify(v) : v);
            }
          });
          if (fields.length > 0) { args.push(rid); await t.execute({ sql: `UPDATE settings SET ${fields.join(",")} WHERE _id=?`, args }); }
        } else {
          const id = genId();
          const keys = Object.keys(data);
          const vals = Object.values(data).map((v: any) => Array.isArray(v) ? JSON.stringify(v) : v);
          await t.execute({ sql: `INSERT INTO settings (_id, ${keys.join(",")}) VALUES (?,${keys.map(() => "?").join(",")})`, args: [id, ...vals] });
        }
        const r = await t.execute("SELECT * FROM settings LIMIT 1");
        if (r.rows.length === 0) return null;
        return mapSettings(r.rows[0]);
      }
      const items = readJson<any>("settings");
      if (items.length > 0) { items[0] = { ...items[0], ...data }; writeJson("settings", items); return items[0]; }
      const doc = { _id: genId(), ...data }; writeJson("settings", [doc]); return doc;
    },
  },
};

// ── Mappers ──────────────────────────────────────────
function safeParse(s: any, fb: any) {
  if (!s) return fb; if (typeof s === "object") return s;
  try { return JSON.parse(s); } catch { return fb; }
}
function mapProduct(row: any) {
  return {
    _id: row._id, name: row.name, shortDesc: row.shortDesc || "", longDesc: row.longDesc || "",
    basePrice: Number(row.basePrice), delay: Number(row.delay || 48),
    isNew: row.isNew === 1 || row.isNew === true,
    status: row.status || "available", imageUrl: row.imageUrl || "",
    images: safeParse(row.images, []), allergens: row.allergens || "",
    category: row.category || null, flavors: safeParse(row.flavors, []), sizes: safeParse(row.sizes, []),
    createdAt: row.createdAt || now(), categoryObj: null,
  };
}
function mapOrder(row: any) {
  return {
    _id: row._id, client: row.client, email: row.email, phone: row.phone || "",
    items: safeParse(row.items, []), total: Number(row.total),
    pickupDate: row.pickupDate || "", slot: row.slot || "", mode: row.mode || "delivery",
    address: row.address || "", note: row.note || "",
    status: row.status || "pending", paymentStatus: row.paymentStatus || "pending",
    createdAt: row.createdAt || now(),
  };
}
function mapSettings(row: any) {
  return {
    _id: row._id, brandName: row.brandName || "", brandTagline: row.brandTagline || "",
    heroTitle: row.heroTitle || "", heroSubtitle: row.heroSubtitle || "",
    heroImageUrl: row.heroImageUrl || "", commissionImageUrl: row.commissionImageUrl || "",
    email: row.email || "", phone: row.phone || "", zone: row.zone || "",
    adminPassword: row.adminPassword || "", slots: safeParse(row.slots, []),
    openWeekdays: safeParse(row.openWeekdays, [1,2,3,4,5,6]), closedDates: safeParse(row.closedDates, []),
    minDelay: Number(row.minDelay || 72), about: row.about || "", cgv: row.cgv || "",
    rgpd: row.rgpd || "", cookiesPolicy: row.cookiesPolicy || "",
  };
}