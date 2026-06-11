import { NextResponse } from "next/server";
import { getCheckout } from "@/lib/content";
import {
  isValidCPF,
  isValidCardExpiry,
  isValidCardNumber,
  isValidEmail,
  isValidPhone,
  onlyDigits,
} from "@/lib/format";
import { createTransaction, AmploPayError } from "@/lib/amplopay";
import { saveTxRecord } from "@/lib/tx-store";
import { firePurchaseOnce } from "@/lib/purchase";
import { rateLimit, clientIpFromRequest } from "@/lib/rate-limit";
import type { CreateCheckoutRequest, CreateCheckoutResponse, TrackingParams } from "@/lib/checkout-types";

// Garante execução no runtime Node (precisamos da secret key no servidor).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Chaves de rastreio aceitas (UTMs + identificadores de atribuição).
const ALLOWED_TRACKING_KEYS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "src", "sck", "fbclid", "gclid", "ttclid", "xcod",
]);

function sanitizeTracking(input: unknown): TrackingParams | undefined {
  if (!input || typeof input !== "object") return undefined;
  const out: TrackingParams = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (ALLOWED_TRACKING_KEYS.has(key) && typeof value === "string" && value) {
      out[key] = value.slice(0, 500); // limita tamanho
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function bad(error: string, fieldErrors?: Record<string, string>) {
  return NextResponse.json<CreateCheckoutResponse>({ ok: false, error, fieldErrors }, { status: 400 });
}

export async function POST(req: Request): Promise<NextResponse<CreateCheckoutResponse>> {
  // Anti-abuso: limita criação de transações por IP.
  const rl = rateLimit(`checkout:${clientIpFromRequest(req)}`, 12, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json<CreateCheckoutResponse>(
      { ok: false, error: "Muitas tentativas. Aguarde alguns minutos e tente de novo." },
      { status: 429 }
    );
  }

  let body: CreateCheckoutRequest;
  try {
    body = (await req.json()) as CreateCheckoutRequest;
  } catch {
    return bad("Requisição inválida.");
  }

  const { method, bump, customer, card } = body || ({} as CreateCheckoutRequest);

  // ---- Validação no servidor (nunca confie só no front) ----
  const fieldErrors: Record<string, string> = {};
  if (method !== "pix" && method !== "card") return bad("Método de pagamento inválido.");
  if (!customer?.name || customer.name.trim().split(" ").filter(Boolean).length < 2)
    fieldErrors.name = "Informe seu nome completo.";
  if (!customer?.email || !isValidEmail(customer.email)) fieldErrors.email = "E-mail inválido.";
  if (!customer?.phone || !isValidPhone(customer.phone)) fieldErrors.phone = "Telefone inválido.";
  if (!customer?.cpf || !isValidCPF(customer.cpf)) fieldErrors.cpf = "CPF inválido.";

  if (method === "card") {
    if (!card?.number || !isValidCardNumber(card.number)) fieldErrors.cardNumber = "Número de cartão inválido.";
    if (!card?.holderName || card.holderName.trim().length < 3) fieldErrors.cardHolder = "Nome do cartão inválido.";
    if (!card?.expiry || !isValidCardExpiry(card.expiry)) fieldErrors.cardExpiry = "Validade inválida.";
    if (!card?.cvv || card.cvv.length < 3) fieldErrors.cardCvv = "CVV inválido.";
  }
  if (Object.keys(fieldErrors).length > 0) return bad("Confira os campos destacados.", fieldErrors);

  // Config do checkout com as edições do painel (preço autoritativo no servidor).
  const checkout = await getCheckout();

  // ---- Valor calculado NO SERVIDOR (nunca aceite preço vindo do cliente) ----
  const amountInCents =
    checkout.product.priceInCents +
    (bump && checkout.orderBump.enabled ? checkout.orderBump.priceInCents : 0);

  const items = [
    { title: checkout.product.name, unitPriceInCents: checkout.product.priceInCents, quantity: 1 },
    ...(bump && checkout.orderBump.enabled
      ? [{ title: checkout.orderBump.title, unitPriceInCents: checkout.orderBump.priceInCents, quantity: 1 }]
      : []),
  ];

  // UTMs vindos do cliente: aceita só strings, limita tamanho (evita abuso).
  const tracking = sanitizeTracking(body.tracking);

  // IP do cliente (exigido pelo cartão da AmploPay).
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    undefined;

  try {
    const tx = await createTransaction({
      amountInCents,
      method,
      installments: method === "card" ? Math.min(card?.installments || 1, checkout.maxInstallments) : 1,
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim(),
        cpf: onlyDigits(customer.cpf),
        phone: onlyDigits(customer.phone),
      },
      card:
        method === "card" && card
          ? {
              number: onlyDigits(card.number),
              holderName: card.holderName.trim(),
              expiry: card.expiry,
              cvv: card.cvv,
            }
          : undefined,
      items,
      tracking,
      clientIp,
    });

    // Persiste o necessário para o Purchase server-side (CAPI) no webhook/polling.
    // O _fbc pode não existir como cookie; reconstruímos a partir do fbclid se preciso.
    const fbc = body.pixel?.fbc || (tracking?.fbclid ? `fb.1.${Date.now()}.${tracking.fbclid}` : undefined);
    await saveTxRecord({
      id: tx.id,
      amountInCents,
      currency: "BRL",
      contentName: checkout.product.name,
      email: customer.email.trim(),
      phone: onlyDigits(customer.phone),
      fbp: body.pixel?.fbp,
      fbc,
      clientIp,
      userAgent: req.headers.get("user-agent") || undefined,
      eventSourceUrl: req.headers.get("referer") || undefined,
      createdAtSec: Math.floor(Date.now() / 1000),
    });

    // Cartão aprovado na hora já dispara o Purchase server-side (PIX vem pelo webhook).
    if (tx.status === "paid") await firePurchaseOnce(tx.id);

    return NextResponse.json<CreateCheckoutResponse>({
      ok: true,
      transactionId: tx.id,
      status: tx.status,
      amountInCents,
      method,
      pix: tx.pix,
    });
  } catch (err) {
    if (err instanceof AmploPayError) {
      // Mensagem amigável; detalhes ficam no log do servidor.
      console.error("[checkout] AmploPay error:", err.message, err.details);
      return NextResponse.json<CreateCheckoutResponse>(
        { ok: false, error: err.userMessage },
        { status: 502 }
      );
    }
    console.error("[checkout] erro inesperado:", err);
    return NextResponse.json<CreateCheckoutResponse>(
      { ok: false, error: "Não foi possível processar o pagamento. Tente novamente." },
      { status: 500 }
    );
  }
}
