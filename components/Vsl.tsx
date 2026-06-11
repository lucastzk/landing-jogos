"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { SiteConfig } from "@/config/site";
import Section from "./Section";
import SectionTitle from "./SectionTitle";

/** Detecta o tipo de vídeo e devolve a URL pronta para reproduzir. */
function resolveMedia(url: string): { type: "iframe" | "file"; src: string } | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) {
    return {
      type: "iframe",
      src: `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
    };
  }
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { type: "iframe", src: `https://player.vimeo.com/video/${vm[1]}?autoplay=1` };
  if (/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url)) return { type: "file", src: url };
  // Qualquer outra URL: tenta embutir num iframe.
  return { type: "iframe", src: url };
}

export default function Vsl({ site }: { site: SiteConfig }) {
  const { vsl } = site;
  const [playing, setPlaying] = useState(false);
  const media = resolveMedia(vsl.videoUrl);
  const isFile = media?.type === "file";

  // Arquivo .mp4: roda sozinho MUDO quando entra na tela; clique para ativar o som.
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !isFile) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.4 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [isFile]);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted && v.paused) v.play().catch(() => {});
  };

  return (
    <Section id="video" className="bg-night">
      <SectionTitle
        index="01"
        kicker={vsl.kicker}
        title={vsl.title}
        subtitle={vsl.subtitle}
        align="center"
      />

      <div data-reveal className="mx-auto max-w-4xl">
        <div className="relative">
          {/* brilho ambiente vermelho atrás do player */}
          <div
            className="absolute -inset-6 -z-10 rounded-[3rem] bg-red-600/20 blur-3xl"
            aria-hidden="true"
          />

          <div className="glass relative aspect-video overflow-hidden rounded-3xl border-red-700/30 shadow-red">
            {isFile && media ? (
              // Arquivo .mp4: roda sozinho MUDO (ao entrar na tela). Clique = som.
              <>
                <video
                  ref={videoRef}
                  src={media.src}
                  poster={vsl.poster || undefined}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onClick={toggleMute}
                  className="absolute inset-0 h-full w-full cursor-pointer bg-black object-cover"
                />
                {muted && (
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="absolute inset-0 flex items-end justify-center pb-5"
                    aria-label="Ativar som"
                  >
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/55 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-bone/90 backdrop-blur">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M11 5 6 9H2v6h4l5 4V5z" />
                        <line x1="23" y1="9" x2="17" y2="15" />
                        <line x1="17" y1="9" x2="23" y2="15" />
                      </svg>
                      Toque para ativar o som
                    </span>
                  </button>
                )}
              </>
            ) : playing && media ? (
              <iframe
                src={media.src}
                title={vsl.title}
                className="absolute inset-0 h-full w-full"
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                onClick={() => media && setPlaying(true)}
                className="group absolute inset-0 h-full w-full"
                aria-label="Reproduzir vídeo de apresentação"
              >
                {/* Capa (poster) ou placeholder em CSS */}
                {vsl.poster ? (
                  <Image
                    src={vsl.poster}
                    alt={vsl.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 896px"
                    className="object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 bg-gradient-to-br from-panel via-night to-black" />
                )}

                {/* leve escurecida por cima da capa */}
                <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/25 transition-colors group-hover:from-black/55" />

                {/* Botão de play */}
                <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-500 shadow-red transition-transform duration-300 group-hover:scale-110 sm:h-24 sm:w-24">
                  <span className="absolute inset-0 animate-ping rounded-full bg-red-500/40" aria-hidden="true" />
                  <svg
                    className="relative ml-1 h-8 w-8 text-white sm:h-9 sm:w-9"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>

                {/* rótulo inferior */}
                <span className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-black/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-bone/80 backdrop-blur">
                  {media ? "Assista à demonstração" : "Adicione o vídeo no painel /admin"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* selos abaixo do vídeo */}
        {vsl.bullets.length > 0 && (
          <div
            data-reveal
            data-delay="1"
            className="mt-7 flex flex-wrap items-center justify-center gap-2.5"
          >
            {vsl.bullets.map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.02] px-4 py-2 text-sm text-bone/70"
              >
                <svg
                  className="h-4 w-4 flex-shrink-0 text-red-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {b}
              </span>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
