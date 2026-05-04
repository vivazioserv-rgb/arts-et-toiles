// ═══════════════════════════════════════════════════════════════════
// Local JSON Database (sans MongoDB) pour le développement
// ═══════════════════════════════════════════════════════════════════

import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

function dbPath(collection: string) {
  return path.join(DATA_DIR, `${collection}.json`);
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function read<T>(collection: string): T[] {
  ensureDir();
  const fp = dbPath(collection);
  if (!fs.existsSync(fp)) return [];
  try {
    return JSON.parse(fs.readFileSync(fp, "utf-8"));
  } catch {
    return [];
  }
}

function write<T>(collection: string, data: T[]) {
  ensureDir();
  fs.writeFileSync(dbPath(collection), JSON.stringify(data, null, 2), "utf-8");
}

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════

export type Flavor = { _id?: string; name: string; imageUrl?: string; surcharge: number };
export type Size = { _id?: string; name: string; surcharge: number };
export type Category = { _id: string; name: string; emoji?: string; imageUrl?: string; active?: boolean };
export type Product = {
  _id: string;
  name: string;
  shortDesc?: string;
  longDesc?: string;
  basePrice: number;
  delay?: number;
  isNew?: boolean;
  status?: string;
  imageUrl?: string;
  images?: string[];
  allergens?: string;
  category?: string | null;
  categoryObj?: Category | null;
  flavors?: Flavor[];
  sizes?: Size[];
  createdAt?: string;
};
export type OrderItem = {
  productId: string;
  name: string;
  flavor?: string;
  size?: string;
  quantity: number;
  price: number;
};
export type Order = {
  _id: string;
  client: string;
  email: string;
  phone?: string;
  items: OrderItem[];
  total: number;
  pickupDate?: string;
  slot?: string;
  mode: string;
  address?: string;
  note?: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
};
export type Settings = {
  _id: string;
  brandName: string;
  brandTagline: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  email: string;
  phone: string;
  zone: string;
  adminPassword: string;
  slots: string[];
  openWeekdays: number[];
  closedDates: string[];
  minDelay: number;
  about: string;
  cgv: string;
  rgpd: string;
  cookiesPolicy: string;
};

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════

let idCounter = Date.now();
export function genId() {
  return (++idCounter).toString(36);
}

export function now() {
  return new Date().toISOString();
}

export function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// ═══════════════════════════════════════════════════════════════════
// Collection accessors
// ═══════════════════════════════════════════════════════════════════

export const db = {
  categories: {
    all: () => read<Category>("categories"),
    active: () => read<Category>("categories").filter((c) => c.active !== false),
    get: (id: string) => read<Category>("categories").find((c) => c._id === id) || null,
    create: (data: Omit<Category, "_id">) => {
      const items = read<Category>("categories");
      const doc = { _id: genId(), ...data };
      items.push(doc);
      write("categories", items);
      return doc;
    },
    update: (id: string, data: Partial<Category>) => {
      const items = read<Category>("categories");
      const idx = items.findIndex((c) => c._id === id);
      if (idx === -1) return null;
      items[idx] = { ...items[idx], ...data };
      write("categories", items);
      return items[idx];
    },
    remove: (id: string) => {
      const items = read<Category>("categories");
      write("categories", items.filter((c) => c._id !== id));
    },
  },

  products: {
    all: () => read<Product>("products"),
    get: (id: string) => read<Product>("products").find((p) => p._id === id) || null,
    create: (data: Omit<Product, "_id" | "createdAt">) => {
      const items = read<Product>("products");
      const doc = { _id: genId(), createdAt: now(), ...data };
      items.push(doc);
      write("products", items);
      return doc;
    },
    update: (id: string, data: Partial<Product>) => {
      const items = read<Product>("products");
      const idx = items.findIndex((p) => p._id === id);
      if (idx === -1) return null;
      items[idx] = { ...items[idx], ...data };
      write("products", items);
      return items[idx];
    },
    remove: (id: string) => {
      const items = read<Product>("products");
      write("products", items.filter((p) => p._id !== id));
    },
  },

  orders: {
    all: (filter?: Partial<Order>) => {
      let items = read<Order>("orders");
      if (filter) {
        Object.entries(filter).forEach(([k, v]) => {
          items = items.filter((o: any) => o[k] === v);
        });
      }
      return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    get: (id: string) => read<Order>("orders").find((o) => o._id === id) || null,
    create: (data: Omit<Order, "_id" | "createdAt">) => {
      const items = read<Order>("orders");
      const doc = { _id: genId(), createdAt: now(), ...data };
      items.push(doc);
      write("orders", items);
      return doc;
    },
    update: (id: string, data: Partial<Order>) => {
      const items = read<Order>("orders");
      const idx = items.findIndex((o) => o._id === id);
      if (idx === -1) return null;
      items[idx] = { ...items[idx], ...data };
      write("orders", items);
      return items[idx];
    },
  },

  settings: {
    get: () => {
      const items = read<Settings>("settings");
      return items[0] || null;
    },
    upsert: (data: Partial<Settings>) => {
      const items = read<Settings>("settings");
      if (items.length > 0) {
        items[0] = { ...items[0], ...data };
        write("settings", items);
        return items[0];
      }
      const doc = { _id: genId(), ...data } as Settings;
      write("settings", [doc]);
      return doc;
    },
  },
};