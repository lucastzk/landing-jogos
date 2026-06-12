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

  // Fallback: se a "Página VSL" não tiver vídeo/poster próprios, usa os da seção
  // VSL da landing. Evita que a /vsl fique VAZIA quando o cliente preenche só um
  // dos dois campos de vídeo do painel (confusão comum). O campo próprio, quando
  // preenchido, tem prioridade — então dá pra usar um vídeo vertical só aqui.
  const vslPage = {
    ...site.vslPage,
    videoUrl: site.vslPage.videoUrl || site.vsl.videoUrl,
    poster: site.vslPage.poster || site.vsl.poster,
  };

  // Depois do vídeo, o botão leva para a landing (mesma aba).
  return <VslGate vslPage={vslPage} ctaHref="/" />;
}
