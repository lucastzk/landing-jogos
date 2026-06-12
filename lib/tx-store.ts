/**
 * Store de transações (lado SERVIDOR, em disco). Guarda só o necessário para
 * disparar o Purchase server-side (CAPI) quando o pagamento confirmar: valor,
 * dados de contato (para match/atribuição), cookies do pixel e contexto do
 * navegador. Persistir é preciso porque o webhook da AmploPay é server-to-server
 * e NÃO tem os cookies/IP do cliente — pegamos isso no momento do checkout.
 *
 * Fica em data/tx/{id}.json — `data/` é gitignored e persiste no disco do VPS.
 * Não importe em componente client (usa fs).
 */
import { promises as fs } from "fs";
import path from "path";

const TX_DIR = path.join(process.cwd(), "data", "tx");

export type TxRecord = {
  id: string;
  amountInCents: number;
  currency: string; // "BRL"
  contentName?: string;
  email?: string;
  phone?: string; // só dígitos
  fbp?: string;
  fbc?: string;
  clientIp?: string;
  userAgent?: string;
  eventSourceUrl?: string;
  createdAtSec: number;
  purchaseSent?: boolean; // idempotência do CAPI (Meta)
  // --- usados pela integração UTMify ---
  tracking?: Record<string, string>; // UTMs/src/sck da campanha
  customerName?: string;
  document?: string; // CPF (só dígitos)
  method?: "pix" | "card";
  productId?: string;
  isTest?: boolean;
  utmifyPaidSent?: boolean; // idempotência do "paid" da UTMify
};

function fileFor(id: string): string {
  // Sanitiza o id para nome de arquivo seguro (evita path traversal).
  const safe = id.replace(/[^a-zA-Z0-9_-]/g, "");
  return path.join(TX_DIR, `${safe}.json`);
}

export async function saveTxRecord(rec: TxRecord): Promise<void> {
  try {
    await fs.mkdir(TX_DIR, { recursive: true });
    await fs.writeFile(fileFor(rec.id), JSON.stringify(rec, null, 2), "utf8");
  } catch (e) {
    console.error("[tx-store] falha ao salvar registro:", e);
  }
}

export async function readTxRecord(id: string): Promise<TxRecord | null> {
  try {
    return JSON.parse(await fs.readFile(fileFor(id), "utf8")) as TxRecord;
  } catch {
    return null;
  }
}

/** Marca purchaseSent=true. Retorna false se não existe ou já estava marcado. */
export async function markPurchaseSent(id: string): Promise<boolean> {
  const rec = await readTxRecord(id);
  if (!rec || rec.purchaseSent) return false;
  rec.purchaseSent = true;
  await saveTxRecord(rec);
  return true;
}

/** Reverte a marca (quando o envio do CAPI falhou e queremos nova tentativa). */
export async function unmarkPurchaseSent(id: string): Promise<void> {
  const rec = await readTxRecord(id);
  if (!rec || !rec.purchaseSent) return;
  rec.purchaseSent = false;
  await saveTxRecord(rec);
}

/** Marca utmifyPaidSent=true. Retorna false se não existe ou já estava marcado. */
export async function markUtmifyPaidSent(id: string): Promise<boolean> {
  const rec = await readTxRecord(id);
  if (!rec || rec.utmifyPaidSent) return false;
  rec.utmifyPaidSent = true;
  await saveTxRecord(rec);
  return true;
}

/** Reverte a marca do "paid" da UTMify (quando o envio falhou). */
export async function unmarkUtmifyPaidSent(id: string): Promise<void> {
  const rec = await readTxRecord(id);
  if (!rec || !rec.utmifyPaidSent) return;
  rec.utmifyPaidSent = false;
  await saveTxRecord(rec);
}
