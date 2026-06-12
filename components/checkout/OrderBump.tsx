"use client";

import { useCheckoutConfig } from "./CheckoutConfigContext";
import { formatBRL } from "@/lib/format";

type Props = {
  selected: boolean;
  onToggle: (next: boolean) => void;
};

/**
 * Order bump interativo — checkbox opt-in posicionado logo ACIMA do botão de
 * pagar (último elemento antes do pagamento, padrão que mais converte).
 * Nunca vem pré-marcado (pré-marcar é dark pattern proibido pelo CDC).
 */
export default function OrderBump({ selected, onToggle }: Props) {
  const { orderBump } = useCheckoutConfig();
  if (!orderBump.enabled) return null;

  const hasAnchor = orderBump.fromInCents > orderBump.priceInCents;

  return (
    <button
      type="button"
      onClick={() => onToggle(!selected)}
      aria-pressed={selected}
      className={`flex w-full items-start gap-3 rounded-2xl border-2 border-dashed p-4 text-left transition-colors duration-200 ${
        selected ? "border-red-500/70 bg-red-600/10" : "border-line bg-white/[0.02] hover:border-red-700/50"
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
          selected ? "border-red-500 bg-red-500" : "border-bone/30 bg-transparent"
        }`}
      >
        {selected && (
          <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </span>
      {orderBump.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={orderBump.image}
          alt=""
          className="h-14 w-14 flex-shrink-0 rounded-lg border border-line object-cover"
        />
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-bone">{orderBump.title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-bone/55">{orderBump.description}</span>
        <span className="mt-1.5 flex items-center gap-2">
          {hasAnchor && (
            <span className="text-xs text-bone/40 line-through">{formatBRL(orderBump.fromInCents)}</span>
          )}
          <span className="text-sm font-bold text-red-400">+ {formatBRL(orderBump.priceInCents)}</span>
        </span>
      </span>
    </button>
  );
}
