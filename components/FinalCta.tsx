import type { ReactNode } from "react";
import type { SiteConfig } from "@/config/site";
import CtaButton from "./CtaButton";

/** "R$ 1.997,00" → 1997  (pt-BR). Retorna null se não der pra ler. */
function parsePrice(s?: string): number | null {
  if (!s) return null;
  let t = s.replace(/[^\d.,]/g, "");
  if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(t);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function Trust({ children, icon }: { children: ReactNode; icon: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-red-400/90">{icon}</span>
      {children}
    </span>
  );
}

export default function FinalCta({ site }: { site: SiteConfig }) {
  const { finalCta, offer, guarantee } = site;

  const full = parsePrice(offer.fullPrice);
  const current = parsePrice(offer.currentPrice);
  const discount = full && current && full > current ? Math.round((1 - current / full) * 100) : null;

  return (
    <section id="comprar" className="relative overflow-hidden bg-night px-5 py-28 sm:px-6 sm:py-36">
      {/* Fundo dramático: glow radial + auroras + grade de pontos */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(70% 60% at 50% 38%, rgba(240,16,16,0.18), transparent 72%)" }}
        aria-hidden="true"
      />
      <div className="aurora left-1/2 top-1/5 h-96 w-96 -translate-x-1/2 animate-aurora bg-red-600/30" aria-hidden="true" />
      <div className="aurora bottom-[6%] right-[10%] h-72 w-72 animate-float-x bg-red-700/15" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage: "linear-gradient(to bottom, #000, transparent 55%)",
          WebkitMaskImage: "linear-gradient(to bottom, #000, transparent 55%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-2xl">
        <div data-reveal className="relative">
          {/* Halo de glow atrás do card */}
          <div
            className="absolute -inset-1 rounded-[2.3rem] bg-gradient-to-b from-red-600/45 via-red-600/10 to-transparent blur-2xl"
            aria-hidden="true"
          />

          {/* Card */}
          <div className="glass lift relative overflow-hidden rounded-[2rem] border-red-700/25 px-6 py-12 text-center shadow-soft sm:px-12 sm:py-14">
            {/* Acabamentos de luz */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/70 to-transparent" aria-hidden="true" />
            <div className="pointer-events-none absolute -top-24 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full bg-red-600/25 blur-3xl" aria-hidden="true" />

            {/* Pill */}
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-red-700/40 bg-red-600/10 px-4 py-2">
              <span className="h-2 w-2 animate-blink rounded-full bg-red-500 shadow-[0_0_10px_2px_rgba(240,16,16,0.7)]" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300/90">Última chamada</span>
            </div>

            {/* Headline */}
            <h2 className="font-display text-4xl font-extrabold leading-[0.98] tracking-tighter text-bone sm:text-5xl lg:text-6xl">
              <span className="mask">
                <span>{finalCta.title}</span>
              </span>
            </h2>

            {/* Subtexto */}
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-bone/55 sm:text-lg">{finalCta.text}</p>

            {/* Preço */}
            <div className="mt-9 flex flex-col items-center">
              {(offer.fullPrice || discount) && (
                <div className="mb-2.5 flex items-center gap-3">
                  {offer.fullPrice && (
                    <span className="text-lg text-bone/35 line-through decoration-red-500/70 decoration-2">{offer.fullPrice}</span>
                  )}
                  {discount && (
                    <span className="rounded-full bg-red-600/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-red-300 ring-1 ring-red-600/30">
                      −{discount}% OFF
                    </span>
                  )}
                </div>
              )}
              <span className="font-display text-5xl font-extrabold tracking-tighter text-bone sm:text-6xl">{offer.currentPrice}</span>
              <span className="mt-2 text-sm font-medium uppercase tracking-wide text-bone/40">
                {offer.installments || "pagamento único · sem mensalidade"}
              </span>
            </div>

            {/* CTA */}
            <div className="mt-9 flex justify-center">
              <CtaButton site={site} size="lg" />
            </div>

            {/* Selos de confiança */}
            <div className="mx-auto mt-8 flex max-w-md flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-xs font-medium text-bone/50">
              <Trust
                icon={
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                }
              >
                Garantia de {guarantee.days} dias
              </Trust>
              <Trust
                icon={
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="5" y="11" width="14" height="9" rx="2" />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                  </svg>
                }
              >
                Pagamento seguro
              </Trust>
              <Trust
                icon={
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
                  </svg>
                }
              >
                Acesso imediato
              </Trust>
            </div>

            {/* Pagamento */}
            <div className="mt-7 flex flex-col items-center gap-3 border-t border-line/70 pt-6">
              <div className="flex flex-wrap items-center justify-center gap-2">
                {["PIX", "VISA", "MASTER", "ELO", "HIPER"].map((m) => (
                  <span
                    key={m}
                    className="rounded-md bg-white/[0.05] px-2.5 py-1 text-[0.65rem] font-bold tracking-wide text-bone/55 ring-1 ring-white/10"
                  >
                    {m}
                  </span>
                ))}
              </div>
              <p className="text-xs text-bone/35">{offer.securityText}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
