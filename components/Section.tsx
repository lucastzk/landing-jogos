type Props = {
  id?: string;
  className?: string;
  children: React.ReactNode;
};

/** Wrapper de seção com espaçamento generoso e largura máxima consistente. */
export default function Section({ id, className = "", children }: Props) {
  return (
    <section id={id} className={`px-5 py-20 sm:px-8 sm:py-28 lg:py-32 ${className}`}>
      <div className="mx-auto w-full max-w-7xl">{children}</div>
    </section>
  );
}
