import { site } from "@/config/site";
import Section from "./Section";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";

export default function Testimonials() {
  const { testimonials } = site;
  const items = testimonials.items;
  const all = items.slice();
  const third = Math.ceil(items.length / 3);
  const col1 = items.slice(0, third);
  const col2 = items.slice(third, third * 2);
  const col3 = items.slice(third * 2);

  return (
    <Section id="depoimentos" className="bg-night">
      <div data-reveal className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="mask font-display text-[2.6rem] font-extrabold leading-[1.02] tracking-tighter text-bone sm:text-5xl lg:text-[3.4rem]">
          <span>{testimonials.title}</span>
        </h2>
        {testimonials.subtitle && (
          <p data-reveal data-delay="1" className="mt-5 text-lg leading-relaxed text-bone/55">
            {testimonials.subtitle}
          </p>
        )}
      </div>

      <div className="flex max-h-[560px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] sm:max-h-[640px]">
        {/* Celular: 1 coluna larga com TODOS os depoimentos */}
        <TestimonialsColumn testimonials={all} duration={36} className="w-full max-w-md md:hidden" />
        {/* Tablet/desktop: 3 colunas */}
        <TestimonialsColumn testimonials={col1} duration={16} className="hidden w-80 md:block" />
        <TestimonialsColumn testimonials={col2} duration={20} className="hidden w-80 md:block" />
        <TestimonialsColumn testimonials={col3} duration={18} className="hidden w-80 lg:block" />
      </div>
    </Section>
  );
}
