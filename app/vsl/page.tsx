import type { Metadata } from "next";
import { getSite } from "@/lib/content";
import VslGate from "@/components/VslGate";

export const metadata: Metadata = {
  title: "Assista antes de continuar",
  // Página de funil (vídeo-porteiro): não indexar.
  robots: { index: false, follow: false },
};

// Lê o vídeo/textos editados no painel admin em runtime.
export const dynamic = "force-dynamic";

export default async function VslPage() {
  const site = await getSite();
  // Depois do vídeo, o botão leva para a landing (mesma aba).
  return <VslGate vslPage={site.vslPage} ctaHref="/" />;
}
