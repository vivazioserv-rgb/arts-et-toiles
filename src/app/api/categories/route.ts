import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "true";
  const cats = all ? db.categories.all() : db.categories.active();
  return NextResponse.json(cats);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const c = db.categories.create(body);
    return NextResponse.json(c, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Erreur" }, { status: 400 });
  }
}