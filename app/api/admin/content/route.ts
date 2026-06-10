import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/admin-auth";
import {
  getEditableContent,
  saveEditableContent,
  getEditableCheckout,
  saveEditableCheckout,
} from "@/lib/content";
import type { EditableContent, EditableCheckout } from "@/lib/content-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Retorna o conteúdo editável atual (mídia da landing + config do checkout). */
export async function GET() {
  if (!isAuthed()) {
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  }
  const [content, checkout] = await Promise.all([getEditableContent(), getEditableCheckout()]);
  return NextResponse.json({ ok: true, content, checkout });
}

/** Salva as alterações de mídia e/ou do checkout vindas do painel. */
export async function POST(req: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  }

  let body: { content?: EditableContent; checkout?: EditableCheckout };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Dados inválidos." }, { status: 400 });
  }

  try {
    if (body.content) await saveEditableContent(body.content);
    if (body.checkout) await saveEditableCheckout(body.checkout);
  } catch (err) {
    console.error("[admin/content] falha ao salvar:", err);
    return NextResponse.json({ ok: false, error: "Não foi possível salvar." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
