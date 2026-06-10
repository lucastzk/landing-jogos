"use client";

import { useEffect, useRef, useState } from "react";
import type { PaymentStatus, PixData, StatusResponse } from "@/lib/checkout-types";

type Props = {
  transactionId: string;
  pix: PixData;
  onStatus: (status: PaymentStatus) => void;
};

/** Diferença em mm:ss até um ISO. Retorna "00:00" quando expirado. */
function countdown(expiresAt?: string): { label: string; expired: boolean } {
  if (!expiresAt) return { label: "", expired: false };
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return { label: "00:00", expired: true };
  const total = Math.floor(ms / 1000);
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return { label: `${m}:${s}`, expired: false };
}

export default function PixPayment({ transactionId, pix, onStatus }: Props) {
  const [copied, setCopied] = useState(false);
  const [timer, setTimer] = useState(() => countdown(pix.expiresAt));
  const onStatusRef = useRef(onStatus);
  onStatusRef.current = onStatus;

  // Contador regressivo (1s).
  useEffect(() => {
    const id = setInterval(() => {
      const next = countdown(pix.expiresAt);
      setTimer(next);
      if (next.expired) {
        onStatusRef.current("expired");
        clearInterval(id);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [pix.expiresAt]);

  // Polling do status no nosso backend (que consulta a AmploPay).
  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const res = await fetch(`/api/checkout/status?id=${encodeURIComponent(transactionId)}`, {
          cache: "no-store",
        });
        const data: StatusResponse = await res.json();
        if (active && data.ok && data.status !== "pending") {
          onStatusRef.current(data.status);
          return; // para de pollar em estado terminal
        }
      } catch {
        /* erro de rede transitório — tenta de novo no próximo tick */
      }
      if (active) setTimeout(poll, 4000);
    };
    const first = setTimeout(poll, 4000);
    return () => {
      active = false;
      clearTimeout(first);
    };
  }, [transactionId]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pix.copyPaste);
    } catch {
      /* clipboard pode falhar em http — o usuário ainda pode selecionar manualmente */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="text-center">
      <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-red-700/40 bg-red-600/10 px-4 py-1.5 text-sm font-bold text-red-400">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
        </span>
        Aguardando pagamento
      </div>

      <h3 className="font-display text-xl font-bold tracking-tight text-bone">
        Escaneie o QR Code para pagar
      </h3>
      <p className="mt-1 text-sm text-bone/55">
        Abra o app do seu banco, escolha PIX e escaneie o código abaixo.
      </p>

      {/* QR Code */}
      <div className="mx-auto mt-6 w-fit rounded-3xl bg-white p-4 shadow-soft">
        {pix.qrCodeImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pix.qrCodeImage} alt="QR Code PIX" className="h-52 w-52" />
        ) : (
          <div className="flex h-52 w-52 items-center justify-center px-4 text-center text-xs text-black/60">
            QR indisponível — use o código copia-e-cola abaixo.
          </div>
        )}
      </div>

      {pix.expiresAt && (
        <p className="mt-4 text-sm text-bone/60">
          Expira em{" "}
          <span className={`font-bold tabular-nums ${timer.expired ? "text-red-500" : "text-bone"}`}>
            {timer.label}
          </span>
        </p>
      )}

      {/* Copia e cola */}
      <div className="mt-6 text-left">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-bone/55">
          PIX copia e cola
        </p>
        <div className="flex items-stretch gap-2">
          <input
            readOnly
            value={pix.copyPaste}
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 truncate rounded-2xl border border-line bg-white/[0.03] px-4 py-3 text-sm text-bone/70 outline-none"
          />
          <button
            type="button"
            onClick={copy}
            className="flex-shrink-0 rounded-2xl bg-gradient-to-r from-red-700 to-red-500 px-5 text-sm font-bold text-white shadow-red-soft transition-transform active:scale-95"
          >
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>
      </div>

      <p className="mt-6 text-xs text-bone/40">
        Assim que o pagamento for confirmado, esta tela atualiza sozinha.
      </p>
    </div>
  );
}
