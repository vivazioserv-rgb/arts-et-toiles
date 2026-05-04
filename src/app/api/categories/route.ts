import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const allParam = req.nextUrl.searchParams.get("all");
  const categories = allParam ? await db.categories.all() : await db.categories.active();
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const c = await db.categories.create(body);
    return NextResponse.json(c, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Erreur" }, { status: 400 });
  }
}