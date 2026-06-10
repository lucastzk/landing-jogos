"use client";

import { useMemo, useState } from "react";
import type { CheckoutConfig } from "@/config/checkout";
import {
  formatBRL,
  isValidCPF,
  isValidCardExpiry,
  isValidCardNumber,
  isValidEmail,
  isValidPhone,
  maskCPF,
  maskPhone,
  onlyDigits,
} from "@/lib/format";
import type {
  CardData,
  CreateCheckoutRequest,
  CreateCheckoutResponse,
  Customer,
  PaymentMethod,
  PaymentStatus,
  PixData,
} from "@/lib/checkout-types";
import { getTracking } from "@/lib/tracking";
import { CheckoutConfigProvider } from "./CheckoutConfigContext";
import Field from "./Field";
import OrderSummary from "./OrderSummary";
import OrderBump from "./OrderBump";
import CardForm from "./CardForm";
import PixPayment from "./PixPayment";

type Step = "form" | "pix" | "success" | "failed" | "expired";

const EMPTY_CARD: CardData = {
  number: "",
  holderName: "",
  expiry: "",
  cvv: "",
  installments: 1,
};

export default function CheckoutForm({ checkout }: { checkout: CheckoutConfig }) {
  const [step, setStep] = useState<Step>("form");
  const [method, setMethod] = useState<PaymentMethod>(checkout.methods.pix ? "pix" : "card");
  const [bump, setBump] = useState(false);

  const [customer, setCustomer] = useState<Customer>({ name: "", email: "", cpf: "", phone: "" });
  const [card, setCard] = useState<CardData>(EMPTY_CARD);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string>("");

  const [transactionId, setTransactionId] = useState<string>("");
  const [pix, setPix] = useState<PixData | null>(null);

  const amountInCents = useMemo(
    () => checkout.product.priceInCents + (bump && checkout.orderBump.enabled ? checkout.orderBump.priceInCents : 0),
    [bump]
  );

  const setCustomerField = (patch: Partial<Customer>) => setCustomer((c) => ({ ...c, ...patch }));
  const setCardField = (patch: Partial<CardData>) => setCard((c) => ({ ...c, ...patch }));

  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    if (customer.name.trim().split(" ").filter(Boolean).length < 2) e.name = "Informe seu nome completo.";
    if (!isValidEmail(customer.email)) e.email = "E-mail inválido.";
    if (!isValidPhone(customer.phone)) e.phone = "Telefone inválido (com DDD).";
    if (!isValidCPF(customer.cpf)) e.cpf = "CPF inválido.";

    if (method === "card") {
      if (!isValidCardNumber(card.number)) e.cardNumber = "Número de cartão inválido.";
      if (card.holderName.trim().length < 3) e.cardHolder = "Informe o nome do cartão.";
      if (!isValidCardExpiry(card.expiry)) e.cardExpiry = "Validade inválida.";
      if (card.cvv.length < 3) e.cardCvv = "CVV inválido.";
    }
    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setFormError("");
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      const first = document.querySelector('[aria-invalid="true"]') as HTMLElement | null;
      first?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateCheckoutRequest = {
        method,
        bump,
        customer: {
          ...customer,
          cpf: onlyDigits(customer.cpf),
          phone: onlyDigits(customer.phone),
        },
        card: method === "card" ? { ...card, number: onlyDigits(card.number) } : undefined,
        tracking: getTracking(), // UTMs da campanha (Facebook Ads etc.)
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: CreateCheckoutResponse = await res.json();

      if (!data.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        setFormError(data.error || "Não foi possível processar o pagamento. Tente novamente.");
        return;
      }

      setTransactionId(data.transactionId);

      if (data.method === "pix" && data.pix) {
        setPix(data.pix);
        setStep("pix");
      } else if (data.status === "paid") {
        setStep("success");
      } else if (data.status === "failed") {
        setStep("failed");
      } else {
        // cartão em análise: tratamos como aguardando.
        setStep("pix");
      }
    } catch {
      setFormError("Falha de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  function handlePixStatus(status: PaymentStatus) {
    if (status === "paid") setStep("success");
    else if (status === "expired") setStep("expired");
    else if (status === "failed" || status === "canceled") setStep("failed");
  }

  // -------------------------------------------------------------- ESTADOS FINAIS
  if (step === "success") {
    return (
      <ResultCard
        tone="success"
        title="Pagamento confirmado! 🎉"
        text="Recebemos seu pagamento. O acesso ao seu produto foi liberado — confira seu e-mail."
      />
    );
  }
  if (step === "expired") {
    return (
      <ResultCard
        tone="neutral"
        title="O PIX expirou"
        text="O tempo para pagamento acabou. Recarregue a página para gerar um novo código."
        action={{ label: "Gerar novo PIX", onClick: () => location.reload() }}
      />
    );
  }
  if (step === "failed") {
    return (
      <ResultCard
        tone="error"
        title="Não conseguimos aprovar"
        text="O pagamento não foi aprovado. Confira os dados ou tente outro método."
        action={{ label: "Tentar novamente", onClick: () => location.reload() }}
      />
    );
  }

  // -------------------------------------------------------------- ESTADO PIX
  if (step === "pix" && pix) {
    return (
      <div className="glass mx-auto max-w-lg rounded-3xl border-line p-6 sm:p-8">
        <PixPayment transactionId={transactionId} pix={pix} onStatus={handlePixStatus} />
      </div>
    );
  }

  // -------------------------------------------------------------- FORMULÁRIO
  const payLabel =
    method === "pix"
      ? `Pagar ${formatBRL(amountInCents)} no PIX`
      : `Pagar ${formatBRL(amountInCents)} no cartão`;

  return (
    <CheckoutConfigProvider value={checkout}>
    <form
      onSubmit={handleSubmit}
      className="lg:grid lg:grid-cols-[1fr_21rem] lg:items-start lg:gap-7"
      noValidate
    >
      {/* RESUMO — topo no mobile, coluna direita fixa no desktop */}
      <aside className="mb-5 lg:order-2 lg:mb-0 lg:sticky lg:top-6">
        <OrderSummary bumpSelected={bump} />
      </aside>

      {/* COLUNA PRINCIPAL — dados, pagamento, bump, botão */}
      <div className="grid gap-5 lg:order-1">
      {/* Identificação */}
      <div className="glass rounded-3xl border-line p-5 sm:p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-bone/45">
          Seus dados
        </h2>
        <div className="grid gap-4">
          <Field
            label="Nome completo"
            name="name"
            value={customer.name}
            onChange={(v) => setCustomerField({ name: v })}
            error={errors.name}
            autoComplete="name"
            placeholder="Seu nome completo"
          />
          <Field
            label="E-mail"
            name="email"
            type="email"
            inputMode="email"
            value={customer.email}
            onChange={(v) => setCustomerField({ email: v })}
            error={errors.email}
            autoComplete="email"
            placeholder="voce@email.com"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Celular"
              name="phone"
              inputMode="tel"
              value={customer.phone}
              onChange={(v) => setCustomerField({ phone: maskPhone(v) })}
              error={errors.phone}
              autoComplete="tel"
              placeholder="(11) 99999-8888"
              maxLength={15}
            />
            <Field
              label="CPF"
              name="cpf"
              inputMode="numeric"
              value={customer.cpf}
              onChange={(v) => setCustomerField({ cpf: maskCPF(v) })}
              error={errors.cpf}
              placeholder="000.000.000-00"
              maxLength={14}
            />
          </div>
        </div>
      </div>

      {/* Pagamento */}
      <div className="glass rounded-3xl border-line p-5 sm:p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-bone/45">
          Pagamento
        </h2>

        {/* Abas de método */}
        {checkout.methods.pix && checkout.methods.card && (
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl border border-line bg-white/[0.02] p-1.5">
            <MethodTab active={method === "pix"} onClick={() => setMethod("pix")} label="PIX" hint="Aprovação na hora" />
            <MethodTab active={method === "card"} onClick={() => setMethod("card")} label="Cartão" hint={`até ${checkout.maxInstallments}x`} />
          </div>
        )}

        {method === "pix" ? (
          <div className="flex items-start gap-3 rounded-2xl border border-line bg-white/[0.02] p-4 text-sm text-bone/65">
            <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" />
            </svg>
            <span>Ao confirmar, geramos um QR Code PIX. A aprovação é imediata e o acesso é liberado na hora.</span>
          </div>
        ) : (
          <CardForm card={card} onChange={setCardField} errors={errors} amountInCents={amountInCents} />
        )}
      </div>

      {/* ORDER BUMP — logo acima do botão (onde mais converte) */}
      <OrderBump selected={bump} onToggle={setBump} />

      {formError && (
        <p className="rounded-2xl border border-red-700/50 bg-red-600/10 px-4 py-3 text-center text-sm font-medium text-red-300">
          {formError}
        </p>
      )}

      {/* CTA */}
      <button
        type="submit"
        disabled={submitting}
        className="group relative inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-red-700 via-red-600 to-red-500 px-9 py-[1.15rem] text-base font-bold tracking-tight text-white shadow-red transition-all duration-300 hover:shadow-red-soft focus:outline-none focus:ring-4 focus:ring-red-500/40 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? (
          <>
            <Spinner /> Processando...
          </>
        ) : (
          <>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            {payLabel}
          </>
        )}
      </button>

      {/* Confiança */}
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="flex items-center gap-2 text-xs text-bone/50">
          <svg className="h-4 w-4 text-bone/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          {checkout.securityText}
        </p>
        <p className="text-xs text-bone/40">
          Garantia incondicional de {checkout.guaranteeDays} dias • seus dados estão protegidos
        </p>
      </div>
      </div>
    </form>
    </CheckoutConfigProvider>
  );
}

function MethodTab({ active, onClick, label, hint }: { active: boolean; onClick: () => void; label: string; hint: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-3 text-center transition-colors ${
        active ? "bg-gradient-to-r from-red-700 to-red-500 text-white shadow-red-soft" : "text-bone/60 hover:text-bone"
      }`}
    >
      <span className="block text-sm font-bold">{label}</span>
      <span className={`block text-[11px] ${active ? "text-white/80" : "text-bone/40"}`}>{hint}</span>
    </button>
  );
}

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z" />
    </svg>
  );
}

function ResultCard({
  tone,
  title,
  text,
  action,
}: {
  tone: "success" | "error" | "neutral";
  title: string;
  text: string;
  action?: { label: string; onClick: () => void };
}) {
  const ring =
    tone === "success" ? "border-green-500/40 bg-green-500/10" : tone === "error" ? "border-red-700/50 bg-red-600/10" : "border-line bg-white/[0.03]";
  const iconColor = tone === "success" ? "text-green-400" : tone === "error" ? "text-red-400" : "text-bone/60";
  return (
    <div className="glass mx-auto max-w-lg rounded-3xl border-line p-8 text-center sm:p-10">
      <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border ${ring}`}>
        {tone === "success" ? (
          <svg className={`h-8 w-8 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
        ) : tone === "error" ? (
          <svg className={`h-8 w-8 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
        ) : (
          <svg className={`h-8 w-8 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
        )}
      </div>
      <h2 className="font-display text-2xl font-extrabold tracking-tight text-bone">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-bone/60">{text}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-red-700 to-red-500 px-7 py-3 text-sm font-bold text-white shadow-red-soft"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
