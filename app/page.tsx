import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Vsl from "@/components/Vsl";
import Highlights from "@/components/Highlights";
import WhatYouGet from "@/components/WhatYouGet";
import Benefits from "@/components/Benefits";
import Testimonials from "@/components/Testimonials";
import Offer from "@/components/Offer";
import Guarantee from "@/components/Guarantee";
import Faq from "@/components/Faq";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import StickyMobileCta from "@/components/StickyMobileCta";
import { getSite } from "@/lib/content";

// Lê as edições do painel admin em runtime (vídeo, imagens).
export const dynamic = "force-dynamic";

export default async function Home() {
  const site = await getSite();
  return (
    <main className="pb-28 lg:pb-0">
      <Header site={site} />
      {/* 1. HERO */}
      <Hero site={site} />
      <Marquee site={site} />
      {/* 2. VÍDEO (VSL) */}
      <Vsl site={site} />
      {/* 3. DESTAQUES */}
      <Highlights site={site} />
      {/* 4. O QUE VOCÊ RECEBE */}
      <WhatYouGet site={site} />
      {/* 5. BENEFÍCIOS */}
      <Benefits site={site} />
      {/* 6. PROVA SOCIAL */}
      <Testimonials site={site} />
      {/* 7. OFERTA E PREÇO */}
      <Offer site={site} />
      {/* 8. GARANTIA */}
      <Guarantee site={site} />
      {/* 9. FAQ */}
      <Faq site={site} />
      <Marquee site={site} />
      {/* 10. CTA FINAL */}
      <FinalCta site={site} />
      {/* 11. RODAPÉ */}
      <Footer site={site} />

      <StickyMobileCta site={site} />
    </main>
  );
}
