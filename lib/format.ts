/**
 * Utilitários de formatação e validação para o checkout.
 * Tudo aqui é puro (sem dependências) e pode rodar no servidor ou no browser.
 */

/** Mantém apenas os dígitos de uma string. */
export function onlyDigits(value: string): string {
  return value.replace(/\D+/g, "");
}

/** Formata centavos como moeda brasileira: 2990 → "R$ 29,90". */
export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Centavos → string em reais para edição: 2990 → "29,90". */
export function centsToReais(cents: number): string {
  return ((cents || 0) / 100).toFixed(2).replace(".", ",");
}

/** String em reais → centavos: "29,90" / "1.234,56" → 2990 / 123456. */
export function reaisToCents(value: string): number {
  const n = parseFloat(String(value).replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

/** Máscara de CPF: 12345678901 → "123.456.789-01". */
export function maskCPF(value: string): string {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/** Validação real de CPF (dígitos verificadores). */
export function isValidCPF(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const calcCheck = (length: number): number => {
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += parseInt(cpf[i], 10) * (length + 1 - i);
    }
    const result = (sum * 10) % 11;
    return result === 10 ? 0 : result;
  };

  return calcCheck(9) === parseInt(cpf[9], 10) && calcCheck(10) === parseInt(cpf[10], 10);
}

/** Máscara de telefone BR: "11999998888" → "(11) 99999-8888". */
export function maskPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits.replace(/(\d{0,2})/, "($1");
  if (digits.length <= 6) return digits.replace(/(\d{2})(\d{0,4})/, "($1) $2");
  if (digits.length <= 10) return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

/** Telefone válido (10 ou 11 dígitos, com DDD). */
export function isValidPhone(value: string): boolean {
  const digits = onlyDigits(value);
  return digits.length === 10 || digits.length === 11;
}

/** E-mail simples mas suficiente para validação de formulário. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/** Máscara de número de cartão: agrupa em blocos de 4. */
export function maskCardNumber(value: string): string {
  return onlyDigits(value)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

/** Máscara de validade do cartão: "1228" → "12/28". */
export function maskCardExpiry(value: string): string {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/** Detecta a bandeira do cartão pelo início do número (para o ícone). */
export function detectCardBrand(value: string): "visa" | "mastercard" | "amex" | "elo" | "hipercard" | "unknown" {
  const n = onlyDigits(value);
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  if (/^(4011|4312|4389|5041|5066|5067|509|6277|6362|6363|650|651|655)/.test(n)) return "elo";
  if (/^(606282|3841)/.test(n)) return "hipercard";
  return "unknown";
}

/** Validação de cartão por algoritmo de Luhn. */
export function isValidCardNumber(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

/** Validade do cartão ainda no futuro (MM/AA). */
export function isValidCardExpiry(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length !== 4) return false;
  const month = parseInt(digits.slice(0, 2), 10);
  const year = 2000 + parseInt(digits.slice(2), 10);
  if (month < 1 || month > 12) return false;
  // Último dia do mês de validade.
  const expiry = new Date(year, month, 0, 23, 59, 59);
  return expiry.getTime() >= Date.now();
}
