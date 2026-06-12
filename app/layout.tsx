import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Sora } from "next/font/google";
import Script from "next/script";
import { getSite } from "@/lib/content";
import Interactions from "@/components/Interactions";
import "./globals.css";

// Fonte de display (títulos) — techy e marcante
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

// Fonte do corpo — geométrica e legível
const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

// Metadata DINÂMICA: lê as edições do painel (data/content.json) mescladas por
// cima dos defaults. Antes usava o `config/site.ts` estático, então o título/OG
// editado no /admin era salvo mas ignorado — a aba mostrava o placeholder.
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSite();
  return {
    metadataBase: new URL(s.meta.url),
    title: s.meta.title,
    description: s.meta.description,
    applicationName: s.meta.siteName,
    keywords: ["produto digital", "acesso imediato", "pagamento único"],
    openGraph: {
      type: "website",
      locale: s.meta.locale,
      url: s.meta.url,
      siteName: s.meta.siteName,
      title: s.meta.title,
      description: s.meta.description,
      images: [{ url: s.meta.ogImage, width: 1200, height: 630, alt: s.meta.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: s.meta.title,
      description: s.meta.description,
      images: [s.meta.ogImage],
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#070707",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${spaceGrotesk.variable} ${sora.variable}`}>
      <head>
        {/* Marca 'js' antes da pintura: evita flash e mantém conteúdo visível sem JS */}
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1904217793605649');
fbq('track', 'PageView');`,
          }}
        />
        {/* End Meta Pixel Code */}
      </head>
      <body className="font-sans antialiased">
        {/* Meta Pixel — noscript fallback */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1904217793605649&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {children}
        <Interactions />
        {/* UTMify — rastreamento de UTMs (repassa para o checkout) */}
        <Script
          src="https://cdn.utmify.com.br/scripts/utms/latest.js"
          data-utmify-prevent-xcod-sck=""
          data-utmify-prevent-subids=""
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
