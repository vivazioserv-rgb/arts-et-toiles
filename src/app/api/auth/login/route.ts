import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "douceurs-secret-dev";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({}));
  if (!password) return NextResponse.json({ error: "Mot de passe requis" }, { status: 400 });

  const s = db.settings.get();
  if (!s) return NextResponse.json({ error: "Configuration introuvable. Lancez /api/seed" }, { status: 500 });

  const valid = await bcrypt.compare(password, s.adminPassword);
  if (!valid) return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });

  const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "24h" });
  return NextResponse.json({ token, message: "Connexion réussie" });
}