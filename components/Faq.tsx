import type { SiteConfig } from "@/config/site";
import Section from "./Section";
import SectionTitle from "./SectionTitle";

export default function Faq({ site }: { site: SiteConfig }) {
  const { faq } = site;

  return (
    <Section id="faq" className="bg-black">
      <SectionTitle index="07" kicker="DÚVIDAS" title={faq.title} />

      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        {faq.items.map((item, i) => (
          <details key={i} data-reveal className="glass group rounded-2xl px-6 open:border-red-500/30">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-lg font-bold tracking-tight text-bone marker:hidden">
              {item.q}
              <svg
                className="h-5 w-5 flex-shrink-0 text-red-500 transition-transform duration-300 group-open:rotate-45"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </summary>
            <p className="pb-5 leading-relaxed text-bone/60">{item.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
