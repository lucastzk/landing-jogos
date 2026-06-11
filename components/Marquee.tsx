import type { SiteConfig } from "@/config/site";

/** Faixa de texto rolando — movida via JS, reage à velocidade do scroll. */
export default function Marquee({ site }: { site: SiteConfig }) {
  const words = site.marqueeWords;
  const group = (
    <div className="flex flex-shrink-0 items-center">
      {words.map((w, i) => (
        <span key={i} className="flex items-center">
          <span className="px-7 text-sm font-semibold uppercase tracking-[0.2em] text-bone/45">
            {w}
          </span>
          <span className="h-1 w-1 rounded-full bg-red-500/70" />
        </span>
      ))}
    </div>
  );

  return (
    <div data-marquee className="border-y border-line bg-night/60 py-4">
      <div className="marquee" aria-hidden="true">
        {/* Track único com conteúdo duplicado; o JS faz o loop contínuo */}
        <div className="marquee__track">
          {group}
          {group}
        </div>
      </div>
    </div>
  );
}
