import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { client, email, items, total } = body;
    if (!client || !email || !items?.length || total === undefined) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }
    const o = db.orders.create(body);
    return NextResponse.json(o, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Erreur" }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const status = sp.get("status");
  const page = parseInt(sp.get("page") || "1");
  const limit = parseInt(sp.get("limit") || "20");
  let orders = status ? db.orders.all({ status } as any) : db.orders.all();
  const total = orders.length;
  orders = orders.slice((page - 1) * limit, page * limit);
  return NextResponse.json({ orders, total, page, pages: Math.ceil(total / limit) });
}