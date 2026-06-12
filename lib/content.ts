/**
 * Store de conteúdo (lado SERVIDOR). O `config/site.ts` é o PADRÃO; o painel
 * admin grava sobrescritas em `data/content.json`, que são mescladas por cima.
 * Assim o cliente edita vídeo/imagens sem mexer no código.
 *
 * Não importe este arquivo em componente client (ele usa `fs`).
 */
import { promises as fs } from "fs";
import path from "path";
import { site, type SiteConfig } from "@/config/site";
import { checkout, type CheckoutConfig } from "@/config/checkout";
import type { EditableContent, EditableCheckout } from "./content-types";

const DATA_DIR = path.join(process.cwd(), "data");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");
const CHECKOUT_FILE = path.join(DATA_DIR, "checkout.json");

/* eslint-disable @typescript-eslint/no-explicit-any */
type Json = any;

function isPlainObject(v: Json): v is Record<string, Json> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

/**
 * Mescla profunda: objetos por chave; arrays e primitivos o `override`
 * SUBSTITUI (assim o painel pode adicionar/remover itens de listas).
 */
function deepMerge(base: Json, override: Json): Json {
  if (override === undefined) return base;
  if (isPlainObject(base) && isPlainObject(override)) {
    const out: Record<string, Json> = { ...base };
    for (const key of Object.keys(override)) {
      out[key] = key in base ? deepMerge(base[key], override[key]) : override[key];
    }
    return out;
  }
  return override;
}

/** Lê as sobrescritas salvas (vazio se não houver). */
export async function readOverrides(): Promise<Json> {
  try {
    return JSON.parse(await fs.readFile(CONTENT_FILE, "utf8")) || {};
  } catch {
    return {};
  }
}

/** Config do site com as sobrescritas do admin já aplicadas. */
export async function getSite(): Promise<SiteConfig> {
  const overrides = await readOverrides();
  const base = structuredClone(site) as Json;
  return deepMerge(base, overrides) as SiteConfig;
}

/** Modelo editável atual (para preencher o formulário do painel). */
export async function getEditableContent(): Promise<EditableContent> {
  const s = await getSite();
  return {
    meta: { siteName: s.meta.siteName, title: s.meta.title, description: s.meta.description },
    brand: { name: s.brand.name },
    cta: { label: s.cta.label, subtext: s.cta.subtext },
    marqueeWords: [...s.marqueeWords],
    hero: {
      kicker: s.hero.kicker,
      headlineLines: [...s.hero.headlineLines],
      subheadline: s.hero.subheadline,
      mockupImage: s.hero.mockupImage ?? "",
      trustBadges: [...s.hero.trustBadges],
    },
    vsl: {
      kicker: s.vsl.kicker,
      title: s.vsl.title,
      subtitle: s.vsl.subtitle,
      videoUrl: s.vsl.videoUrl ?? "",
      poster: s.vsl.poster ?? "",
      bullets: [...s.vsl.bullets],
    },
    vslPage: {
      badge: s.vslPage.badge ?? "",
      headline: s.vslPage.headline ?? "",
      subheadline: s.vslPage.subheadline ?? "",
      videoUrl: s.vslPage.videoUrl ?? "",
      poster: s.vslPage.poster ?? "",
      ctaLabel: s.vslPage.ctaLabel,
      unmuteHint: s.vslPage.unmuteHint,
      trustBadges: [...(s.vslPage.trustBadges ?? [])],
      revealAfterSeconds: s.vslPage.revealAfterSeconds ?? 0,
    },
    highlights: {
      title: s.highlights.title,
      subtitle: s.highlights.subtitle,
      games: s.highlights.games.map((g) => ({
        name: g.name,
        genre: g.genre,
        description: g.description,
        image: g.image ?? "",
      })),
    },
    whatYouGet: {
      title: s.whatYouGet.title,
      items: s.whatYouGet.items.map((i) => ({ icon: i.icon, title: i.title, text: i.text })),
    },
    benefits: {
      title: s.benefits.title,
      items: s.benefits.items.map((i) => ({ icon: i.icon, title: i.title, text: i.text })),
    },
    testimonials: {
      title: s.testimonials.title,
      subtitle: s.testimonials.subtitle,
      items: s.testimonials.items.map((t) => ({ name: t.name, stars: t.stars, text: t.text })),
    },
    offer: {
      title: s.offer.title,
      subtitle: s.offer.subtitle,
      ribbon: s.offer.ribbon,
      fullPrice: s.offer.fullPrice,
      currentPrice: s.offer.currentPrice,
      priceCaption: s.offer.priceCaption,
      includes: [...s.offer.includes],
      scarcityText: s.offer.scarcityText,
      securityText: s.offer.securityText,
    },
    guarantee: {
      title: s.guarantee.title,
      text: s.guarantee.text,
      days: s.guarantee.days,
      points: [...s.guarantee.points],
    },
    faq: { title: s.faq.title, items: s.faq.items.map((f) => ({ q: f.q, a: f.a })) },
    finalCta: { title: s.finalCta.title, text: s.finalCta.text },
    footer: {
      brand: s.footer.brand,
      description: s.footer.description,
      disclaimer: s.footer.disclaimer,
    },
  };
}

// ===========================================================================
//  CHECKOUT — mesmo esquema (config/checkout.ts é o padrão; data/checkout.json
//  guarda as sobrescritas do painel).
// ===========================================================================

async function readCheckoutOverrides(): Promise<Json> {
  try {
    return JSON.parse(await fs.readFile(CHECKOUT_FILE, "utf8")) || {};
  } catch {
    return {};
  }
}

/** Config do checkout com as sobrescritas do admin aplicadas. */
export async function getCheckout(): Promise<CheckoutConfig> {
  const overrides = await readCheckoutOverrides();
  const base = structuredClone(checkout) as Json;
  return deepMerge(base, overrides) as CheckoutConfig;
}

/** Modelo de checkout editável atual (para preencher o formulário do painel). */
export async function getEditableCheckout(): Promise<EditableCheckout> {
  const c = await getCheckout();
  return {
    brandName: c.brandName ?? "",
    logoImage: c.logoImage ?? "",
    logoHeight: c.logoHeight ?? 80,
    product: {
      name: c.product.name ?? "",
      description: c.product.description ?? "",
      image: c.product.image ?? "",
      priceInCents: c.product.priceInCents ?? 0,
    },
    orderBump: {
      enabled: !!c.orderBump.enabled,
      title: c.orderBump.title ?? "",
      description: c.orderBump.description ?? "",
      image: c.orderBump.image ?? "",
      fromInCents: c.orderBump.fromInCents ?? 0,
      priceInCents: c.orderBump.priceInCents ?? 0,
    },
    methods: { pix: !!c.methods.pix, card: !!c.methods.card },
    maxInstallments: c.maxInstallments ?? 12,
    guaranteeDays: c.guaranteeDays ?? 7,
    securityText: c.securityText ?? "",
    supportEmail: c.supportEmail ?? "",
  };
}

/** Grava as sobrescritas do checkout vindas do painel. */
export async function saveEditableCheckout(patch: EditableCheckout): Promise<void> {
  const toCents = (v: unknown) => Math.max(0, Math.round(Number(v) || 0));
  const overrides = {
    brandName: String(patch?.brandName ?? ""),
    logoImage: String(patch?.logoImage ?? ""),
    logoHeight: Math.min(200, Math.max(24, Math.round(Number(patch?.logoHeight) || 80))),
    product: {
      name: String(patch?.product?.name ?? ""),
      description: String(patch?.product?.description ?? ""),
      image: String(patch?.product?.image ?? ""),
      priceInCents: toCents(patch?.product?.priceInCents),
    },
    orderBump: {
      enabled: !!patch?.orderBump?.enabled,
      title: String(patch?.orderBump?.title ?? ""),
      description: String(patch?.orderBump?.description ?? ""),
      image: String(patch?.orderBump?.image ?? ""),
      fromInCents: toCents(patch?.orderBump?.fromInCents),
      priceInCents: toCents(patch?.orderBump?.priceInCents),
    },
    methods: { pix: !!patch?.methods?.pix, card: !!patch?.methods?.card },
    maxInstallments: Math.min(24, Math.max(1, Math.round(Number(patch?.maxInstallments) || 1))),
    guaranteeDays: Math.max(0, Math.round(Number(patch?.guaranteeDays) || 0)),
    securityText: String(patch?.securityText ?? ""),
    supportEmail: String(patch?.supportEmail ?? ""),
  };
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(CHECKOUT_FILE, JSON.stringify(overrides, null, 2), "utf8");
}

/** Grava as sobrescritas (todos os textos/mídia da landing) vindas do painel. */
export async function saveEditableContent(patch: EditableContent): Promise<void> {
  const S = (v: unknown) => String(v ?? "");
  const SA = (a: unknown) => (Array.isArray(a) ? a.map(S) : []);
  const num = (v: unknown, def: number) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? n : def;
  };

  const overrides = {
    meta: {
      siteName: S(patch?.meta?.siteName),
      title: S(patch?.meta?.title),
      description: S(patch?.meta?.description),
    },
    brand: { name: S(patch?.brand?.name) },
    cta: { label: S(patch?.cta?.label), subtext: S(patch?.cta?.subtext) },
    marqueeWords: SA(patch?.marqueeWords),
    hero: {
      kicker: S(patch?.hero?.kicker),
      headlineLines: SA(patch?.hero?.headlineLines),
      subheadline: S(patch?.hero?.subheadline),
      mockupImage: S(patch?.hero?.mockupImage),
      trustBadges: SA(patch?.hero?.trustBadges),
    },
    vsl: {
      kicker: S(patch?.vsl?.kicker),
      title: S(patch?.vsl?.title),
      subtitle: S(patch?.vsl?.subtitle),
      videoUrl: S(patch?.vsl?.videoUrl),
      poster: S(patch?.vsl?.poster),
      bullets: SA(patch?.vsl?.bullets),
    },
    vslPage: {
      badge: S(patch?.vslPage?.badge),
      headline: S(patch?.vslPage?.headline),
      subheadline: S(patch?.vslPage?.subheadline),
      videoUrl: S(patch?.vslPage?.videoUrl),
      poster: S(patch?.vslPage?.poster),
      ctaLabel: S(patch?.vslPage?.ctaLabel),
      unmuteHint: S(patch?.vslPage?.unmuteHint),
      trustBadges: SA(patch?.vslPage?.trustBadges),
      revealAfterSeconds: Number(patch?.vslPage?.revealAfterSeconds) || 0,
    },
    highlights: {
      title: S(patch?.highlights?.title),
      subtitle: S(patch?.highlights?.subtitle),
      games: (patch?.highlights?.games ?? []).map((g) => ({
        name: S(g?.name),
        genre: S(g?.genre),
        description: S(g?.description),
        image: S(g?.image),
      })),
    },
    whatYouGet: {
      title: S(patch?.whatYouGet?.title),
      items: (patch?.whatYouGet?.items ?? []).map((i) => ({
        icon: S(i?.icon),
        title: S(i?.title),
        text: S(i?.text),
      })),
    },
    benefits: {
      title: S(patch?.benefits?.title),
      items: (patch?.benefits?.items ?? []).map((i) => ({
        icon: S(i?.icon),
        title: S(i?.title),
        text: S(i?.text),
      })),
    },
    testimonials: {
      title: S(patch?.testimonials?.title),
      subtitle: S(patch?.testimonials?.subtitle),
      items: (patch?.testimonials?.items ?? []).map((t) => ({
        name: S(t?.name),
        stars: Math.max(1, Math.min(5, num(t?.stars, 5))),
        text: S(t?.text),
      })),
    },
    offer: {
      title: S(patch?.offer?.title),
      subtitle: S(patch?.offer?.subtitle),
      ribbon: S(patch?.offer?.ribbon),
      fullPrice: S(patch?.offer?.fullPrice),
      currentPrice: S(patch?.offer?.currentPrice),
      priceCaption: S(patch?.offer?.priceCaption),
      includes: SA(patch?.offer?.includes),
      scarcityText: S(patch?.offer?.scarcityText),
      securityText: S(patch?.offer?.securityText),
    },
    guarantee: {
      title: S(patch?.guarantee?.title),
      text: S(patch?.guarantee?.text),
      days: Math.max(0, num(patch?.guarantee?.days, 7)),
      points: SA(patch?.guarantee?.points),
    },
    faq: {
      title: S(patch?.faq?.title),
      items: (patch?.faq?.items ?? []).map((f) => ({ q: S(f?.q), a: S(f?.a) })),
    },
    finalCta: { title: S(patch?.finalCta?.title), text: S(patch?.finalCta?.text) },
    footer: {
      brand: S(patch?.footer?.brand),
      description: S(patch?.footer?.description),
      disclaimer: S(patch?.footer?.disclaimer),
    },
  };

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(CONTENT_FILE, JSON.stringify(overrides, null, 2), "utf8");
}
