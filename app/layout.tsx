import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Sora } from "next/font/google";
import Script from "next/script";
import { site } from "@/config/site";
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

export const metadata: Metadata = {
  metadataBase: new URL(site.meta.url),
  title: site.meta.title,
  description: site.meta.description,
  applicationName: site.meta.siteName,
  keywords: ["produto digital", "acesso imediato", "pagamento único"],
  openGraph: {
    type: "website",
    locale: site.meta.locale,
    url: site.meta.url,
    siteName: site.meta.siteName,
    title: site.meta.title,
    description: site.meta.description,
    images: [{ url: site.meta.ogImage, width: 1200, height: 630, alt: site.meta.title }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.meta.title,
    description: site.meta.description,
    images: [site.meta.ogImage],
  },
  robots: { index: true, follow: true },
};

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
fbq('init', '2083485272577157');
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
            src="https://www.facebook.com/tr?id=2083485272577157&ev=PageView&noscript=1"
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
