type Props = {
  index?: string;
  kicker?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
};

/** Cabeçalho de seção limpo e moderno. */
export default function SectionTitle({ title, subtitle, align = "left" }: Props) {
  const isCenter = align === "center";
  return (
    <div className={`mb-14 ${isCenter ? "mx-auto max-w-2xl text-center" : "max-w-3xl"}`}>
      <h2 className="mask font-display text-[2.6rem] font-extrabold leading-[1.02] tracking-tighter text-bone sm:text-5xl lg:text-[3.4rem]">
        <span>{title}</span>
      </h2>

      {subtitle && (
        <p data-reveal data-delay="1" className="mt-5 text-lg leading-relaxed text-bone/55">
          {subtitle}
        </p>
      )}
    </div>
  );
}
