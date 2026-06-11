"use client";

import { useEffect, useRef, useState } from "react";
import type { SiteConfig } from "@/config/site";

function isFileUrl(url: string) {
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);
}

/** YouTube/Vimeo → embed com autoplay MUDO. */
function buildEmbed(url: string): string {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1&muted=1`;
  return url;
}

/**
 * Página VSL (vídeo-porteiro): vídeo vertical roda sozinho MUDO; clicar na tela
 * ativa o som; o botão que leva à landing só aparece quando o vídeo termina.
 */
export default function VslGate({
  vslPage,
  ctaHref,
}: {
  vslPage: SiteConfig["vslPage"];
  ctaHref: string;
}) {
  const { badge, headline, subheadline, videoUrl, poster, ctaLabel, unmuteHint, trustBadges, revealAfterSeconds } =
    vslPage;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [revealed, setRevealed] = useState(false);

  const isFile = isFileUrl(videoUrl);
  const embed = !isFile && videoUrl ? buildEmbed(videoUrl) : "";

  useEffect(() => {
    if (!videoUrl) {
      setRevealed(true);
      return;
    }
    const secs = revealAfterSeconds > 0 ? revealAfterSeconds : isFile ? 0 : 60;
    if (secs > 0) {
      const t = window.setTimeout(() => setRevealed(true), secs * 1000);
      return () => window.clearTimeout(t);
    }
  }, [videoUrl, revealAfterSeconds, isFile]);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted && v.paused) v.play().catch(() => {});
  };

  return (
    <main className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-black px-4 py-8 sm:py-10">
      {/* Fundo: glow radial + halo + grade de pontos + vinheta */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(60% 50% at 50% 28%, rgba(240,16,16,0.20), transparent 70%)" }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute left-1/2 top-[10%] h-72 w-72 -translate-x-1/2 animate-aurora rounded-full bg-red-600/25 blur-[100px]" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(75% 70% at 50% 40%, #000, transparent)",
          WebkitMaskImage: "radial-gradient(75% 70% at 50% 40%, #000, transparent)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 50% 50%, transparent 52%, rgba(0,0,0,0.88))" }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        {/* Selo */}
        {badge && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-700/40 bg-red-600/10 px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 animate-blink rounded-full bg-red-500 shadow-[0_0_8px_2px_rgba(240,16,16,0.7)]" />
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-red-300/90">{badge}</span>
          </div>
        )}

        {/* Gancho */}
        {headline && (
          <h1 className="mx-auto w-full max-w-[19rem] break-words text-center font-display text-[1.4rem] font-extrabold leading-[1.12] tracking-tight text-bone sm:max-w-md sm:text-[2rem]">
            {headline}
          </h1>
        )}
        {subheadline && (
          <p className="mx-auto mt-2.5 w-full max-w-sm text-balance text-center text-sm leading-relaxed text-bone/55">
            {subheadline}
          </p>
        )}

        {/* Player vertical 9:16 com moldura iluminada */}
        <div className="relative mt-6 w-full">
          <div
            className="absolute -inset-2 rounded-[2rem] bg-gradient-to-b from-red-600/45 via-red-600/10 to-transparent blur-xl"
            aria-hidden="true"
          />
          <div className="relative mx-auto aspect-[9/16] max-h-[56svh] w-full max-w-[min(360px,80vw)] overflow-hidden rounded-[1.6rem] border border-red-700/40 bg-black shadow-red">
            {!videoUrl ? (
              <div className="flex h-full w-full items-center justify-center p-6 text-center">
                <p className="text-sm text-bone/50">
                  Adicione o vídeo da VSL no painel <b>/admin</b> (vídeo vertical, .mp4 de preferência).
                </p>
              </div>
            ) : isFile ? (
              <>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  poster={poster || undefined}
                  autoPlay
                  muted
                  playsInline
                  onEnded={() => setRevealed(true)}
                  onClick={toggleMute}
                  className="h-full w-full cursor-pointer object-cover"
                />
                {muted && (
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/25"
                    aria-label="Ativar som"
                  >
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/55 ring-1 ring-white/25 backdrop-blur">
                      <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M11 5 6 9H2v6h4l5 4V5z" />
                        <line x1="23" y1="9" x2="17" y2="15" />
                        <line x1="17" y1="9" x2="23" y2="15" />
                      </svg>
                    </span>
                    <span className="animate-pulse rounded-full bg-black/55 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur">
                      {unmuteHint}
                    </span>
                  </button>
                )}
              </>
            ) : (
              <iframe
                src={embed}
                title="Vídeo"
                className="absolute inset-0 h-full w-full"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>

        {/* Botão + selos (no fim) — ou aviso de aguardar */}
        <div className="mt-7 flex w-full flex-col items-center">
          {revealed ? (
            <div className="flex w-full flex-col items-center" style={{ animation: "revealIn 0.55s var(--ease) both" }}>
              <a
                href={ctaHref}
                className="group flex w-full min-w-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-red-700 via-red-600 to-red-500 px-5 py-4 text-center text-base font-bold tracking-tight text-white shadow-red-soft transition-transform active:scale-[0.98]"
              >
                <span className="truncate">{ctaLabel}</span>
                <svg className="h-[18px] w-[18px] shrink-0 transition-transform group-active:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
              {trustBadges.length > 0 && (
                <div className="mx-auto mt-4 flex w-full max-w-sm flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[0.7rem] font-medium text-bone/45">
                  {trustBadges.map((b) => (
                    <span key={b} className="inline-flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      {b}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-bone/40">
              <span className="h-1.5 w-1.5 animate-blink rounded-full bg-red-500" />
              Assista até o final para liberar o acesso
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
