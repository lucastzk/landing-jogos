"use client";

import { forwardRef } from "react";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  inputMode?: "text" | "email" | "numeric" | "tel" | "decimal";
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
  name?: string;
  /** Conteúdo opcional à direita (ícone da bandeira, etc.). */
  adornment?: React.ReactNode;
};

/**
 * Campo de formulário do checkout: rótulo flutuante simples, validação inline,
 * teclados nativos no mobile (inputMode) e foco vermelho da identidade do site.
 */
const Field = forwardRef<HTMLInputElement, Props>(function Field(
  { label, value, onChange, error, type = "text", inputMode, placeholder, autoComplete, maxLength, name, adornment },
  ref
) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-bone/55">
        {label}
      </span>
      <span className="relative block">
        <input
          ref={ref}
          name={name}
          type={type}
          inputMode={inputMode}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          className={`w-full rounded-2xl border bg-white/[0.03] px-4 py-3.5 text-[1.05rem] text-bone placeholder:text-bone/30 outline-none transition-colors duration-200 focus:border-red-500/70 focus:bg-white/[0.05] focus:ring-4 focus:ring-red-500/15 ${
            error ? "border-red-500/70" : "border-line"
          } ${adornment ? "pr-12" : ""}`}
        />
        {adornment && (
          <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center">
            {adornment}
          </span>
        )}
      </span>
      {error && <span className="mt-1.5 block text-xs font-medium text-red-400">{error}</span>}
    </label>
  );
});

export default Field;
