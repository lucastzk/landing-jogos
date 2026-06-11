/**
 * Wrapper seguro para o Meta Pixel (fbq) no lado cliente.
 *
 * O pixel base (PageView) é injetado no <head> em app/layout.tsx e cria o stub
 * `window.fbq` imediatamente — chamadas feitas antes do fbevents.js carregar
 * ficam na fila e disparam quando ele chega. Por isso é seguro chamar `fbTrack`
 * a qualquer momento; aqui só garantimos que `fbq` existe (evita erro em SSR ou
 * se um bloqueador remover o script).
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

type PixelParams = Record<string, unknown>;

/**
 * Evento PADRÃO do Meta (PageView, InitiateCheckout, AddPaymentInfo, Purchase...).
 * `options.eventID` permite deduplicar com o evento server-side (CAPI): basta
 * usar o mesmo id (ex.: o transactionId) nos dois lados.
 */
export function fbTrack(event: string, params?: PixelParams, options?: { eventID?: string }): void {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    if (options?.eventID) window.fbq("track", event, params, options);
    else window.fbq("track", event, params);
  }
}

/** Evento CUSTOMIZADO (nomes livres, fora da lista padrão do Meta). */
export function fbTrackCustom(event: string, params?: PixelParams): void {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("trackCustom", event, params);
  }
}
