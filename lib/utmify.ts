/**
 * Integração UTMify (lado SERVIDOR) — envia os PEDIDOS para a API da UTMify.
 *
 * Por quê: nosso checkout é próprio (AmploPay direto), então nenhuma plataforma
 * envia os pedidos pra UTMify automaticamente. Aqui o backend faz isso:
 *   - na criação do PIX/cartão  → status "waiting_payment" (pedido criado)
 *   - quando o pagamento confirma → status "paid" (venda)
 * Mesmo orderId nos dois → a UTMify atualiza o pedido (não duplica). Os UTMs da
 * campanha vão em trackingParameters → é assim que a UTMify atribui a venda.
 *
 * Token: gerado na UTMify (Credenciais de API → sua credencial → token). Fica em
 * UTMIFY_API_TOKEN no .env do VPS (gitignored). Sem token = no-op (nada quebra).
 *
 * Não importe em componente client (usa fetch server-side).
 */
import type { TxRecord } from "./tx-store";
import { readTxRecord, markUtmifyPaidSent, unmarkUtmifyPaidSent } from "./tx-store";

const ENDPOINT = "https://api.utmify.com.br/api-credentials/orders";
const TOKEN = () => process.env.UTMIFY_API_TOKEN || "";
const PLATFORM = "AmploPay";

export type UtmifyStatus = "waiting_payment" | "paid" | "refused" | "refunded" | "chargedback";

/** "YYYY-MM-DD HH:MM:SS" em UTC (formato exigido pela UTMify). null se ausente. */
function utcDateTime(sec?: number): string | null {
  if (!sec) return null;
  const d = new Date(sec * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(
    d.getUTCMinutes()
  )}:${p(d.getUTCSeconds())}`;
}

function trackingParameters(t?: Record<string, string>) {
  const g = (k: string) => (t && t[k]) || null;
  return {
    src: g("src"),
    sck: g("sck"),
    utm_source: g("utm_source"),
    utm_campaign: g("utm_campaign"),
    utm_medium: g("utm_medium"),
    utm_content: g("utm_content"),
    utm_term: g("utm_term"),
  };
}

const PAYMENT_METHOD: Record<string, string> = { pix: "pix", card: "credit_card" };

/** Monta o payload e envia o pedido à UTMify. Nunca lança; devolve true em 2xx. */
export async function sendUtmifyOrder(rec: TxRecord, status: UtmifyStatus): Promise<boolean> {
  const token = TOKEN();
  if (!token) {
    console.warn("[utmify] UTMIFY_API_TOKEN ausente — envio de pedidos desativado");
    return false;
  }

  const payload = {
    orderId: rec.id,
    platform: PLATFORM,
    paymentMethod: PAYMENT_METHOD[rec.method || "pix"] || "pix",
    status,
    createdAt: utcDateTime(rec.createdAtSec) ?? utcDateTime(Math.floor(Date.now() / 1000)),
    approvedDate: status === "paid" ? utcDateTime(Math.floor(Date.now() / 1000)) : null,
    refundedAt: null,
    customer: {
      name: rec.customerName || "Cliente",
      email: rec.email || "",
      phone: rec.phone || null,
      document: rec.document || null,
      country: "BR",
      ip: rec.clientIp || "0.0.0.0", // UTMify exige ip não-nulo
    },
    products: [
      {
        id: rec.productId || "produto",
        name: rec.contentName || "Produto",
        planId: null,
        planName: null,
        quantity: 1,
        priceInCents: rec.amountInCents,
      },
    ],
    trackingParameters: trackingParameters(rec.tracking),
    commission: {
      totalPriceInCents: rec.amountInCents,
      gatewayFeeInCents: 0,
      userCommissionInCents: rec.amountInCents,
    },
    isTest: !!rec.isTest,
  };

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-token": token },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const text = await res.text();
    if (!res.ok) {
      console.error(`[utmify] order ${rec.id} (${status}) falhou ${res.status}: ${text.slice(0, 400)}`);
      return false;
    }
    console.log(`[utmify] order ${rec.id} status=${status} enviado`);
    return true;
  } catch (e) {
    console.error("[utmify] erro de rede ao enviar pedido:", e);
    return false;
  }
}

/** Envia o pedido recém-criado (PIX gerado / cartão enviado) como aguardando. */
export async function sendUtmifyPending(rec: TxRecord): Promise<void> {
  await sendUtmifyOrder(rec, "waiting_payment");
}

/**
 * Envia o "paid" no máximo UMA vez (idempotente via tx-store). Chamado pelo
 * webhook e pelo polling de status — o primeiro que detectar "pago" envia.
 */
export async function fireUtmifyPaidOnce(id: string): Promise<void> {
  if (!id) return;
  const rec = await readTxRecord(id);
  if (!rec || rec.utmifyPaidSent) return;
  const claimed = await markUtmifyPaidSent(id);
  if (!claimed) return;
  const fresh = await readTxRecord(id);
  const ok = fresh ? await sendUtmifyOrder(fresh, "paid") : false;
  if (!ok) await unmarkUtmifyPaidSent(id);
}
