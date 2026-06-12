import type { SiteConfig } from "@/config/site";
import Section from "./Section";
import SectionTitle from "./SectionTitle";
import CtaButton from "./CtaButton";

/** Extrai o valor numérico de uma string de preço (ex.: "R$ 197" → 197, "R$ 4,70" → 4.7). */
function toNumber(price: string): number {
  return parseFloat(price.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
}

/** Formata um número como moeda em reais (ex.: 150 → "R$ 150"). */
function brl(n: number): string {
  return (
    "R$ " +
    n.toLocaleString("pt-BR", {
      minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
      maximumFractionDigits: 2,
    })
  );
}

export default function Offer({ site }: { site: SiteConfig }) {
  const { offer } = site;

  const full = toNumber(offer.fullPrice);
  const current = toNumber(offer.currentPrice);
  const hasDiscount = full > current && current > 0;
  const discountPct = hasDiscount ? Math.round(((full - current) / full) * 100) : 0;
  const savings = hasDiscount ? full - current : 0;

  return (
    <Section id="oferta" className="bg-black">
      <SectionTitle
        index="06"
        kicker="A OFERTA"
        title={offer.title}
        subtitle={offer.subtitle}
        align="center"
      />

      <div data-reveal className="mx-auto max-w-xl">
        <div className="glass relative overflow-hidden rounded-4xl border-red-700/40 px-6 pb-8 pt-12 shadow-red sm:px-10 sm:pb-10">
          {/* brilho */}
          <div
            className="absolute -right-24 -top-24 h-56 w-56 animate-float-slow rounded-full bg-red-600/20 blur-3xl"
            aria-hidden="true"
          />

          {/* faixa no topo */}
          {offer.ribbon && (
            <div className="absolute left-1/2 top-0 -translate-x-1/2">
              <span className="inline-block rounded-b-xl bg-gradient-to-r from-red-700 to-red-500 px-5 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-white shadow-red-soft">
                {offer.ribbon}
              </span>
            </div>
          )}

          {offer.scarcityText && (
            <div className="relative mb-7 rounded-full border border-red-700/50 bg-red-600/10 px-4 py-2.5 text-center text-sm font-bold uppercase tracking-wide text-red-400">
              ⚡ {offer.scarcityText}
            </div>
          )}

          {/* Ancoragem de preço */}
          <div className="relative text-center">
            {hasDiscount && (
              <div className="flex items-center justify-center gap-2.5">
                <span className="text-base text-bone/55">
                  De{" "}
                  <span className="text-xl font-bold text-bone/85 line-through decoration-red-500 decoration-2">
                    {offer.fullPrice}
                  </span>
                </span>
                <span className="rounded-full bg-red-600/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-red-400">
                  −{discountPct}%
                </span>
              </div>
            )}

            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-bone/40">
              por apenas
            </p>

            <p className="mt-1 font-display text-7xl font-extrabold leading-none tracking-tighter text-bone sm:text-8xl">
              {offer.currentPrice}
            </p>

            {(offer.installments || hasDiscount) && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {offer.installments && (
                  <span className="rounded-full border border-red-700/40 bg-red-600/10 px-3.5 py-1.5 text-sm font-bold tracking-tight text-red-400">
                    {offer.installments}
                  </span>
                )}
                {hasDiscount && (
                  <span className="rounded-full border border-line bg-white/[0.03] px-3.5 py-1.5 text-sm font-semibold text-bone/70">
                    Você economiza {brl(savings)}
                  </span>
                )}
              </div>
            )}

            <p className="mt-3 text-sm text-bone/45">{offer.priceCaption}</p>
          </div>

          {/* divisor */}
          <div
            className="relative my-8 h-px bg-gradient-to-r from-transparent via-line to-transparent"
            aria-hidden="true"
          />

          {/* o que está incluso */}
          <ul className="relative grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
            {offer.includes.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-bone/85">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-600/15">
                  <svg
                    className="h-3 w-3 text-red-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <span className="text-[0.95rem]">{item}</span>
              </li>
            ))}
          </ul>

          <div className="relative mt-9">
            <CtaButton site={site} size="lg" withSubtext />
          </div>

          {/* confiança / formas de pagamento */}
          {(offer.securityText || offer.paymentMethods.length > 0) && (
            <div className="relative mt-7 flex flex-col items-center gap-3 border-t border-line pt-6">
              {offer.securityText && (
                <p className="flex items-center gap-2 text-xs text-bone/50">
                  <svg
                    className="h-4 w-4 flex-shrink-0 text-bone/40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  {offer.securityText}
                </p>
              )}
              {offer.paymentMethods.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {offer.paymentMethods.map((m) => (
                    <span
                      key={m}
                      className="rounded-md border border-line bg-white/[0.03] px-3 py-1 text-xs font-medium text-bone/55"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
