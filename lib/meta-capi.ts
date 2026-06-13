/**
 * Meta Conversions API (CAPI) — envia eventos de conversão pelo SERVIDOR.
 *
 * Por quê: o Purchase do navegador (fbq) só conta se o cliente ficar na aba até
 * o pagamento confirmar. No PIX isso falha muito (paga no app do banco e fecha a
 * página). Aqui o webhook/postback da AmploPay dispara o Purchase server-side →
 * conta 100% das vendas. O `event_id` (= transactionId) é o MESMO no navegador e
 * no servidor, então o Meta DEDUPLICA: a venda nunca é contada em dobro.
 *
 * Token: gerado no Gerenciador de Eventos → Configurações → API de Conversões →
 * "Gerar token de acesso". Fica em META_CAPI_TOKEN no .env do VPS (gitignored).
 * Sem o token, a função vira no-op (loga e segue) — nada quebra.
 *
 * Não importe em componente client (usa crypto + fetch server-side).
 */
import { createHash } from "crypto";

const GRAPH_VERSION = "v21.0";
const PIXEL_ID = () => process.env.META_PIXEL_ID || "2234982057332452";
const TOKEN = () => process.env.META_CAPI_TOKEN || "";
// Opcional: código de "Testar eventos" do Gerenciador de Eventos (debug).
const TEST_CODE = () => process.env.META_CAPI_TEST_CODE || "";

export type CapiUserData = {
  email?: string;
  phone?: string; // só dígitos (DDI é normalizado aqui)
  fbp?: string; // cookie _fbp
  fbc?: string; // cookie _fbc
  clientIp?: string;
  userAgent?: string;
};

export type CapiPurchase = {
  eventId: string; // = transactionId (dedup com o pixel do navegador)
  value: number; // em REAIS
  currency: string; // "BRL"
  contentName?: string;
  eventSourceUrl?: string;
  eventTimeSec?: number; // unix em segundos (default: agora)
  user: CapiUserData;
};

/** SHA-256 hex de um valor já normalizado (exigência do Meta para PII). */
function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function normEmail(email?: string): string | undefined {
  if (!email) return undefined;
  const e = email.trim().toLowerCase();
  return e ? sha256(e) : undefined;
}

/** E.164 sem '+': garante DDI 55 (Brasil), só dígitos, depois hash. */
function normPhone(phone?: string): string | undefined {
  if (!phone) return undefined;
  let p = phone.replace(/\D/g, "");
  if (!p) return undefined;
  if (!p.startsWith("55")) p = "55" + p;
  return sha256(p);
}

function buildUserData(u: CapiUserData): Record<string, unknown> {
  const ud: Record<string, unknown> = {};
  const em = normEmail(u.email);
  const ph = normPhone(u.phone);
  if (em) ud.em = [em];
  if (ph) ud.ph = [ph];
  if (u.fbp) ud.fbp = u.fbp;
  if (u.fbc) ud.fbc = u.fbc;
  if (u.clientIp) ud.client_ip_address = u.clientIp;
  if (u.userAgent) ud.client_user_agent = u.userAgent;
  return ud;
}

/**
 * Envia o evento Purchase ao Meta. Retorna true se o Meta aceitou (HTTP 2xx).
 * Nunca lança: erros são logados e devolve false (não derruba o webhook).
 */
export async function sendPurchaseEvent(p: CapiPurchase): Promise<boolean> {
  const token = TOKEN();
  if (!token) {
    console.warn("[capi] META_CAPI_TOKEN ausente — Purchase server-side desativado");
    return false;
  }

  const event = {
    event_name: "Purchase",
    event_time: p.eventTimeSec ?? Math.floor(Date.now() / 1000),
    event_id: p.eventId,
    action_source: "website",
    ...(p.eventSourceUrl ? { event_source_url: p.eventSourceUrl } : {}),
    user_data: buildUserData(p.user),
    custom_data: {
      currency: p.currency,
      value: p.value,
      ...(p.contentName ? { content_name: p.contentName } : {}),
    },
  };

  const payload: Record<string, unknown> = { data: [event] };
  if (TEST_CODE()) payload.test_event_code = TEST_CODE();

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID()}/events?access_token=${encodeURIComponent(
    token
  )}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const text = await res.text();
    if (!res.ok) {
      console.error(`[capi] Purchase falhou ${res.status}: ${text.slice(0, 300)}`);
      return false;
    }
    console.log(`[capi] Purchase enviado (event_id=${p.eventId})`);
    return true;
  } catch (e) {
    console.error("[capi] erro de rede ao enviar Purchase:", e);
    return false;
  }
}
