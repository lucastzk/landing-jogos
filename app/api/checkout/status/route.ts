import { NextResponse } from "next/server";
import { getTransactionStatus, AmploPayError } from "@/lib/amplopay";
import { firePurchaseOnce } from "@/lib/purchase";
import type { StatusResponse } from "@/lib/checkout-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Consulta o status de uma transação na AmploPay (usado pelo polling do PIX). */
export async function GET(req: Request): Promise<NextResponse<StatusResponse>> {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json<StatusResponse>({ ok: false, error: "id ausente" }, { status: 400 });
  }

  try {
    const status = await getTransactionStatus(id);
    // Pago detectado pelo polling (aba aberta): dispara o Purchase server-side.
    // Idempotente com o webhook — só um dos caminhos envia de fato.
    if (status === "paid") await firePurchaseOnce(id);
    return NextResponse.json<StatusResponse>({ ok: true, status });
  } catch (err) {
    if (err instanceof AmploPayError) {
      console.error("[status] AmploPay error:", err.message, err.details);
    } else {
      console.error("[status] erro inesperado:", err);
    }
    // Em erro transitório, devolvemos "pending" para o front continuar tentando.
    return NextResponse.json<StatusResponse>({ ok: true, status: "pending" });
  }
}
