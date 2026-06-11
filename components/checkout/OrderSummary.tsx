"use client";

import { useCheckoutConfig } from "./CheckoutConfigContext";
import { formatBRL } from "@/lib/format";

/**
 * Resumo do pedido (somente exibição). No desktop fica fixo na coluna direita;
 * no mobile aparece no topo. O total reflete o order bump quando marcado — a
 * interação do bump fica no componente OrderBump, acima do botão de pagar.
 */
export default function OrderSummary({ bumpSelected }: { bumpSelected: boolean }) {
  const { product, orderBump, guaranteeDays } = useCheckoutConfig();
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

      {/* Selo de garantia */}
      <div className="mt-5 flex items-center gap-4 rounded-2xl border border-red-700/25 bg-red-600/[0.06] p-4">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-full bg-red-600/20 blur-lg" aria-hidden="true" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-red-700/40 bg-gradient-to-br from-red-600/20 to-red-700/5">
            <div className="flex h-[3.4rem] w-[3.4rem] flex-col items-center justify-center rounded-full border-2 border-dashed border-red-500/40 text-red-500">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span className="font-display text-base font-extrabold leading-none text-bone">{guaranteeDays}</span>
              <span className="text-[7px] font-bold uppercase tracking-[0.16em] text-red-400">dias</span>
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-bone">Garantia de {guaranteeDays} dias</p>
          <p className="mt-0.5 text-xs leading-relaxed text-bone/55">
            Não curtiu? Devolvemos 100% do seu dinheiro, sem burocracia.
          </p>
        </div>
      </div>
    </div>
  );
}
