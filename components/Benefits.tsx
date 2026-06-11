import type { SiteConfig } from "@/config/site";
import Section from "./Section";
import SectionTitle from "./SectionTitle";
import CtaButton from "./CtaButton";
import Icon from "./Icon";

// Fallback de ícone por posição (caso um item antigo não tenha `icon` definido).
const FALLBACK_ICONS = ["clock", "target", "dollar", "sparkles"];

export default function Benefits({ site }: { site: SiteConfig }) {
  const { benefits } = site;

  return (
    <Section id="beneficios" className="bg-black">
      <SectionTitle index="04" kicker="A TRANSFORMAÇÃO" title={benefits.title} />

      <div className="grid gap-5 sm:grid-cols-2">
        {benefits.items.map((item, i) => (
          <div
            key={i}
            data-reveal
            data-delay={String((i % 2) + 1)}
            className="lift glass group flex gap-5 rounded-3xl p-7 hover:border-red-500/40 hover:shadow-red-soft"
          >
            <span className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-red-600/10 text-red-500 transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-red-600/20">
              <Icon name={(item.icon || FALLBACK_ICONS[i] || "sparkles") as never} />
            </span>
            <div>
              <h3 className="text-xl font-extrabold tracking-tight text-bone">{item.title}</h3>
              <p className="mt-2 leading-relaxed text-bone/55">{item.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <CtaButton site={site} withSubtext />
      </div>
    </Section>
  );
}
