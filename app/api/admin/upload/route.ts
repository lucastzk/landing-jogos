import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { isAuthed } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 64 * 1024 * 1024; // 64 MB

// Tipo MIME → extensão. Vídeos grandes: prefira uma URL (YouTube/Vimeo).
const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export async function POST(req: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  }

  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get("file");
    if (f instanceof File) file = f;
  } catch {
    return NextResponse.json({ ok: false, error: "Upload inválido." }, { status: 400 });
  }
  if (!file) {
    return NextResponse.json({ ok: false, error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json(
      { ok: false, error: "Formato não suportado (use PNG, JPG, GIF, WEBP, MP4 ou WEBM)." },
      { status: 415 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Arquivo muito grande (máx. 64 MB). Para vídeos longos, use uma URL do YouTube/Vimeo." },
      { status: 413 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const name = `${crypto.randomUUID()}.${ext}`;
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, name), buffer);
  } catch (err) {
    console.error("[admin/upload] falha ao gravar:", err);
    return NextResponse.json({ ok: false, error: "Falha ao salvar o arquivo." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, url: `/uploads/${name}` });
}
