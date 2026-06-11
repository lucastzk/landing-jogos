/**
 * Rate limiter simples em memória (janela fixa por chave). Suficiente para um
 * único processo (PM2 com 1 instância). Protege login do admin (força-bruta) e
 * a criação de transações (abuso).
 *
 * Não usa Date.now em escopo de módulo — só dentro das funções (runtime Node).
 */
type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();
let lastSweep = 0;

/** Remove entradas expiradas de vez em quando (evita vazamento de memória). */
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  store.forEach((e, key) => {
    if (now > e.resetAt) store.delete(key);
  });
}

/**
 * Retorna { ok } se a requisição está dentro do limite. Em `ok: false`,
 * `retryAfter` é o tempo (segundos) até liberar.
 */
export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  sweep(now);
  const e = store.get(key);
  if (!e || now > e.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  e.count += 1;
  if (e.count > limit) {
    return { ok: false, retryAfter: Math.ceil((e.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

/**
 * Extrai um IP "identificador" CONFIÁVEL da requisição.
 *
 * ⚠️ Nunca confie no PRIMEIRO item do X-Forwarded-For — ele é controlado pelo
 * cliente e pode ser forjado (burlaria o rate-limit). O Nginx deste projeto
 * seta `X-Real-IP` com o IP real da conexão e ANEXA o IP real no FINAL do XFF.
 * E o app escuta só em 127.0.0.1 (ecosystem.config.cjs), então esses headers
 * só chegam pelo Nginx.
 */
export function clientIpFromRequest(req: Request): string {
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1]; // ÚLTIMO = o que o Nginx anexou
  }
  return "unknown";
}
