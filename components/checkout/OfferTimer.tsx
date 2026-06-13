"use client";

import { useEffect, useState } from "react";

/**
 * Contador de urgência da oferta (escassez) — topo do /checkout.
 *
 * VERSÃO FINAL: faixa full-width "Apple-meets-gamer".
 * - MOLDURA: borda em gradiente vermelho completo (wrapper p-[1.5px] +
 *   animate-gradient-pan) sobre um painel bg-night. O gradiente é completo, então
 *   fica LINDO PARADO no iPhone — a animação só desliza a posição (e gradient-pan
 *   NÃO está na lista de animações cortadas em pointer:coarse).
 * - PLACAR: o tempo é renderizado em BLOCOS de dígitos (subcomponente TimeBlock),
 *   caixas bg-night com leve brilho interno no topo e rótulos min/seg — largura
 *   fixa que nunca "pula" quando os números mudam (robusto a 360px).
 * - BASE: barra de progresso fina, edge-to-edge, que esvazia em tempo real
 *   (width % por estado, determinística no 1º render) + leitura "X% restante".
 *
 * O prazo é guardado no sessionStorage: dentro da mesma sessão continua de onde
 * parou (não reinicia a cada recarga). Ao zerar, abre uma nova janela — a oferta
 * nunca trava de fato, só mantém a sensação de tempo correndo.
 *
 * SSR-safe / sem hydration mismatch: nada de Date.now() no render do servidor. O
 * primeiro render (SSR + 1º render do client) é determinístico (placeholder "--"
 * e barra cheia); o tempo só entra no useEffect, com suppressHydrationWarning nos
 * elementos que mudam.
 */
const KEY = "offer_deadline_v1";

function readDeadline(durationMs: number): number {
  try {
    const raw = sessionStorage.getItem(KEY);
    const saved = raw ? Number(raw) : 0;
    if (saved && saved > Date.now()) return saved;
  } catch {
    /* sessionStorage pode falhar (modo privado) — segue com prazo novo */
  }
  const next = Date.now() + durationMs;
  try {
    sessionStorage.setItem(KEY, String(next));
  } catch {
    /* ignora */
  }
  return next;
}

export default function OfferTimer({ minutes }: { minutes: number }) {
  const durationMs = Math.max(1, minutes) * 60 * 1000;

  // Preenchido só após o mount → SSR e 1º client render são idênticos.
  const [mounted, setMounted] = useState(false);
  const [mm, setMm] = useState("--");
  const [ss, setSs] = useState("--");
  // Fração de tempo RESTANTE (1 = cheio, 0 = vazio). Começa cheio p/ não "pular".
  const [fraction, setFraction] = useState(1);

  useEffect(() => {
    setMounted(true);
    let deadline = readDeadline(durationMs);

    const update = () => {
      let ms = deadline - Date.now();
      if (ms <= 0) {
        // Zerou: abre uma nova janela para manter a urgência viva.
        deadline = Date.now() + durationMs;
        try {
          sessionStorage.setItem(KEY, String(deadline));
        } catch {
          /* ignora */
        }
        ms = durationMs;
      }
      const total = Math.floor(ms / 1000);
      setMm(String(Math.floor(total / 60)).padStart(2, "0"));
      setSs(String(total % 60).padStart(2, "0"));
      setFraction(Math.min(1, Math.max(0, ms / durationMs)));
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [durationMs]);

  // Barra/percentual: cheios no 1º render (determinístico) → esvaziam após mount.
  const pct = `${(fraction * 100).toFixed(2)}%`;
  const pctLeft = mounted ? Math.round(fraction * 100) : 100;

  return (
    <div
      className="mb-6 w-full"
      role="timer"
      aria-label="Tempo restante da oferta"
    >
      {/* WRAPPER = a BORDA em gradiente vermelho completo (1.5px), só desliza no pan */}
      <div className="animate-gradient-pan rounded-3xl bg-[linear-gradient(110deg,#c20810_0%,#ff3535_26%,#ff5a5a_50%,#f01010_74%,#c20810_100%)] bg-[length:250%_100%] p-[1.5px] shadow-red-soft">
        {/* Painel escuro por dentro */}
        <div className="relative overflow-hidden rounded-[calc(1.75rem-1.5px)] bg-night">
          {/* Glow vermelho vindo da direita (decorativo, atrás do placar) — PARADO */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-24 h-60 w-60 rounded-full bg-red-600/20 blur-3xl"
          />
          {/* Fio de luz no topo — acabamento "caro" */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
          />

          <div className="relative flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-8 sm:py-6">
            {/* ESQUERDA — chip + título curto + subcopy fina */}
            <div className="flex flex-col gap-3">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-red-700/50 bg-red-600/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-red-400 sm:text-[11px]">
                {/* Ponto vermelho — firme parado no mobile (animate-ping cai em coarse) */}
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
                </span>
                Termina em breve
              </span>

              <div>
                <h3 className="font-display text-lg font-bold leading-tight tracking-tight text-bone sm:text-xl">
                  Preço promocional reservado
                </h3>
                <p className="mt-1 max-w-sm text-[12px] leading-snug text-bone/55 sm:text-[13px]">
                  Preço promocional acaba quando o tempo zerar. Essa condição não volta.
                </p>
              </div>
            </div>

            {/* DIREITA — placar de dígitos em blocos (min : seg) */}
            <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-bone/40">
                Tempo restante
              </span>
              <div className="flex items-start gap-1.5 sm:gap-2">
                <TimeBlock value={mounted ? mm : "--"} label="min" />

                {/* Separador ":" — fixo (não depende de animação) */}
                <span
                  aria-hidden="true"
                  className="flex h-14 items-center font-display text-3xl font-black leading-none text-red-500/80 sm:h-16 sm:text-4xl"
                >
                  :
                </span>

                <TimeBlock value={mounted ? ss : "--"} label="seg" />
              </div>
            </div>
          </div>

          {/* BASE — barra de progresso fina edge-to-edge que esvazia em tempo real */}
          <div className="relative h-1.5 w-full bg-white/[0.06]" aria-hidden="true">
            <div
              className="h-full rounded-r-full bg-gradient-to-r from-red-700 via-red-500 to-red-400 shadow-[0_0_14px_-1px_rgba(255,53,53,0.7)] transition-[width] duration-1000 ease-linear"
              style={{ width: pct }}
              suppressHydrationWarning
            />
          </div>

          {/* Rodapé do progresso: leitura concreta da escassez + CTA sutil */}
          <div className="relative flex items-center justify-between px-5 pb-3 pt-2.5 text-[11px] font-medium sm:px-8 sm:text-xs">
            <span
              className="font-semibold tabular-nums text-red-400"
              suppressHydrationWarning
            >
              {pctLeft}% do tempo restante
            </span>
            <span className="text-bone/40">Garanta antes de zerar</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Caixinha arredondada de um par de dígitos com rótulo minúsculo embaixo. */
function TimeBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative flex h-14 min-w-[3.25rem] items-center justify-center rounded-2xl border border-red-700/40 bg-night px-2.5 shadow-soft sm:h-16 sm:min-w-[3.75rem] sm:px-3.5">
        {/* Topo levemente iluminado p/ dar volume ao bloco (parado) */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-2xl bg-gradient-to-b from-white/[0.07] to-transparent"
        />
        <span
          className="font-display text-3xl font-black tabular-nums tracking-tight text-bone sm:text-4xl"
          suppressHydrationWarning
        >
          {value}
        </span>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-bone/45 sm:text-[11px]">
        {label}
      </span>
    </div>
  );
}
