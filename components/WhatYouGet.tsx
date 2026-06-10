import { site } from "@/config/site";
import Section from "./Section";
import SectionTitle from "./SectionTitle";
import RadialGlow from "@/components/ui/radial-glow";
import Icon from "./Icon";

export default function WhatYouGet() {
  const { whatYouGet } = site;

  return (
    <Section id="o-que-recebe" className="relative isolate overflow-hidden bg-night">
      <RadialGlow position="50% 0%" size="620px" />
      <SectionTitle index="03" kicker="O PACOTE" title={whatYouGet.title} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {whatYouGet.items.map((item, i) => (
          <div
            key={i}
            data-reveal
            data-delay={String((i % 3) + 1)}
            className="lift glass group rounded-3xl p-8 hover:border-red-500/40"
          >
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600/10 text-red-500 transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-red-600/20">
              <Icon name={item.icon as never} />
            </div>
            <h3 className="text-lg font-extrabold tracking-tight text-bone">{item.title}</h3>
            <p className="mt-2 leading-relaxed text-bone/55">{item.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
