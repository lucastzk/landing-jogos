import type { SiteConfig } from "@/config/site";
import CtaButton from "./CtaButton";

export default function FinalCta({ site }: { site: SiteConfig }) {
  const { finalCta, offer } = site;

  return (
    <section id="comprar" className="relative overflow-hidden bg-night px-5 py-28 sm:px-6 sm:py-36">
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(60% 60% at 50% 50%, rgba(240,16,16,0.14), transparent 70%)" }}
        aria-hidden="true"
      />
      <div className="aurora left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 animate-aurora bg-red-600/25" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div data-reveal className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-4 py-2">
          <span className="h-2 w-2 animate-blink rounded-full bg-red-500" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/60">
            Última chamada
          </span>
        </div>

        <h2 className="font-display text-5xl font-extrabold leading-[0.98] tracking-tighter text-bone sm:text-6xl lg:text-7xl">
          <span className="mask">
            <span>{finalCta.title}</span>
          </span>
        </h2>

        <p data-reveal data-delay="1" className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-bone/60">
          {finalCta.text}
        </p>

        <p data-reveal data-delay="2" className="mt-7 text-xl">
          {offer.fullPrice && (
            <span className="text-bone/40 line-through decoration-red-500">{offer.fullPrice}</span>
          )}{" "}
          <span className="text-3xl font-extrabold tracking-tight text-bone">{offer.currentPrice}</span>
          {offer.installments && <span className="text-bone/50"> ({offer.installments})</span>}
        </p>

        <div data-reveal data-delay="3" className="mt-10 flex justify-center">
          <CtaButton site={site} size="lg" withSubtext />
        </div>
      </div>
    </section>
  );
}
