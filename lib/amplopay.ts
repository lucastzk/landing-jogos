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

import { randomUUID, createHash, timingSafeEqual } from "crypto";
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
// Resiliência: o gateway da AmploPay às vezes solta 502/503/504 (timeout
// momentâneo) ou simplesmente demora. Em vez de jogar o erro na cara do
// cliente (que abandona o checkout), tentamos de novo automaticamente.
//
// Seguro contra cobrança dupla: o corpo (com o `identifier` único) é o MESMO
// em todas as tentativas — a AmploPay trata `identifier` como chave de
// idempotência, então um retry após um 504 não cria uma segunda transação.
// Só repetimos em erros transitórios de gateway (5xx) e falhas de rede/timeout;
// 400/422 (dado inválido) NÃO repetem.
const REQUEST_TIMEOUT_MS = 15_000; // por tentativa (3×15s + backoff < 60s do Nginx)
const MAX_ATTEMPTS = 3; // 1 tentativa + 2 retries
const RETRY_BACKOFF_MS = [500, 1200]; // espera antes do retry 1 e 2
const RETRYABLE_STATUS = new Set([502, 503, 504]);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(path: string, init: RequestInit): Promise<any> {
  const url = `${API_BASE()}${path}`;
  const auth = authHeaders();

  let lastError: AmploPayError | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    // Aborta a tentativa se a AmploPay travar sem responder.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

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
        signal: controller.signal,
      });
    } catch (e) {
      clearTimeout(timer);
      if (e instanceof AmploPayError) throw e;
      // Rede caiu ou estourou o timeout (abort) → transitório, vale repetir.
      lastError = new AmploPayError(
        `Falha de rede ao chamar AmploPay (tentativa ${attempt}/${MAX_ATTEMPTS}): ${String(e)}`,
        "Não foi possível conectar ao pagamento. Tente novamente."
      );
      if (attempt < MAX_ATTEMPTS) {
        await sleep(RETRY_BACKOFF_MS[attempt - 1]);
        continue;
      }
      throw lastError;
    } finally {
      clearTimeout(timer);
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
      const error = new AmploPayError(
        `AmploPay respondeu ${res.status} (tentativa ${attempt}/${MAX_ATTEMPTS}): ${msg}${issue}`,
        res.status === 400 || res.status === 422
          ? "Não foi possível aprovar o pagamento. Confira os dados e tente novamente."
          : "O pagamento está temporariamente indisponível. Tente novamente em instantes.",
        json ?? text
      );
      // Só repete em soluço de gateway (5xx); erro de validação não adianta repetir.
      if (RETRYABLE_STATUS.has(res.status) && attempt < MAX_ATTEMPTS) {
        lastError = error;
        await sleep(RETRY_BACKOFF_MS[attempt - 1]);
        continue;
      }
      throw error;
    }

    return json;
  }

  // Esgotou as tentativas só com erros transitórios.
  throw (
    lastError ??
    new AmploPayError(
      "AmploPay: tentativas esgotadas",
      "O pagamento está temporariamente indisponível. Tente novamente em instantes."
    )
  );
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
  // Sem segredo configurado: não dá pra verificar assinatura. O handler NÃO
  // confia no corpo — ele RECONSULTA o status autoritativo por id na AmploPay
  // (essa é a proteção real contra forja). Por isso seguimos só pra reconsultar.
  if (!secret) return true;
  const provided =
    headers.get("x-webhook-signature") ??
    headers.get("x-signature") ??
    headers.get("authorization") ??
    "";
  if (!provided) return false;
  // Comparação EXATA em tempo constante (não substring, sem timing oracle).
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b);
}

export function parseWebhook(body: any): { id: string; status: PaymentStatus } {
  const node = body?.data ?? body?.transaction ?? body;
  return {
    id: String(node?.transactionId ?? node?.id ?? ""),
    status: normalizeStatus(node?.status),
  };
}
