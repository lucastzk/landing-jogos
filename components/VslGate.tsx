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
 * Página VSL (vídeo-porteiro): o vídeo vertical roda sozinho MUDO; clicar na
 * tela ativa o som; o botão que leva à landing só aparece quando o vídeo termina.
 */
export default function VslGate({
  vslPage,
  ctaHref,
}: {
  vslPage: SiteConfig["vslPage"];
  ctaHref: string;
}) {
  const { videoUrl, poster, headline, ctaLabel, unmuteHint, revealAfterSeconds } = vslPage;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [revealed, setRevealed] = useState(false);

  const isFile = isFileUrl(videoUrl);
  const embed = !isFile && videoUrl ? buildEmbed(videoUrl) : "";

  // Quando liberar o botão "continuar":
  //  - sem vídeo → libera direto (não trava o funil)
  //  - arquivo .mp4 → no FIM do vídeo (onEnded), a não ser que revealAfterSeconds > 0
  //  - YouTube/Vimeo → após revealAfterSeconds (ou 60s de fallback)
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
    <main className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-black px-4 py-6">
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-red-600/15 blur-3xl"
        aria-hidden="true"
      />

      {headline && (
        <h1 className="relative z-10 mb-4 max-w-md text-center font-display text-xl font-extrabold tracking-tight text-bone sm:text-2xl">
          {headline}
        </h1>
      )}

      {/* Player vertical 9:16 */}
      <div className="relative z-10 w-full max-w-[min(420px,86vw)]">
        <div className="relative aspect-[9/16] max-h-[74svh] overflow-hidden rounded-3xl border border-red-700/30 bg-black shadow-red">
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
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 ring-1 ring-white/25 backdrop-blur">
                    <svg
                      className="h-7 w-7 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M11 5 6 9H2v6h4l5 4V5z" />
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                  </span>
                  <span className="animate-pulse rounded-full bg-black/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur">
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

      {/* Botão continuar — só aparece quando o vídeo termina */}
      <div className="relative z-10 mt-6 flex min-h-[60px] w-full max-w-[min(420px,86vw)] flex-col items-center justify-center">
        {revealed ? (
          <a
            href={ctaHref}
            style={{ animation: "revealIn 0.55s var(--ease) both" }}
            className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red-700 via-red-600 to-red-500 px-6 py-4 text-center text-base font-bold tracking-tight text-white shadow-red-soft transition-transform active:scale-[0.98]"
          >
            {ctaLabel}
            <svg
              className="h-[18px] w-[18px] shrink-0 transition-transform group-active:translate-x-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        ) : (
          <p className="text-center text-xs font-medium uppercase tracking-wide text-bone/40">
            Assista até o final para liberar o acesso
          </p>
        )}
      </div>
    </main>
  );
}
