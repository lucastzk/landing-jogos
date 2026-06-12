/**
 * ============================================================================
 *  CONFIGURAÇÃO DO CHECKOUT (esboço)
 * ============================================================================
 *  Tudo que aparece NA TELA do checkout sai daqui. Nenhum segredo mora neste
 *  arquivo — as chaves da AmploPay ficam no `.env` (lado servidor).
 *
 *  👉 Troque o `product` pelo SEU produto real. O `priceInCents` é em CENTAVOS
 *     (R$ 29,90 = 2990). Não use vírgula/ponto aqui.
 * ============================================================================
 */

export const checkout = {
  // --------------------------------------------------------------------------
  // PRODUTO (placeholder — troque pelo seu)
  // --------------------------------------------------------------------------
  product: {
    id: "produto-demo",
    name: "Produto Demo",
    // Frase curta exibida sob o nome no resumo do pedido.
    description: "Exemplo de produto digital. Troque pelo seu produto real.",
    // Imagem do produto no resumo (coloque em /public). Vazio = ícone genérico.
    image: "",
    // Preço em CENTAVOS. R$ 29,90 → 2990.
    priceInCents: 2990,
  },

  // --------------------------------------------------------------------------
  // ORDER BUMP — oferta complementar com 1 clique (eleva o ticket médio).
  // Deixe enabled:false para esconder.
  // --------------------------------------------------------------------------
  orderBump: {
    enabled: true,
    id: "order-bump-demo",
    title: "Sim! Quero adicionar o complemento",
    description:
      "Leve também o complemento opcional por um valor único. Some ao seu pedido com um clique.",
    // Imagem opcional (upload pelo painel). Vazio = sem miniatura.
    image: "",
    // De/Por só para ancoragem REAL. Deixe fromInCents:0 se não houver preço cheio.
    fromInCents: 4700,
    priceInCents: 1700,
  },

  // --------------------------------------------------------------------------
  // MÉTODOS DE PAGAMENTO disponíveis no checkout.
  // --------------------------------------------------------------------------
  methods: {
    pix: true,
    card: true,
  },

  // Parcelamento máximo exibido no cartão (apenas UI; ajuste conforme sua conta).
  maxInstallments: 12,

  // PIX expira em N minutos (mostrado no contador real do QR).
  pixExpiresInMinutes: 30,

  // --------------------------------------------------------------------------
  // CONFIANÇA / TEXTOS
  // --------------------------------------------------------------------------
  guaranteeDays: 7,
  securityText: "Pagamento criptografado • ambiente 100% seguro",
  supportEmail: "suporte@seu-dominio.com.br",
  // Mostrado no topo: marca exibida no checkout.
  brandName: "SUA MARCA",
  // Logo exibida no topo do checkout (upload pelo painel). Vazio = mostra o nome.
  logoImage: "",
  // Altura da logo no topo do checkout, em pixels (ajustável pelo painel).
  logoHeight: 80,
} as const;

export type CheckoutConfig = typeof checkout;
