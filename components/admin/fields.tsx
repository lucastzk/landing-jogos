"use client";

import type { ReactNode } from "react";

export const inputCls =
  "w-full rounded-lg border border-line bg-white/[0.03] px-3 py-2.5 text-sm text-bone outline-none focus:border-red-500/60 focus:ring-2 focus:ring-red-500/15";

/** Input de uma linha com rótulo. */
export function Txt({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-bone/50">{label}</span>
      <input className={inputCls} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

/** Área de texto com rótulo. */
export function Area({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-bone/50">{label}</span>
      <textarea
        className={`${inputCls} resize-y`}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

/** Editor de lista de textos (adicionar / remover linhas). */
export function StrList({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <span className="mb-1 block text-xs font-medium text-bone/50">{label}</span>
      <div className="grid gap-2">
        {values.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input
              className={inputCls}
              value={v}
              placeholder={placeholder}
              onChange={(e) => onChange(values.map((x, idx) => (idx === i ? e.target.value : x)))}
            />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, idx) => idx !== i))}
              className="shrink-0 rounded-lg border border-line px-3 text-bone/50 transition-colors hover:text-red-400"
              aria-label="Remover"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...values, ""])}
          className="rounded-lg border border-dashed border-line py-2 text-xs text-bone/60 transition-colors hover:border-red-700/50"
        >
          + Adicionar
        </button>
      </div>
    </div>
  );
}

/** Card de seção com título. */
export function AdminCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid gap-3 rounded-2xl border border-line bg-white/[0.015] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-bone/40">{title}</p>
      {children}
    </div>
  );
}

/** Editor genérico de lista de itens (objetos) com adicionar / remover. */
export function ItemList<T>({
  items,
  onChange,
  empty,
  render,
  addLabel = "+ Adicionar item",
}: {
  items: T[];
  onChange: (v: T[]) => void;
  empty: () => T;
  render: (item: T, set: (patch: Partial<T>) => void, index: number) => ReactNode;
  addLabel?: string;
}) {
  return (
    <div className="grid gap-3">
      {items.map((item, i) => (
        <div key={i} className="relative rounded-xl border border-line bg-black/20 p-3">
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="absolute right-2 top-2 text-xs text-bone/40 transition-colors hover:text-red-400"
          >
            remover
          </button>
          <div className="grid gap-2 pr-16">
            {render(item, (patch) => onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it))), i)}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, empty()])}
        className="rounded-lg border border-dashed border-line py-2 text-xs text-bone/60 transition-colors hover:border-red-700/50"
      >
        {addLabel}
      </button>
    </div>
  );
}
