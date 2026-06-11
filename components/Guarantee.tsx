import type { SiteConfig } from "@/config/site";
import Section from "./Section";

export default function Guarantee({ site }: { site: SiteConfig }) {
  const { guarantee } = site;

  return (
    <Section id="garantia" className="bg-night">
      <div
        data-reveal
        className="glass relative mx-auto flex max-w-3xl flex-col items-center gap-8 overflow-hidden rounded-4xl border-red-700/25 p-8 text-center shadow-soft sm:flex-row sm:p-10 sm:text-left"
      >
        {/* brilho */}
        <div
          className="pointer-events-none absolute -left-20 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-red-600/15 blur-3xl"
          aria-hidden="true"
        />

        {/* Selo / medalha */}
        <div className="relative flex-shrink-0">
          <div
            className="absolute inset-0 animate-float-slow rounded-full bg-red-600/25 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-red-700/40 bg-gradient-to-br from-red-600/15 to-red-700/5">
            <div className="flex h-[6.5rem] w-[6.5rem] flex-col items-center justify-center rounded-full border-2 border-dashed border-red-500/40 text-red-500">
              <svg
                className="h-7 w-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span className="mt-0.5 font-display text-3xl font-extrabold leading-none text-bone">
                {guarantee.days}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-red-400">
                dias
              </span>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="relative">
          <span className="inline-block rounded-full border border-red-700/50 bg-red-600/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-400">
            {guarantee.badge}
          </span>
          <h2 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-bone sm:text-3xl">
            {guarantee.title}
          </h2>
          <p className="mt-3 leading-relaxed text-bone/60">{guarantee.text}</p>

          {guarantee.points.length > 0 && (
            <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 sm:justify-start">
              {guarantee.points.map((p) => (
                <li key={p} className="flex items-center gap-2 text-sm font-medium text-bone/75">
                  <svg
                    className="h-4 w-4 flex-shrink-0 text-red-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Section>
  );
}
