/**
 * Autenticação do painel admin (esboço): senha única + cookie de sessão.
 * Em produção, troque por um login de verdade (usuários, hash, etc.).
 */
import crypto from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "admin_session";

/**
 * Senha do painel (ADMIN_PASSWORD no .env). Em PRODUÇÃO, se não estiver
 * definida, FALHA (não cai numa senha padrão insegura). Só em dev usa "admin".
 */
export function adminPassword(): string {
  const p = process.env.ADMIN_PASSWORD;
  if (p && p.length > 0) return p;
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_PASSWORD não definido — recusando autenticação com senha padrão.");
  }
  return "admin"; // somente em desenvolvimento
}

/**
 * Token de sessão guardado no cookie httpOnly. Com ADMIN_SESSION_SECRET (segredo
 * de servidor), usa HMAC — assim o cookie NÃO é derivável só da senha. Sem o
 * segredo, mantém o derivado antigo (compatibilidade). Defina o segredo!
 */
export function sessionToken(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const material = `landing-jogos::${adminPassword()}`;
  if (secret) {
    return crypto.createHmac("sha256", secret).update(material).digest("hex");
  }
  return crypto.createHash("sha256").update(material).digest("hex");
}

/** Comparação em tempo constante (evita timing attack). */
export function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

/** Confere se a requisição tem um cookie de sessão válido. */
export function isAuthed(): boolean {
  const value = cookies().get(SESSION_COOKIE)?.value;
  return !!value && safeEqual(value, sessionToken());
}
