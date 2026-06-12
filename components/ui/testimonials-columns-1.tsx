import React from "react";

type Testimonial = {
  text: string;
  name: string;
  role?: string;
  stars?: number;
};

/**
 * Coluna de depoimentos em rolagem vertical contínua.
 * Animação 100% CSS (compositor, barata) — antes era Framer Motion (RAF infinito
 * em JS) movendo cards .glass com backdrop-blur, o que travava o iPhone.
 * No mobile a animação é desligada via @media (pointer: coarse) em globals.css.
 */
export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <div
        className="vmarquee flex flex-col gap-6 pb-6"
        style={{ "--vdur": `${props.duration || 20}s` } as React.CSSProperties}
      >
        {new Array(2).fill(0).map((_, index) => (
          <React.Fragment key={index}>
            {props.testimonials.map(({ text, name, role, stars }, i) => (
              <div
                className="glass w-full rounded-3xl border-line p-6 shadow-soft sm:p-8"
                key={i}
              >
                {typeof stars === "number" && stars > 0 && (
                  <div
                    className="mb-4 flex gap-0.5 text-red-500"
                    aria-label={`${stars} de 5 estrelas`}
                  >
                    {Array.from({ length: stars }).map((_, s) => (
                      <svg key={s} className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                )}
                <div className="leading-relaxed text-bone/80">{text}</div>
                <div className="mt-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-red-700/40 bg-red-600/10 font-display text-sm font-bold text-red-400">
                    {name.trim().charAt(0).toUpperCase()}
                  </span>
                  <div className="flex flex-col">
                    <div className="font-medium leading-5 tracking-tight text-bone">{name}</div>
                    {role && <div className="leading-5 tracking-tight text-bone/50">{role}</div>}
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
