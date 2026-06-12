import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { execFile } from "child_process";
import { promisify } from "util";
import { isAuthed } from "@/lib/admin-auth";

const execFileAsync = promisify(execFile);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 300 * 1024 * 1024; // 300 MB (vídeos de VSL costumam ser pesados)

// Tipo MIME → extensão. Vídeos grandes: prefira uma URL (YouTube/Vimeo).
const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov", // .MOV do iPhone
  "video/x-m4v": "m4v",
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
      { ok: false, error: "Arquivo muito grande (máx. 300 MB). Para vídeos longos, use uma URL do YouTube/Vimeo." },
      { status: 413 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const id = crypto.randomUUID();

  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (err) {
    console.error("[admin/upload] falha ao criar pasta:", err);
    return NextResponse.json({ ok: false, error: "Falha ao salvar o arquivo." }, { status: 500 });
  }

  // ---- Otimização automática (ffmpeg) ----
  // Imagens → WebP redimensionado (max 1600px, qualidade 80): corta o peso
  // drasticamente (um PNG de 2MB vira ~50-150KB) sem o cliente se preocupar.
  // Vídeos mp4/mov → faststart (move o índice pro início): toca/streama no
  // celular. Se o ffmpeg não existir (ex.: dev local) ou falhar, salva o
  // original — o upload NUNCA quebra por causa da otimização.
  const IMAGE_TO_WEBP = new Set(["png", "jpg", "jpeg", "webp", "avif"]);
  const VIDEO_FASTSTART = new Set(["mp4", "mov", "m4v"]);

  let outName = `${id}.${ext}`; // fallback: arquivo original
  try {
    if (IMAGE_TO_WEBP.has(ext) || VIDEO_FASTSTART.has(ext)) {
      const origPath = path.join(UPLOAD_DIR, `${id}.orig.${ext}`);
      await fs.writeFile(origPath, buffer);

      const isImg = IMAGE_TO_WEBP.has(ext);
      const target = isImg ? `${id}.webp` : `${id}.mp4`;
      const outPath = path.join(UPLOAD_DIR, target);
      const args = isImg
        ? ["-y", "-i", origPath, "-vf", "scale='min(1600,iw)':-2", "-c:v", "libwebp", "-quality", "80", "-compression_level", "6", outPath]
        : ["-y", "-i", origPath, "-c", "copy", "-movflags", "+faststart", outPath];

      try {
        await execFileAsync("ffmpeg", args, { timeout: 120_000 });
        await fs.unlink(origPath).catch(() => {});
        outName = target;
      } catch (e) {
        // ffmpeg ausente/erro → mantém o original (renomeia pro nome final)
        console.warn("[admin/upload] ffmpeg indisponível, salvando original:", String(e).slice(0, 100));
        await fs.rename(origPath, path.join(UPLOAD_DIR, outName)).catch(async () => {
          await fs.writeFile(path.join(UPLOAD_DIR, outName), buffer);
        });
      }
    } else {
      // gif/webm: salva direto (preserva animação/codec)
      await fs.writeFile(path.join(UPLOAD_DIR, outName), buffer);
    }
  } catch (err) {
    console.error("[admin/upload] falha ao gravar:", err);
    return NextResponse.json({ ok: false, error: "Falha ao salvar o arquivo." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, url: `/uploads/${outName}` });
}
