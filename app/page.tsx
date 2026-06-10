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
    <main className="pb-20 lg:pb-0">
      <Header />
      {/* 1. HERO */}
      <Hero hero={site.hero} />
      <Marquee />
      {/* 2. VÍDEO (VSL) */}
      <Vsl vsl={site.vsl} />
      {/* 3. DESTAQUES */}
      <Highlights highlights={site.highlights} />
      {/* 4. O QUE VOCÊ RECEBE */}
      <WhatYouGet />
      {/* 5. BENEFÍCIOS */}
      <Benefits />
      {/* 6. PROVA SOCIAL */}
      <Testimonials />
      {/* 7. OFERTA E PREÇO */}
      <Offer />
      {/* 8. GARANTIA */}
      <Guarantee />
      {/* 9. FAQ */}
      <Faq />
      <Marquee />
      {/* 10. CTA FINAL */}
      <FinalCta />
      {/* 11. RODAPÉ */}
      <Footer />

      <StickyMobileCta />
    </main>
  );
}
