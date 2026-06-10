"use client";

import { createContext, useContext } from "react";
import type { CheckoutConfig } from "@/config/checkout";

const CheckoutConfigContext = createContext<CheckoutConfig | null>(null);

export function CheckoutConfigProvider({
  value,
  children,
}: {
  value: CheckoutConfig;
  children: React.ReactNode;
}) {
  return <CheckoutConfigContext.Provider value={value}>{children}</CheckoutConfigContext.Provider>;
}

/** Lê a config do checkout (com as edições do painel já aplicadas). */
export function useCheckoutConfig(): CheckoutConfig {
  const value = useContext(CheckoutConfigContext);
  if (!value) throw new Error("useCheckoutConfig deve ser usado dentro de CheckoutConfigProvider");
  return value;
}
