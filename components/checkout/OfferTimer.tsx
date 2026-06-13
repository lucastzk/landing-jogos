"use client";

import { useEffect, useState } from "react";

/**
 * Contador de urgência da oferta (escassez). Mostra um tempo regressivo no topo
 * do checkout para incentivar a conclusão da compra.
 *
 * O prazo é guardado no sessionStorage: dentro da mesma sessão ele continua de
 * onde parou (não "reinicia" a cada recarga). Ao zerar, abre uma nova janela —
 * a oferta nunca trava de fato, só mantém a sensação de tempo correndo.
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
  const [label, setLabel] = useState<string>("");

  useEffect(() => {
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
      const m = String(Math.floor(total / 60)).padStart(2, "0");
      const s = String(total % 60).padStart(2, "0");
      setLabel(`${m}:${s}`);
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [durationMs]);

  return (
    <div className="mx-auto mb-6 flex w-fit max-w-full items-center gap-2.5 rounded-full border border-red-700/50 bg-red-600/10 px-4 py-2 text-center shadow-red-soft">
      <svg className="h-4 w-4 flex-shrink-0 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
      <span className="text-[13px] font-semibold text-bone/75 sm:text-sm">
        Oferta por tempo limitado — termina em{" "}
        <span className="font-extrabold tabular-nums text-red-400" suppressHydrationWarning>
          {label || "--:--"}
        </span>
      </span>
    </div>
  );
}
