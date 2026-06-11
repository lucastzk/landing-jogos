import type { SiteConfig } from "@/config/site";

/** Barra de compra fixa no rodapé — só no MOBILE. Mantém a ação sempre à mão. */
export default function StickyMobileCta({ site }: { site: SiteConfig }) {
  const isExternal = /^https?:\/\//.test(site.cta.checkoutUrl);
  const externalProps = isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <div className="glass fixed inset-x-0 bottom-0 z-50 p-3 lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="leading-tight">
          {site.offer.fullPrice && (
            <p className="text-xs text-bone/45 line-through decoration-red-500">{site.offer.fullPrice}</p>
          )}
          <p className="text-lg font-extrabold tracking-tight text-bone">
            {site.offer.currentPrice}
          </p>
        </div>
        <a
          href={site.cta.checkoutUrl}
          {...externalProps}
          className="flex-1 rounded-full bg-gradient-to-r from-red-700 to-red-500 px-4 py-3.5 text-center text-sm font-bold tracking-tight text-white shadow-red-soft"
        >
          {site.cta.label}
        </a>
      </div>
    </div>
  );
}
