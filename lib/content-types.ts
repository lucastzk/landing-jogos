/**
 * Modelo EDITÁVEL pelo painel admin. Mantido separado do store (que importa
 * `fs`) para poder ser usado também no client (apenas como tipo).
 *
 * EditableContent espelha os campos de texto/mídia da landing (config/site.ts).
 * EditableCheckout espelha os campos do checkout (config/checkout.ts).
 */

export type EditableContent = {
  meta: { siteName: string; title: string; description: string };
  brand: { name: string };
  cta: { label: string; subtext: string };
  marqueeWords: string[];
  hero: {
    kicker: string;
    headlineLines: string[];
    subheadline: string;
    mockupImage: string;
    trustBadges: string[];
  };
  vsl: {
    kicker: string;
    title: string;
    subtitle: string;
    videoUrl: string;
    poster: string;
    bullets: string[];
  };
  vslPage: {
    badge: string;
    headline: string;
    subheadline: string;
    videoUrl: string;
    poster: string;
    ctaLabel: string;
    unmuteHint: string;
    trustBadges: string[];
    revealAfterSeconds: number;
  };
  highlights: {
    title: string;
    subtitle: string;
    games: { name: string; genre: string; description: string; image: string }[];
  };
  whatYouGet: {
    title: string;
    items: { icon: string; title: string; text: string }[];
  };
  benefits: {
    title: string;
    items: { icon: string; title: string; text: string }[];
  };
  testimonials: {
    title: string;
    subtitle: string;
    items: { name: string; stars: number; text: string }[];
  };
  offer: {
    title: string;
    subtitle: string;
    ribbon: string;
    fullPrice: string;
    currentPrice: string;
    priceCaption: string;
    includes: string[];
    scarcityText: string;
    securityText: string;
  };
  guarantee: { title: string; text: string; days: number; points: string[] };
  faq: { title: string; items: { q: string; a: string }[] };
  finalCta: { title: string; text: string };
  footer: { brand: string; description: string; disclaimer: string };
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
