import { NextResponse } from "next/server";
import { adminPassword, sessionToken, safeEqual, SESSION_COOKIE } from "@/lib/admin-auth";
import { rateLimit, clientIpFromRequest } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Anti força-bruta: no máx. 8 tentativas por IP a cada 10 minutos.
  const rl = rateLimit(`admin-login:${clientIpFromRequest(req)}`, 8, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: `Muitas tentativas. Aguarde ${Math.ceil(rl.retryAfter / 60)} min.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  let password = "";
  try {
    password = String((await req.json())?.password ?? "");
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }

  if (!safeEqual(password, adminPassword())) {
    return NextResponse.json({ ok: false, error: "Senha incorreta." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, sessionToken(), {
    httpOnly: true, // não acessível por JavaScript (anti-XSS roubo de sessão)
    secure: process.env.NODE_ENV === "production", // só trafega em HTTPS
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });
  return res;
}
