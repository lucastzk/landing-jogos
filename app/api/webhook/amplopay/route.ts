import { NextResponse } from "next/server";
import { parseWebhook, isWebhookSignatureValid, getTransactionStatus } from "@/lib/amplopay";
import { firePurchaseOnce } from "@/lib/purchase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Postback da AmploPay: chamado pelo gateway quando o status muda (ex.: pago).
 * Configure esta URL no painel da AmploPay (Integrações):
 *   https://SEU-DOMINIO/api/webhook/amplopay
 *
 * ⚠️ O formato exato do payload e a assinatura do postback da AmploPay NÃO são
 *    públicos. Por isso, em vez de confiar no corpo, RE-CONSULTAMOS o status
 *    autoritativo em GET /v1/transactions/{id} (recomendação da pesquisa).
 *
 * ESBOÇO: aqui validamos e logamos. É AQUI que, em produção, você dispara a
 * entrega do produto (e-mail com acesso, liberação de área de membros, etc.).
 */
export async function POST(req: Request) {
  const raw = await req.text();

  if (!isWebhookSignatureValid(req.headers, raw)) {
    console.warn("[webhook] assinatura inválida — ignorado");
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let id = "";
  try {
    id = parseWebhook(JSON.parse(raw)).id;
  } catch {
    return NextResponse.json({ ok: false, error: "payload inválido" }, { status: 400 });
  }

  // Fonte da verdade: o próprio gateway, consultado por id.
  let status = "desconhecido";
  if (id) {
    try {
      status = await getTransactionStatus(id);
    } catch (err) {
      console.error("[webhook] falha ao reconsultar status:", err);
    }
  }

  console.log(`[webhook] transação ${id} → status ${status}`);

  // Pago: dispara o Purchase server-side (CAPI). Idempotente — se o polling do
  // PIX já enviou, isto vira no-op; e o Meta ainda deduplica pelo event_id.
  // É AQUI que a venda é contada mesmo se o cliente fechou a aba após pagar.
  if (status === "paid") await firePurchaseOnce(id);

  // TODO (produção): se status === "paid", entregar o produto ao cliente.
  // Ex.: enviar e-mail com o link de acesso, marcar pedido como pago no seu DB.

  // Responda 200 rápido para a AmploPay não reenviar o evento.
  return NextResponse.json({ ok: true });
}
