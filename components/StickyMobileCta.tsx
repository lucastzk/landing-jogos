import type { SiteConfig } from "@/config/site";

/** Barra de compra fixa no rodapé — só no MOBILE. Mantém a ação sempre à mão. */
export default function StickyMobileCta({ site }: { site: SiteConfig }) {
  const isExternal = /^https?:\/\//.test(site.cta.checkoutUrl);
  const externalProps = isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <div
      className="glass fixed inset-x-0 bottom-0 z-50 border-t border-line/80 px-3 pt-3 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.7)] lg:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        <div className="leading-none">
          {site.offer.fullPrice && (
            <p className="text-[0.7rem] text-bone/40 line-through decoration-red-500">{site.offer.fullPrice}</p>
          )}
          <p className="text-xl font-extrabold tracking-tight text-bone">{site.offer.currentPrice}</p>
          <p className="mt-1 text-[0.62rem] font-medium uppercase tracking-wide text-bone/40">pagamento único</p>
        </div>
        <a
          href={site.cta.checkoutUrl}
          {...externalProps}
          className="group flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red-700 via-red-600 to-red-500 px-5 py-4 text-center text-[0.95rem] font-bold tracking-tight text-white shadow-red-soft transition-transform active:scale-[0.98]"
        >
          {site.cta.label}
          <svg
            className="h-[18px] w-[18px]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
      </div>
    </div>
  );
}
