import Image from "next/image";
import type { SiteConfig } from "@/config/site";
import CtaButton from "./CtaButton";

export default function Hero({ hero }: { hero: SiteConfig["hero"] }) {
  return (
    <header id="topo" className="relative overflow-hidden">
      {/* Aurora / mesh suave de fundo */}
      <div className="aurora left-[-10%] top-[-5%] h-[28rem] w-[28rem] animate-aurora bg-red-700/25" aria-hidden="true" />
      <div className="aurora right-[-15%] top-[20%] h-[32rem] w-[32rem] animate-float-x bg-red-600/15" aria-hidden="true" />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(70% 50% at 50% -10%, rgba(240,16,16,0.12), transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pb-24 pt-36 sm:px-6 lg:grid-cols-[1.05fr,0.95fr] lg:pb-28 lg:pt-44">
        {/* Texto */}
        <div>
          <div
            data-reveal
            className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-line bg-white/[0.03] px-4 py-2 backdrop-blur"
          >
            <span className="h-2 w-2 animate-blink rounded-full bg-red-500" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/65">
              {hero.kicker}
            </span>
          </div>

          {/* Headline em linhas com reveal por máscara */}
          <h1 className="font-display text-[3.4rem] font-extrabold leading-[0.98] tracking-tighter sm:text-6xl lg:text-7xl">
            {hero.headlineLines.map((line, i) => (
              <span key={i} className="mask" data-delay={String(Math.min(i + 1, 3))}>
                <span
                  className={
                    i === hero.headlineAccentLine
                      ? "text-gradient-red animate-gradient-pan"
                      : "text-bone"
                  }
                >
                  {line}
                </span>
              </span>
            ))}
          </h1>

          <p data-reveal data-delay="2" className="mt-7 max-w-xl text-lg leading-relaxed text-bone/60">
            {hero.subheadline}
          </p>

          <div data-reveal data-delay="3" className="mt-9 flex justify-start">
            <CtaButton size="lg" withSubtext />
          </div>

          <ul
            data-reveal
            data-delay="4"
            className="mt-9 flex flex-wrap gap-x-7 gap-y-2.5 text-sm text-bone/50"
          >
            {hero.trustBadges.map((badge) => (
              <li key={badge} className="flex items-center gap-2">
                <svg className="h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {badge}
              </li>
            ))}
          </ul>
        </div>

        {/* Mockup com parallax */}
        <div data-reveal data-delay="2" className="relative">
          <div data-parallax="0.06" className="relative mx-auto max-w-md lg:max-w-none">
            <div className="absolute -inset-8 animate-aurora rounded-[3rem] bg-red-600/20 blur-3xl" aria-hidden="true" />
            <div className="lift glass relative overflow-hidden rounded-3xl shadow-soft hover:border-red-500/40">
              {hero.mockupImage ? (
                <Image
                  src={hero.mockupImage}
                  alt={hero.mockupAlt}
                  width={640}
                  height={520}
                  priority
                  className="h-auto w-full"
                />
              ) : (
                <MockupPlaceholder />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/** Mockup gerado por CSS com tiles flutuando. */
function MockupPlaceholder() {
  const tiles = ["🕹️", "🏎️", "🧩", "🗡️", "👾", "⚽", "🚀", "🎯", "💣"];
  const delays = ["0s", "0.5s", "1s", "0.3s", "0.8s", "1.3s", "0.6s", "1.1s", "0.4s"];
  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-bone/25" />
          <span className="h-2.5 w-2.5 rounded-full bg-bone/25" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-bone/35">
          +500.pack
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {tiles.map((e, i) => (
          <div
            key={i}
            className="flex aspect-square animate-float items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-3xl"
            style={{ animationDelay: delays[i], animationDuration: "6.5s" }}
          >
            {e}
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-red-700/30 bg-red-600/10 px-4 py-3.5 text-center">
        <p className="font-display text-base font-extrabold tracking-tight text-bone">
          + de 500 jogos no total
        </p>
        <p className="mt-0.5 text-xs text-bone/40">Troque por um print real do seu pack</p>
      </div>
    </div>
  );
}
