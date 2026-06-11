/**
 * Contrato INTERNO do checkout — o que o front envia/recebe do nosso próprio
 * backend (`/api/checkout`). É estável e independente da AmploPay: o mapeamento
 * específico do gateway acontece só dentro do route handler (lib/amplopay.ts).
 */

export type PaymentMethod = "pix" | "card";

/** Status normalizado (mapeamos os status da AmploPay para estes). */
export type PaymentStatus =
  | "pending" // aguardando pagamento (PIX gerado, cartão em análise)
  | "paid" // pago / aprovado
  | "failed" // recusado / erro
  | "expired" // PIX expirou
  | "canceled" // cancelado
  | "refunded"; // estornado

export type Customer = {
  name: string;
  email: string;
  cpf: string; // só dígitos
  phone: string; // só dígitos
};

export type CardData = {
  number: string; // só dígitos
  holderName: string;
  expiry: string; // "MM/AA"
  cvv: string;
  installments: number;
};

/** UTMs / parâmetros de campanha repassados pra atribuição (UTMify). */
export type TrackingParams = Record<string, string>;

/** Cookies do Meta Pixel (_fbp/_fbc) — usados no match do Purchase via CAPI. */
export type PixelIds = {
  fbp?: string;
  fbc?: string;
};

export type CreateCheckoutRequest = {
  method: PaymentMethod;
  bump: boolean; // cliente marcou o order bump?
  customer: Customer;
  card?: CardData; // obrigatório quando method === "card"
  tracking?: TrackingParams; // UTMs capturados na landing
  pixel?: PixelIds; // _fbp/_fbc do navegador (para o Purchase server-side)
};

export type PixData = {
  /** String copia-e-cola (BR Code EMV). */
  copyPaste: string;
  /** Imagem do QR Code em data URL (base64) — quando o gateway já entrega. */
  qrCodeImage?: string;
  /** ISO de expiração do PIX. */
  expiresAt?: string;
};

export type CreateCheckoutSuccess = {
  ok: true;
  transactionId: string;
  status: PaymentStatus;
  amountInCents: number;
  method: PaymentMethod;
  pix?: PixData; // presente quando method === "pix"
};

export type CreateCheckoutError = {
  ok: false;
  error: string; // mensagem amigável pro usuário
  fieldErrors?: Record<string, string>; // erros por campo (validação)
};

export type CreateCheckoutResponse = CreateCheckoutSuccess | CreateCheckoutError;

export type StatusResponse =
  | { ok: true; status: PaymentStatus }
  | { ok: false; error: string };
