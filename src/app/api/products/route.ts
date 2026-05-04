import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const products = db.products.all().map((p) => ({
    ...p,
    categoryObj: p.category ? db.categories.get(p.category) : null,
  }));
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const p = db.products.create(body);
    return NextResponse.json(p, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Erreur" }, { status: 400 });
  }
}