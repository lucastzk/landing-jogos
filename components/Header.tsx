import { site } from "@/config/site";

/** Header fixo em vidro — marca à esquerda, CTA magnético à direita. */
export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="glass mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-3 shadow-soft sm:px-6">
        <a href="#topo" className="group flex items-center gap-2">
          <span className="text-lg font-extrabold tracking-tight text-bone">{site.brand.name}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 transition-transform duration-300 group-hover:scale-150" />
        </a>

        <a
          href={site.cta.checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-magnetic
          className="hidden rounded-full bg-gradient-to-r from-red-700 to-red-500 px-5 py-2.5 text-sm font-bold tracking-tight text-white shadow-red-soft transition-transform hover:scale-[1.03] sm:inline-flex"
        >
          {site.cta.label}
        </a>
      </div>
    </header>
  );
}
