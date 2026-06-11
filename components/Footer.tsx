import type { SiteConfig } from "@/config/site";

export default function Footer({ site }: { site: SiteConfig }) {
  const { footer, brand } = site;
  const year = 2025; // ano fixo p/ build estável; atualize quando desejar

  return (
    <footer className="border-t border-line bg-black px-5 py-14 sm:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-bone">{brand.name}</span>
            <span className="h-2 w-2 rounded-full bg-red-500" />
          </div>
          <p className="mt-3 text-sm text-bone/50">{footer.description}</p>
        </div>

        <nav className="flex flex-col gap-2.5" aria-label="Links legais">
          {footer.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              data-cursor
              className="text-sm uppercase tracking-wide text-bone/55 transition-colors hover:text-red-400"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="mx-auto mt-12 w-full max-w-7xl border-t border-line pt-6">
        <p className="text-xs text-bone/40">{footer.disclaimer}</p>
        <p className="mt-2 text-xs text-bone/40">
          © {year} {footer.copyrightName}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
