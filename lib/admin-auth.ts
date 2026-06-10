/**
 * Autenticação do painel admin (esboço): senha única + cookie de sessão.
 * Em produção, troque por um login de verdade (usuários, hash, etc.).
 */
import crypto from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "admin_session";

/** Senha do painel. Defina ADMIN_PASSWORD no .env (padrão "admin" em dev). */
export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin";
}

/** Token determinístico derivado da senha — guardado no cookie httpOnly. */
export function sessionToken(): string {
  return crypto.createHash("sha256").update(`landing-jogos::${adminPassword()}`).digest("hex");
}

/** Confere se a requisição tem um cookie de sessão válido. */
export function isAuthed(): boolean {
  const value = cookies().get(SESSION_COOKIE)?.value;
  return !!value && value === sessionToken();
}
