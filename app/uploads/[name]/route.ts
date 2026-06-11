import { NextResponse } from "next/server";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Serve os arquivos enviados pelo painel admin (public/uploads/*).
 *
 * O Next.js só serve arquivos de `public/` que existiam no BUILD; uploads são
 * adicionados em RUNTIME, então o Next não os serve (imagem/vídeo quebrado).
 * Esta rota lê o arquivo do disco e o entrega — com STREAMING e suporte a
 * Range (necessário pra reproduzir/avançar vídeo).
 */
const DIR = path.join(process.cwd(), "public", "uploads");

const TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  mp4: "video/mp4",
  webm: "video/webm",
  ogg: "video/ogg",
  mov: "video/quicktime",
  m4v: "video/x-m4v",
};

export async function GET(req: Request, { params }: { params: { name: string } }) {
  const name = params.name;
  // Só nome de arquivo simples (bloqueia path traversal).
  if (!/^[A-Za-z0-9._-]+$/.test(name)) {
    return new NextResponse("Not found", { status: 404 });
  }
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const type = TYPES[ext];
  if (!type) return new NextResponse("Not found", { status: 404 });

  const file = path.join(DIR, name);
  let size: number;
  try {
    size = (await stat(file)).size;
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  const headers: Record<string, string> = {
    "Content-Type": type,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=604800, immutable",
  };

  // Range (vídeo): devolve só o trecho pedido (206).
  const range = req.headers.get("range");
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    if (m) {
      const start = m[1] ? parseInt(m[1], 10) : 0;
      const end = m[2] ? parseInt(m[2], 10) : size - 1;
      if (Number.isFinite(start) && start >= 0 && end < size && start <= end) {
        const stream = Readable.toWeb(createReadStream(file, { start, end })) as unknown as ReadableStream;
        return new NextResponse(stream, {
          status: 206,
          headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) },
        });
      }
    }
  }

  // Arquivo completo (imagens, ou vídeo sem range).
  const stream = Readable.toWeb(createReadStream(file)) as unknown as ReadableStream;
  return new NextResponse(stream, { headers: { ...headers, "Content-Length": String(size) } });
}
