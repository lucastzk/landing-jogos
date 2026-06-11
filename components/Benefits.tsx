import type { SiteConfig } from "@/config/site";
import Section from "./Section";
import SectionTitle from "./SectionTitle";
import CtaButton from "./CtaButton";

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
            className="lift glass flex gap-5 rounded-3xl p-7 hover:border-red-500/40 hover:shadow-red-soft"
          >
            <span className="text-4xl leading-none">{item.emoji}</span>
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
