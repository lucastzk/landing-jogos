/**
 * Modelo EDITÁVEL pelo painel admin. Mantido separado do store (que importa
 * `fs`) para poder ser usado também no client (apenas como tipo).
 */
export type EditableContent = {
  hero: { mockupImage: string };
  vsl: { videoUrl: string; poster: string };
  highlights: {
    games: { name: string; genre: string; description: string; image: string }[];
  };
};

/** Campos do CHECKOUT editáveis pelo painel. Preços em CENTAVOS. */
export type EditableCheckout = {
  brandName: string;
  logoImage: string;
  logoHeight: number;
  product: { name: string; description: string; image: string; priceInCents: number };
  orderBump: {
    enabled: boolean;
    title: string;
    description: string;
    fromInCents: number;
    priceInCents: number;
  };
  methods: { pix: boolean; card: boolean };
  maxInstallments: number;
  guaranteeDays: number;
  securityText: string;
  supportEmail: string;
};
