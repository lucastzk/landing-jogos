/**
 * ============================================================================
 *  CLIENTE AmploPay (lado SERVIDOR — nunca importe em componente client)
 * ============================================================================
 *  ✅ Verificado contra a doc oficial (app.amplopay.com/docs):
 *    - Base: https://app.amplopay.com/api/v1
 *    - Auth: headers x-public-key + x-secret-key
 *    - Valores em REAIS (não centavos)
 *    - PIX:    POST /gateway/pix/receive
 *    - Cartão: POST /gateway/card/receive   (exige address + clientIp)
 *    - Status: GET  /gateway/transactions?id=...
 * ============================================================================
 */

import { randomUUID } from "crypto";
import type { PaymentStatus } from "./checkout-types";

// ---------------------------------------------------------------------------
export class AmploPayError extends Error {
  userMessage: string;
  details?: unknown;
  constructor(message: string, userMessage: string, details?: unknown) {
    super(message);
    this.name = "AmploPayError";
    this.userMessage = userMessage;
    this.details = details;
  }
}

// ---------------------------------------------------------------------------
function env(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new AmploPayError(
      `Variável de ambiente ausente: ${name}`,
      "Pagamento indisponível no momento. Tente novamente em instantes."
    );
  }
  return v;
}

const PUBLIC_KEY = () => env("AMPLOPAY_PUBLIC_KEY");
const SECRET_KEY = () => env("AMPLOPAY_SECRET_KEY");
const API_BASE = () => (process.env.AMPLOPAY_API_BASE || "https://app.amplopay.com/api/v1").replace(/\/+$/, "");
const SITE_URL = () => (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

// ✅ Auth por headers (verificado: GET /api/v1 → "suas chaves estão corretas").
function authHeaders(): Record<string, string> {
  return { "x-public-key": PUBLIC_KEY(), "x-secret-key": SECRET_KEY() };
}

const ENDPOINTS = {
  pix: "/gateway/pix/receive",
  card: "/gateway/card/receive",
  getTransaction: (id: string) => `/gateway/transactions?id=${encodeURIComponent(id)}`,
};

// Status de CONSULTA (Buscar transação): PENDING, COMPLETED, FAILED, REFUNDED,
// CHARGED_BACK. Também cobre os de criação de cartão (OK, REJECTED, CANCELED).
function normalizeStatus(raw: string): PaymentStatus {
  const s = String(raw || "").toUpperCase();
  if (["COMPLETED", "OK", "PAID", "APPROVED", "CONFIRMED"].includes(s)) return "paid";
  if (["PENDING", "PROCESSING", "WAITING", "WAITING_PAYMENT", "CREATED"].includes(s)) return "pending";
  if (["FAILED", "REJECTED", "REFUSED", "DENIED", "ERROR"].includes(s)) return "failed";
  if (["EXPIRED"].includes(s)) return "expired";
  if (["CANCELED", "CANCELLED", "VOIDED"].includes(s)) return "canceled";
  if (["REFUNDED", "CHARGED_BACK", "CHARGEDBACK", "CHARGEBACK"].includes(s)) return "refunded";
  return "pending";
}

// Na CRIAÇÃO do PIX, status "OK" significa "PIX gerado" (aguardando pagamento),
// NÃO "pago". Só viram terminais os de falha/cancelamento.
function pixCreateStatus(raw: string): PaymentStatus {
  const s = String(raw || "").toUpperCase();
  if (["FAILED", "REJECTED", "ERROR"].includes(s)) return "failed";
  if (["CANCELED", "CANCELLED"].includes(s)) return "canceled";
  return "pending";
}

// ---------------------------------------------------------------------------
export type CreateTxInput = {
  amountInCents: number;
  method: "pix" | "card";
  installments: number;
  customer: { name: string; email: string; cpf: string; phone: string };
  card?: { number: string; holderName: string; expiry: string; cvv: string }; // expiry "MM/AA"
  clientIp?: string;
  address?: {
    country: string;
    zipCode: string;
    state: string;
    city: string;
    street: string;
    neighborhood: string;
    number: string;
    complement?: string;
  };
  items: { title: string; unitPriceInCents: number; quantity: number }[];
  tracking?: Record<string, string>;
};

export type CreateTxResult = {
  id: string;
  status: PaymentStatus;
  pix?: { copyPaste: string; qrCodeImage?: string; expiresAt?: string };
};

/** Centavos → reais (number). 2990 → 29.9 */
const toReais = (cents: number): number => Math.round(cents) / 100;

/** data URL? URL? base64 cru? Devolve sempre algo usável em <img src>. */
function normalizeQrImage(value?: string): string | undefined {
  if (!value) return undefined;
  if (value.startsWith("data:") || value.startsWith("http")) return value;
  return `data:image/png;base64,${value}`;
}

function clientObject(input: CreateTxInput) {
  return {
    name: input.customer.name,
    email: input.customer.email,
    phone: input.customer.phone,
    document: input.customer.cpf,
  };
}

// ✅ Corpo do PIX (doc "Receber pix"). amount em REAIS.
function buildPixBody(input: CreateTxInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    identifier: randomUUID(),
    amount: toReais(input.amountInCents),
    client: clientObject(input),
    callbackUrl: `${SITE_URL()}/api/webhook/amplopay`,
  };
  if (input.tracking && Object.keys(input.tracking).length > 0) {
    body.metadata = input.tracking; // UTMs como metadados (atribuição)
  }
  return body;
}

// ✅ Corpo do cartão (doc "Receber cartão"). Exige address + clientIp.
function buildCardBody(input: CreateTxInput): Record<string, unknown> {
  const [mm, yy] = (input.card?.expiry || "").split("/");
  const yyyy = yy && yy.length === 2 ? `20${yy}` : yy;
  return {
    identifier: randomUUID(),
    amount: toReais(input.amountInCents),
    client: { ...clientObject(input), address: input.address },
    clientIp: input.clientIp || "127.0.0.1",
    card: {
      number: input.card?.number,
      owner: input.card?.holderName,
      expiresAt: `${yyyy}-${mm}`, // YYYY-MM
      cvv: input.card?.cvv,
    },
    installments: input.installments,
    callbackUrl: `${SITE_URL()}/api/webhook/amplopay`,
    ...(input.tracking && Object.keys(input.tracking).length > 0 ? { metadata: input.tracking } : {}),
  };
}

// ✅ Resposta (201): transactionId + pix{code,base64,image}.
function parsePixResponse(data: any): CreateTxResult {
  const pix = data?.pix ?? {};
  const copyPaste: string | undefined = pix?.code ?? pix?.qrCode ?? pix?.qrcode;
  const qrImage: string | undefined = pix?.base64 ?? pix?.image;
  return {
    id: String(data?.transactionId ?? data?.id ?? ""),
    status: pixCreateStatus(data?.status),
    pix: copyPaste ? { copyPaste, qrCodeImage: normalizeQrImage(qrImage) } : undefined,
  };
}

function parseCardResponse(data: any): CreateTxResult {
  return {
    id: String(data?.transactionId ?? data?.id ?? ""),
    status: normalizeStatus(data?.status),
  };
}

// ---------------------------------------------------------------------------
async function request(path: string, init: RequestInit): Promise<any> {
  const url = `${API_BASE()}${path}`;
  const auth = authHeaders();

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        // Alguns firewalls bloqueiam requisições sem User-Agent de navegador.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        ...auth,
        ...(init.headers || {}),
      },
      cache: "no-store",
    });
  } catch (e) {
    if (e instanceof AmploPayError) throw e;
    throw new AmploPayError(
      `Falha de rede ao chamar AmploPay: ${String(e)}`,
      "Não foi possível conectar ao pagamento. Tente novamente."
    );
  }

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* resposta não-JSON (ex.: página de bloqueio do firewall) */
  }

  if (!res.ok) {
    const issue = json?.details?.issue ? ` (${json.details.field}: ${json.details.issue})` : "";
    const msg = json?.message || json?.error || (text ? text.slice(0, 200) : `HTTP ${res.status}`);
    throw new AmploPayError(
      `AmploPay respondeu ${res.status}: ${msg}${issue}`,
      res.status === 400 || res.status === 422
        ? "Não foi possível aprovar o pagamento. Confira os dados e tente novamente."
        : "O pagamento está temporariamente indisponível. Tente novamente em instantes.",
      json ?? text
    );
  }
  return json;
}

/** Cria uma cobrança (PIX ou cartão) na AmploPay. */
export async function createTransaction(input: CreateTxInput): Promise<CreateTxResult> {
  if (input.method === "pix") {
    const data = await request(ENDPOINTS.pix, { method: "POST", body: JSON.stringify(buildPixBody(input)) });
    const result = parsePixResponse(data);
    if (!result.id) {
      throw new AmploPayError("Resposta sem transactionId", "Não foi possível iniciar o pagamento.", data);
    }
    if (!result.pix) {
      throw new AmploPayError("Resposta sem dados de PIX", "Não foi possível gerar o PIX. Tente novamente.", data);
    }
    return result;
  }

  // cartão
  const data = await request(ENDPOINTS.card, { method: "POST", body: JSON.stringify(buildCardBody(input)) });
  const result = parseCardResponse(data);
  if (!result.id) {
    throw new AmploPayError("Resposta sem transactionId", "Não foi possível processar o cartão.", data);
  }
  return result;
}

/** Consulta o status atual de uma transação (usado pelo polling do PIX). */
export async function getTransactionStatus(id: string): Promise<PaymentStatus> {
  const data = await request(ENDPOINTS.getTransaction(id), { method: "GET" });
  return normalizeStatus(data?.status ?? data?.transaction?.status);
}

// ---------------------------------------------------------------------------
// Webhook / postback (callbackUrl). Formato exato do payload não é público;
// por isso o handler reconsulta o status por id. Aqui só extraímos o id e
// validamos um token opcional.
export function isWebhookSignatureValid(headers: Headers, _rawBody: string): boolean {
  const secret = process.env.AMPLOPAY_WEBHOOK_SECRET;
  if (!secret) return true; // sem segredo configurado: não valida (esboço)
  const provided =
    headers.get("x-webhook-signature") ??
    headers.get("x-signature") ??
    headers.get("authorization") ??
    "";
  return provided.includes(secret);
}

export function parseWebhook(body: any): { id: string; status: PaymentStatus } {
  const node = body?.data ?? body?.transaction ?? body;
  return {
    id: String(node?.transactionId ?? node?.id ?? ""),
    status: normalizeStatus(node?.status),
  };
}
