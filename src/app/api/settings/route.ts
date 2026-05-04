import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteConfig } from "@/site.config";

export async function GET() {
  const s = db.settings.get();
  if (!s) {
    return NextResponse.json({
      brandName: siteConfig.brand.name,
      brandTagline: siteConfig.brand.tagline,
      heroTitle: siteConfig.hero.defaultTitle,
      heroSubtitle: siteConfig.hero.defaultSubtitle,
      heroImageUrl: siteConfig.hero.defaultImageUrl,
      email: siteConfig.contact.email,
      phone: siteConfig.contact.phone,
      zone: siteConfig.contact.zone,
      slots: siteConfig.defaults.slots,
      openWeekdays: siteConfig.defaults.openWeekdays,
      minDelay: siteConfig.defaults.minDelay,
    });
  }
  const { adminPassword, ...rest } = s as any;
  return NextResponse.json(rest);
}

export async function PUT(req: NextRequest) {
  try {
    const updates = await req.json();
    if (updates.adminPassword && updates.adminPassword.length > 0) {
      const bcrypt = await import("bcryptjs");
      updates.adminPassword = await bcrypt.hash(updates.adminPassword, 10);
    } else {
      delete updates.adminPassword;
    }
    const s = db.settings.upsert(updates);
    const { adminPassword, ...rest } = s as any;
    return NextResponse.json(rest);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Erreur" }, { status: 400 });
  }
}