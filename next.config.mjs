/** @type {import('next').NextConfig} */

// O CHECKOUT precisa de backend (API routes) para falar com a AmploPay com a
// secret key escondida no servidor. Backend NÃO existe em export estático.
//
//  • Desenvolvimento e produção COM checkout  → rode como app Node (padrão).
//    `npm run dev` / `npm run build && npm start`  (Vercel, Railway, Render...).
//  • Publicar SÓ a landing estática (ex.: Hostinger compartilhada) → ligue o
//    export com `STATIC_EXPORT=true npm run build`. Nesse modo as rotas /api
//    não saem no /out, então o backend do checkout precisa morar num host Node.
const isStaticExport = process.env.STATIC_EXPORT === "true";

// Cabeçalhos de segurança aplicados a todas as páginas/rotas.
const securityHeaders = [
  // Força HTTPS por 1 ano (só vale depois que o site já está em https).
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Impede o site de ser embutido em <iframe> de terceiros (anti-clickjacking).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Impede o navegador de "adivinhar" o tipo do arquivo (anti-MIME-sniffing).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Não vaza a URL completa de origem para sites externos.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Desliga APIs sensíveis do navegador que o site não usa.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
];

const nextConfig = {
  reactStrictMode: true,
  // Esconde o cabeçalho "X-Powered-By: Next.js" (menos informação pro atacante).
  poweredByHeader: false,
  ...(isStaticExport
    ? {
        // Export estático: HTML/CSS/JS puro em /out (sem Node no servidor).
        output: "export",
        // Gera /pagina/index.html — roteamento amigável no Apache/LiteSpeed.
        trailingSlash: true,
      }
    : {
        // headers() só funciona no modo Node (não em export estático).
        async headers() {
          return [{ source: "/:path*", headers: securityHeaders }];
        },
      }),
  images: {
    // Sem servidor de otimização: serve as imagens como estão.
    unoptimized: true,
    // Permite URLs de imagem externas coladas no painel admin.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
