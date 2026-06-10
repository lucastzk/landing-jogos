/**
 * Rastreio de UTMs (lado cliente). Captura os parâmetros de campanha que chegam
 * na URL (ex.: vindos do Facebook Ads), persiste na sessão e os repassa da
 * landing para o /checkout e, daí, para a transação na AmploPay (UTMify).
 *
 * Os placeholders {{campaign.name}}, {{ad.id}} etc. são preenchidos pelo META
 * no momento do clique — eles ficam no campo "Parâmetros de URL" do anúncio,
 * NUNCA no código. Aqui a gente só lê o que chega resolvido.
 */

export type TrackingParams = Record<string, string>;

// Parâmetros que rastreamos (UTMs + identificadores de clique/atribuição).
const TRACKING_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "src",
  "sck",
  "fbclid",
  "gclid",
  "ttclid",
  "xcod",
];

const STORAGE_KEY = "tracking_params";

function readFromUrl(): TrackingParams {
  if (typeof window === "undefined") return {};
  const sp = new URLSearchParams(window.location.search);
  const out: TrackingParams = {};
  for (const key of TRACKING_KEYS) {
    const value = sp.get(key);
    if (value) out[key] = value;
  }
  return out;
}

function readStored(): TrackingParams {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

/**
 * Captura os UTMs da URL atual e persiste na sessão. Se a URL atual trouxer
 * UTMs, eles têm prioridade (last-touch); senão mantém o que já estava salvo.
 * sessionStorage sobrevive à navegação landing → /checkout na mesma aba.
 */
export function captureTracking(): TrackingParams {
  if (typeof window === "undefined") return {};
  const fromUrl = readFromUrl();
  const stored = readStored();
  const merged = Object.keys(fromUrl).length > 0 ? { ...stored, ...fromUrl } : stored;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    /* sessionStorage pode estar bloqueado — segue sem persistir */
  }
  return merged;
}

/** Retorna os UTMs vigentes (URL atual sobrepõe o que está salvo). */
export function getTracking(): TrackingParams {
  const stored = readStored();
  const fromUrl = readFromUrl();
  return Object.keys(fromUrl).length > 0 ? { ...stored, ...fromUrl } : stored;
}

/** Querystring com os UTMs (ex.: "?utm_source=FB&utm_campaign=..."). */
export function trackingQueryString(): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(getTracking())) {
    if (value) sp.set(key, value);
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/**
 * Anexa os UTMs aos links internos de /checkout, para o rastreio seguir junto
 * quando o usuário clica em "comprar" na landing. (A persistência por sessão já
 * garante a atribuição mesmo se o link não for decorado a tempo.)
 */
export function decorateCheckoutLinks(): void {
  if (typeof window === "undefined") return;
  const qs = trackingQueryString();
  if (!qs) return;
  document.querySelectorAll<HTMLAnchorElement>('a[href^="/checkout"]').forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (href.includes("?")) return; // já tem querystring — não duplica
    a.setAttribute("href", href + qs);
  });
}
