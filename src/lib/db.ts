// ═══════════════════════════════════════════════════════════════════
// Base de données — Turso (production) / JSON local (développement)
// ═══════════════════════════════════════════════════════════════════

import { getTursoDb } from "./turso";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const isDev = process.env.NODE_ENV !== "production";
const useTurso = !!process.env.TURSO_DATABASE_URL;

// ═══════════════════════════════════════════════════════════════════
// Helpers JSON (développement local uniquement)
// ═══════════════════════════════════════════════════════════════════

function dbPath(collection: string) {
  return path.join(DATA_DIR, `${collection}.json`);
}

function readJson<T>(collection: string): T[] {
  if (!isDev) return [];
  const fp = dbPath(collection);
  if (!fs.existsSync(fp)) return [];
  try {
    return JSON.parse(fs.readFileSync(fp, "utf-8"));
  } catch {
    return [];
  }
}

function writeJson<T>(collection: string, data: T[]) {
  if (!isDev) return;
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(dbPath(collection), JSON.stringify(data, null, 2), "utf-8");
}

// ═══════════════════════════════════════════════════════════════════
// Génération d'ID
// ═══════════════════════════════════════════════════════════════════

let idCounter = Date.now();
export function genId() {
  return (++idCounter).toString(36);
}

export function now() {
  return new Date().toISOString();
}

// ═══════════════════════════════════════════════════════════════════
// API Base de données — Fonctionne avec Turso ET JSON local
// ═══════════════════════════════════════════════════════════════════

type Row = Record<string, any>;

export const db = {
  categories: {
    all: async () => {
      if (useTurso) {
        const db2 = await getTursoDb();
        const res = await db2.execute("SELECT * FROM categories ORDER BY name");
        return res.rows.map(rowToCategory);
      }
      return readJson<any>("categories");
    },
    active: async () => {
      const all = await db.categories.all();
      return all.filter((c: any) => c.active !== false);
    },
    get: async (id: string) => {
      if (useTurso) {
        const db2 = await getTursoDb();
        const res = await db2.execute({ sql: "SELECT * FROM categories WHERE _id = ?", args: [id] });
        return res.rows.length ? rowToCategory(res.rows[0]) : null;
      }
      return readJson<any>("categories").find((c) => c._id === id) || null;
    },
    create: async (data: any) => {
      const doc = { _id: genId(), ...data };
      if (useTurso) {
        const db2 = await getTursoDb();
        await db2.execute({
          sql: "INSERT INTO categories (_id, name, emoji, imageUrl, active) VALUES (?, ?, ?, ?, ?)",
          args: [doc._id, doc.name, doc.emoji || "", doc.imageUrl || "", doc.active !== false ? 1 : 0],
        });
      } else {
        const items = readJson<any>("categories");
        items.push(doc);
        writeJson("categories", items);
      }
      return doc;
    },
    update: async (id: string, data: Partial<any>) => {
      if (useTurso) {
        const db2 = await getTursoDb();
        const sets: string[] = [];
        const args: any[] = [];
        if (data.name !== undefined) { sets.push("name = ?"); args.push(data.name); }
        if (data.emoji !== undefined) { sets.push("emoji = ?"); args.push(data.emoji); }
        if (data.imageUrl !== undefined) { sets.push("imageUrl = ?"); args.push(data.imageUrl); }
        if (data.active !== undefined) { sets.push("active = ?"); args.push(data.active ? 1 : 0); }
        if (sets.length > 0) {
          args.push(id);
          await db2.execute({ sql: `UPDATE categories SET ${sets.join(", ")} WHERE _id = ?`, args });
        }
        const res = await db2.execute({ sql: "SELECT * FROM categories WHERE _id = ?", args: [id] });
        return res.rows.length ? rowToCategory(res.rows[0]) : null;
      }
      const items = readJson<any>("categories");
      const idx = items.findIndex((c) => c._id === id);
      if (idx === -1) return null;
      items[idx] = { ...items[idx], ...data };
      writeJson("categories", items);
      return items[idx];
    },
    remove: async (id: string) => {
      if (useTurso) {
        const db2 = await getTursoDb();
        await db2.execute({ sql: "DELETE FROM categories WHERE _id = ?", args: [id] });
      } else {
        const items = readJson<any>("categories");
        writeJson("categories", items.filter((c) => c._id !== id));
      }
    },
  },

  products: {
    all: async () => {
      if (useTurso) {
        const db2 = await getTursoDb();
        const res = await db2.execute("SELECT * FROM products ORDER BY createdAt DESC");
        return res.rows.map(rowToProduct);
      }
      return readJson<any>("products");
    },
    get: async (id: string) => {
      if (useTurso) {
        const db2 = await getTursoDb();
        const res = await db2.execute({ sql: "SELECT * FROM products WHERE _id = ?", args: [id] });
        return res.rows.length ? rowToProduct(res.rows[0]) : null;
      }
      return readJson<any>("products").find((p) => p._id === id) || null;
    },
    create: async (data: any) => {
      const doc = { _id: genId(), createdAt: now(), ...data };
      if (useTurso) {
        const db2 = await getTursoDb();
        await db2.execute({
          sql: `INSERT INTO products (_id, name, shortDesc, longDesc, basePrice, delay, isNew, status, imageUrl, images, allergens, category, flavors, sizes, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            doc._id, doc.name, doc.shortDesc || "", doc.longDesc || "",
            doc.basePrice, doc.delay || 48, doc.isNew ? 1 : 0, doc.status || "available",
            doc.imageUrl || "", JSON.stringify(doc.images || []),
            doc.allergens || "", doc.category || "",
            JSON.stringify(doc.flavors || []), JSON.stringify(doc.sizes || []),
            doc.createdAt,
          ],
        });
      } else {
        const items = readJson<any>("products");
        items.push(doc);
        writeJson("products", items);
      }
      return doc;
    },
    update: async (id: string, data: Partial<any>) => {
      if (useTurso) {
        const db2 = await getTursoDb();
        const sets: string[] = [];
        const args: any[] = [];
        for (const [key, val] of Object.entries(data)) {
          if (key === "_id" || key === "createdAt") continue;
          if (key === "isNew" || key === "is_new") { sets.push("isNew = ?"); args.push(val ? 1 : 0); continue; }
          const col = key;
          const value = Array.isArray(val) ? JSON.stringify(val) : val;
          sets.push(`${col} = ?`);
          args.push(value);
        }
        if (sets.length > 0) {
          args.push(id);
          await db2.execute({ sql: `UPDATE products SET ${sets.join(", ")} WHERE _id = ?`, args });
        }
        const res = await db2.execute({ sql: "SELECT * FROM products WHERE _id = ?", args: [id] });
        return res.rows.length ? rowToProduct(res.rows[0]) : null;
      }
      const items = readJson<any>("products");
      const idx = items.findIndex((p) => p._id === id);
      if (idx === -1) return null;
      items[idx] = { ...items[idx], ...data };
      writeJson("products", items);
      return items[idx];
    },
    remove: async (id: string) => {
      if (useTurso) {
        const db2 = await getTursoDb();
        await db2.execute({ sql: "DELETE FROM products WHERE _id = ?", args: [id] });
      } else {
        const items = readJson<any>("products");
        writeJson("products", items.filter((p) => p._id !== id));
      }
    },
  },

  orders: {
    all: async (filter?: any) => {
      if (useTurso) {
        const db2 = await getTursoDb();
        let sql = "SELECT * FROM orders";
        const args: any[] = [];
        if (filter?.status) { sql += " WHERE status = ?"; args.push(filter.status); }
        sql += " ORDER BY createdAt DESC";
        const res = await db2.execute({ sql, args });
        return res.rows.map(rowToOrder);
      }
      let items = readJson<any>("orders");
      if (filter?.status) items = items.filter((o: any) => o.status === filter.status);
      return items.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    get: async (id: string) => {
      if (useTurso) {
        const db2 = await getTursoDb();
        const res = await db2.execute({ sql: "SELECT * FROM orders WHERE _id = ?", args: [id] });
        return res.rows.length ? rowToOrder(res.rows[0]) : null;
      }
      return readJson<any>("orders").find((o) => o._id === id) || null;
    },
    create: async (data: any) => {
      const doc = { _id: genId(), createdAt: now(), ...data };
      if (useTurso) {
        const db2 = await getTursoDb();
        await db2.execute({
          sql: `INSERT INTO orders (_id, client, email, phone, items, total, pickupDate, slot, mode, address, note, status, paymentStatus, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            doc._id, doc.client, doc.email, doc.phone || "",
            JSON.stringify(doc.items || []), doc.total,
            doc.pickupDate || "", doc.slot || "", doc.mode || "delivery",
            doc.address || "", doc.note || "", doc.status || "pending",
            doc.paymentStatus || "pending", doc.createdAt,
          ],
        });
      } else {
        const items = readJson<any>("orders");
        items.push(doc);
        writeJson("orders", items);
      }
      return doc;
    },
    update: async (id: string, data: Partial<any>) => {
      if (useTurso) {
        const db2 = await getTursoDb();
        const sets: string[] = [];
        const args: any[] = [];
        for (const [key, val] of Object.entries(data)) {
          if (key === "_id" || key === "createdAt") continue;
          const value = Array.isArray(val) ? JSON.stringify(val) : val;
          sets.push(`${key} = ?`);
          args.push(value);
        }
        if (sets.length > 0) {
          args.push(id);
          await db2.execute({ sql: `UPDATE orders SET ${sets.join(", ")} WHERE _id = ?`, args });
        }
        const res = await db2.execute({ sql: "SELECT * FROM orders WHERE _id = ?", args: [id] });
        return res.rows.length ? rowToOrder(res.rows[0]) : null;
      }
      const items = readJson<any>("orders");
      const idx = items.findIndex((o) => o._id === id);
      if (idx === -1) return null;
      items[idx] = { ...items[idx], ...data };
      writeJson("orders", items);
      return items[idx];
    },
  },

  settings: {
    get: async () => {
      if (useTurso) {
        const db2 = await getTursoDb();
        const res = await db2.execute("SELECT * FROM settings LIMIT 1");
        return res.rows.length ? rowToSettings(res.rows[0]) : null;
      }
      const items = readJson<any>("settings");
      return items[0] || null;
    },
    upsert: async (data: Partial<any>) => {
      if (useTurso) {
        const db2 = await getTursoDb();
        const existing = await db2.execute("SELECT * FROM settings LIMIT 1");
        if (existing.rows.length > 0) {
          const sets: string[] = [];
          const args: any[] = [];
          const nowId = (existing.rows[0] as any)._id;
          for (const [key, val] of Object.entries(data)) {
            if (key === "_id") continue;
            sets.push(`${key} = ?`);
            args.push(val ?? "");
          }
          if (sets.length > 0) {
            args.push(nowId);
            await db2.execute({ sql: `UPDATE settings SET ${sets.join(", ")} WHERE _id = ?`, args });
          }
          const res = await db2.execute({ sql: "SELECT * FROM settings WHERE _id = ?", args: [nowId] });
          return res.rows.length ? rowToSettings(res.rows[0]) : null;
        }
        const doc = { _id: genId(), ...data };
        const cols = Object.keys(doc).join(", ");
        const vals = Object.keys(doc).map(() => "?").join(", ");
        await db2.execute({ sql: `INSERT INTO settings (${cols}) VALUES (${vals})`, args: Object.values(doc) });
        return doc;
      }
      const items = readJson<any>("settings");
      if (items.length > 0) {
        items[0] = { ...items[0], ...data };
        writeJson("settings", items);
        return items[0];
      }
      const doc = { _id: genId(), ...data };
      writeJson("settings", [doc]);
      return doc;
    },
  },
};

// ═══════════════════════════════════════════════════════════════════
// Row mappers (Turso → objet)
// ═══════════════════════════════════════════════════════════════════

function rowToCategory(row: Row): any {
  return {
    _id: row._id,
    name: row.name,
    emoji: row.emoji || "",
    imageUrl: row.imageUrl || "",
    active: row.active === 1 || row.active === true,
  };
}

function rowToProduct(row: Row): any {
  const product: any = {
    _id: row._id,
    name: row.name,
    shortDesc: row.shortDesc || "",
    longDesc: row.longDesc || "",
    basePrice: Number(row.basePrice),
    delay: Number(row.delay || 48),
    isNew: row.isNew === 1 || row.isNew === true,
    status: row.status || "available",
    imageUrl: row.imageUrl || "",
    images: safeParseJson(row.images, []),
    allergens: row.allergens || "",
    category: row.category || null,
    flavors: safeParseJson(row.flavors, []),
    sizes: safeParseJson(row.sizes, []),
    createdAt: row.createdAt || new Date().toISOString(),
  };
  return product;
}

function rowToOrder(row: Row): any {
  return {
    _id: row._id,
    client: row.client,
    email: row.email,
    phone: row.phone || "",
    items: safeParseJson(row.items, []),
    total: Number(row.total),
    pickupDate: row.pickupDate || "",
    slot: row.slot || "",
    mode: row.mode || "delivery",
    address: row.address || "",
    note: row.note || "",
    status: row.status || "pending",
    paymentStatus: row.paymentStatus || "pending",
    createdAt: row.createdAt || new Date().toISOString(),
  };
}

function rowToSettings(row: Row): any {
  return {
    _id: row._id,
    brandName: row.brandName || "",
    brandTagline: row.brandTagline || "",
    heroTitle: row.heroTitle || "",
    heroSubtitle: row.heroSubtitle || "",
    heroImageUrl: row.heroImageUrl || "",
    commissionImageUrl: row.commissionImageUrl || "",
    email: row.email || "",
    phone: row.phone || "",
    zone: row.zone || "",
    adminPassword: row.adminPassword || "",
    slots: safeParseJson(row.slots, []),
    openWeekdays: safeParseJson(row.openWeekdays, [1, 2, 3, 4, 5, 6]),
    closedDates: safeParseJson(row.closedDates, []),
    minDelay: Number(row.minDelay || 72),
    about: row.about || "",
    cgv: row.cgv || "",
    rgpd: row.rgpd || "",
    cookiesPolicy: row.cookiesPolicy || "",
  };
}

function safeParseJson(str: any, fallback: any): any {
  if (!str) return fallback;
  if (typeof str === "object") return str;
  try { return JSON.parse(str); } catch { return fallback; }
}