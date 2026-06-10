"use client";

import Field from "./Field";
import { useCheckoutConfig } from "./CheckoutConfigContext";
import {
  formatBRL,
  maskCardNumber,
  maskCardExpiry,
  onlyDigits,
  detectCardBrand,
} from "@/lib/format";
import type { CardData } from "@/lib/checkout-types";

type Props = {
  card: CardData;
  onChange: (patch: Partial<CardData>) => void;
  errors: Record<string, string>;
  amountInCents: number;
};

const BRAND_LABEL: Record<string, string> = {
  visa: "Visa",
  mastercard: "Master",
  amex: "Amex",
  elo: "Elo",
  hipercard: "Hiper",
};

export default function CardForm({ card, onChange, errors, amountInCents }: Props) {
  const checkout = useCheckoutConfig();
  const brand = detectCardBrand(card.number);
  const maxInstallments = Math.max(1, checkout.maxInstallments);

  return (
    <div className="grid gap-4">
      <Field
        label="Número do cartão"
        name="cardNumber"
        value={card.number}
        onChange={(v) => onChange({ number: maskCardNumber(v) })}
        error={errors.cardNumber}
        inputMode="numeric"
        autoComplete="cc-number"
        placeholder="0000 0000 0000 0000"
        adornment={
          brand !== "unknown" ? (
            <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-bone/60">
              {BRAND_LABEL[brand]}
            </span>
          ) : null
        }
      />

      <Field
        label="Nome impresso no cartão"
        name="cardHolder"
        value={card.holderName}
        onChange={(v) => onChange({ holderName: v.toUpperCase() })}
        error={errors.cardHolder}
        autoComplete="cc-name"
        placeholder="COMO ESTÁ NO CARTÃO"
      />

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Validade"
          name="cardExpiry"
          value={card.expiry}
          onChange={(v) => onChange({ expiry: maskCardExpiry(v) })}
          error={errors.cardExpiry}
          inputMode="numeric"
          autoComplete="cc-exp"
          placeholder="MM/AA"
          maxLength={5}
        />
        <Field
          label="CVV"
          name="cardCvv"
          value={card.cvv}
          onChange={(v) => onChange({ cvv: onlyDigits(v).slice(0, 4) })}
          error={errors.cardCvv}
          inputMode="numeric"
          autoComplete="cc-csc"
          placeholder="000"
          maxLength={4}
        />
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-bone/55">
          Parcelas
        </span>
        <select
          value={card.installments}
          onChange={(e) => onChange({ installments: Number(e.target.value) })}
          className="w-full rounded-2xl border border-line bg-white/[0.03] px-4 py-3.5 text-[1.05rem] text-bone outline-none transition-colors focus:border-red-500/70 focus:ring-4 focus:ring-red-500/15"
        >
          {Array.from({ length: maxInstallments }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n} className="bg-night text-bone">
              {n}x de {formatBRL(Math.round(amountInCents / n))}
              {n === 1 ? " à vista" : " sem juros"}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
