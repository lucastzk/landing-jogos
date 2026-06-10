"use client";

import { useCheckoutConfig } from "./CheckoutConfigContext";
import { formatBRL } from "@/lib/format";

/**
 * Resumo do pedido (somente exibição). No desktop fica fixo na coluna direita;
 * no mobile aparece no topo. O total reflete o order bump quando marcado — a
 * interação do bump fica no componente OrderBump, acima do botão de pagar.
 */
export default function OrderSummary({ bumpSelected }: { bumpSelected: boolean }) {
  const { product, orderBump } = useCheckoutConfig();
  const bumpOn = bumpSelected && orderBump.enabled;
  const total = product.priceInCents + (bumpOn ? orderBump.priceInCents : 0);

  return (
    <div className="glass rounded-3xl border-line p-5 sm:p-6">
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/45">
        Seu pedido
      </h2>

      {/* Item principal */}
      <div className="mt-4 flex items-center gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-line bg-white/[0.03]">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <svg className="h-6 w-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
            </svg>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-bone">{product.name}</p>
          <p className="truncate text-sm text-bone/50">{product.description}</p>
        </div>
        <p className="flex-shrink-0 font-semibold text-bone">{formatBRL(product.priceInCents)}</p>
      </div>

      {/* Linha do bump (só quando selecionado) */}
      {bumpOn && (
        <div className="mt-3 flex items-center gap-3 border-t border-line/70 pt-3">
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-600/15">
            <svg className="h-3 w-3 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <span className="min-w-0 flex-1 truncate text-sm text-bone/70">{orderBump.title}</span>
          <span className="flex-shrink-0 text-sm font-semibold text-bone">
            {formatBRL(orderBump.priceInCents)}
          </span>
        </div>
      )}

      {/* Total */}
      <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
        <span className="text-sm font-medium text-bone/60">Total</span>
        <span className="font-display text-2xl font-extrabold tracking-tight text-bone">
          {formatBRL(total)}
        </span>
      </div>
    </div>
  );
}
