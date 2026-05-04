import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const o = db.orders.update(id, body);
  if (!o) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(o);
}