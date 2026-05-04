import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const products = await db.products.all();
    const enriched = await Promise.all(products.map(async (p: any) => ({
      ...p,
      categoryObj: p.category ? await db.categories.get(p.category) : null,
    })));
    return NextResponse.json(enriched);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Erreur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const p = await db.products.create(body);
    return NextResponse.json(p, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Erreur" }, { status: 400 });
  }
}