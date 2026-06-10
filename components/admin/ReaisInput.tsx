"use client";

import { useState } from "react";
import { centsToReais, reaisToCents } from "@/lib/format";

type Props = {
  cents: number;
  onChange: (cents: number) => void;
  className?: string;
  placeholder?: string;
};

/** Input de preço em reais que reporta o valor em centavos. */
export default function ReaisInput({ cents, onChange, className = "", placeholder = "0,00" }: Props) {
  const [text, setText] = useState(cents ? centsToReais(cents) : "");

  return (
    <span className={`relative inline-flex w-full items-center ${className}`}>
      <span className="pointer-events-none absolute left-3 text-sm text-bone/40">R$</span>
      <input
        inputMode="decimal"
        value={text}
        placeholder={placeholder}
        onChange={(e) => {
          const v = e.target.value.replace(/[^\d.,]/g, "");
          setText(v);
          onChange(reaisToCents(v));
        }}
        onBlur={() => setText(cents ? centsToReais(cents) : "")}
        className="w-full rounded-lg border border-line bg-white/[0.03] py-2.5 pl-9 pr-3 text-sm text-bone outline-none focus:border-red-500/60 focus:ring-2 focus:ring-red-500/15"
      />
    </span>
  );
}
