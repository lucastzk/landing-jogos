import type { SiteConfig } from "@/config/site";

type Props = {
  site: SiteConfig;
  size?: "md" | "lg";
  withSubtext?: boolean;
  className?: string;
};

/**
 * Botão de COMPRA — única ação da página.
 * Sempre o mesmo texto, gradiente vermelho, brilho suave, magnético no desktop.
 */
export default function CtaButton({ site, size = "lg", withSubtext = false, className = "" }: Props) {
  const sizes = {
    md: "px-7 py-3.5 text-sm",
    lg: "px-9 py-[1.15rem] text-base",
  };

  // Link interno (/checkout) abre na mesma aba; link externo (https) abre em nova.
  const isExternal = /^https?:\/\//.test(site.cta.checkoutUrl);
  const externalProps = isExternal
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <a
        href={site.cta.checkoutUrl}
        {...externalProps}
        data-magnetic
        className={`group relative inline-flex w-full max-w-md items-center justify-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-red-700 via-red-600 to-red-500 font-bold tracking-tight text-white shadow-red transition-all duration-300 hover:shadow-red-soft focus:outline-none focus:ring-4 focus:ring-red-500/40 ${sizes[size]}`}
      >
        {/* brilho que cruza no hover */}
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        <span className="relative">{site.cta.label}</span>
        <svg
          className="relative h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-1"
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
      {withSubtext && <p className="mt-4 text-sm text-bone/45">{site.cta.subtext}</p>}
    </div>
  );
}
