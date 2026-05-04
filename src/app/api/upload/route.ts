// ═══════════════════════════════════════════════════════════════════
// API d'upload d'images — Cloudflare R2
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

// Configuration R2
const r2AccountId = process.env.R2_ACCOUNT_ID;
const r2AccessKey = process.env.R2_ACCESS_KEY_ID;
const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY;
const r2Bucket = process.env.R2_BUCKET_NAME || "arts-et-toiles-images";
const r2PublicUrl = process.env.R2_PUBLIC_URL;

// Fallback : si R2 n'est pas configuré, on retourne un message d'erreur
// pour inviter l'utilisateur à configurer les credentials

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    // Vérifier que c'est bien une image
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Format non supporté. Utilisez JPG, PNG, WebP ou GIF." }, { status: 400 });
    }

    // Taille max : 10 MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 10 MB)" }, { status: 400 });
    }

    // Si R2 n'est pas configuré, on simule un upload (fallback développement)
    if (!r2AccountId || !r2AccessKey || !r2SecretKey) {
      return NextResponse.json({
        url: "", // URL vide : l'utilisateur devra coller une URL externe
        message: "⚠️ Cloudflare R2 n'est pas configuré. Ajoutez les variables d'environnement R2 dans .env.local et Vercel.",
        configured: false,
      });
    }

    // Upload vers Cloudflare R2
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2AccessKey,
        secretAccessKey: r2SecretKey,
      },
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "jpg";
    const key = `products/${crypto.randomUUID()}.${ext}`;

    await client.send(
      new PutObjectCommand({
        Bucket: r2Bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    const publicUrl = r2PublicUrl
      ? `${r2PublicUrl.replace(/\/$/, "")}/${key}`
      : `https://${r2Bucket}.${r2AccountId}.r2.dev/${key}`;

    return NextResponse.json({
      url: publicUrl,
      key,
      configured: true,
      message: "Image uploadée avec succès sur Cloudflare R2",
    });

  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err?.message || "Erreur lors de l'upload" },
      { status: 500 }
    );
  }
}

