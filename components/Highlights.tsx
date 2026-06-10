import Image from "next/image";
import type { SiteConfig } from "@/config/site";
import Section from "./Section";
import SectionTitle from "./SectionTitle";
import CtaButton from "./CtaButton";

export default function Highlights({ highlights }: { highlights: SiteConfig["highlights"] }) {
  return (
    <Section id="destaques" className="bg-black">
      <SectionTitle
        index="02"
        kicker="OS CAMPEÕES"
        title={highlights.title}
        subtitle={highlights.subtitle}
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.games.map((game, i) => (
          <article
            key={i}
            data-reveal
            data-delay={String((i % 3) + 1)}
            className="lift glass group overflow-hidden rounded-3xl hover:border-red-500/40 hover:shadow-red-soft"
          >
            <div className="relative aspect-video overflow-hidden bg-night">
              {game.image ? (
                <Image
                  src={game.image}
                  alt={game.name}
                  fill
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-center">
                  <span className="text-4xl grayscale transition group-hover:grayscale-0">🎮</span>
                  <span className="px-3 text-xs text-bone/35">Print/gif do jogo aqui</span>
                </div>
              )}
              <span className="absolute left-3 top-3 rounded-full border border-line bg-black/70 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-400 backdrop-blur">
                {game.genre}
              </span>
              <span className="absolute right-3 top-3 font-display text-xs font-bold text-bone/30">
                0{i + 1}
              </span>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-extrabold tracking-tight text-bone">{game.name}</h3>
              <p className="mt-2 text-sm text-bone/55">{game.description}</p>
            </div>
          </article>
        ))}
      </div>

      <div
        data-reveal
        className="mt-12 rounded-3xl border border-red-700/30 bg-red-600/[0.07] px-6 py-9 text-center"
      >
        <p className="text-2xl font-extrabold tracking-tight text-bone sm:text-3xl">
          E isso é só a amostra:{" "}
          <span className="text-gradient-red animate-gradient-pan">+ de 500 jogos no total</span>
        </p>
        <p className="mt-2 text-bone/55">Todos os outros entram junto como bônus, sem custo a mais.</p>
      </div>

      <div className="mt-12 flex justify-center">
        <CtaButton withSubtext />
      </div>
    </Section>
  );
}
