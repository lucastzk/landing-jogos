/**
 * Disparo idempotente do Purchase server-side (CAPI).
 *
 * Chamado por DOIS caminhos que podem detectar o pagamento como "pago":
 *   - o webhook/postback da AmploPay (funciona mesmo com a aba fechada), e
 *   - o polling de status do PIX (enquanto a aba está aberta).
 * O primeiro que detectar envia; o outro vira no-op. A marca purchaseSent no
 * tx-store garante envio único; e, como reforço, o Meta ainda deduplica pelo
 * event_id (= transactionId). Cinto e suspensório.
 *
 * Não importe em componente client (usa fs + fetch server-side).
 */
import { readTxRecord, markPurchaseSent, unmarkPurchaseSent } from "./tx-store";
import { sendPurchaseEvent } from "./meta-capi";

export async function firePurchaseOnce(id: string): Promise<void> {
  if (!id) return;

  const rec = await readTxRecord(id);
  if (!rec || rec.purchaseSent) return;

  // Marca ANTES de enviar (otimista) para evitar corrida webhook × polling.
  const claimed = await markPurchaseSent(id);
  if (!claimed) return; // outro caminho já assumiu o envio

  const ok = await sendPurchaseEvent({
    eventId: rec.id,
    value: rec.amountInCents / 100,
    currency: rec.currency || "BRL",
    contentName: rec.contentName,
    eventSourceUrl: rec.eventSourceUrl,
    user: {
      email: rec.email,
      phone: rec.phone,
      fbp: rec.fbp,
      fbc: rec.fbc,
      clientIp: rec.clientIp,
      userAgent: rec.userAgent,
    },
  });

  // Falhou o envio: libera para nova tentativa num próximo webhook/poll.
  if (!ok) await unmarkPurchaseSent(id);
}
