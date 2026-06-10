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

const nextConfig = {
  reactStrictMode: true,
  ...(isStaticExport
    ? {
        // Export estático: HTML/CSS/JS puro em /out (sem Node no servidor).
        output: "export",
        // Gera /pagina/index.html — roteamento amigável no Apache/LiteSpeed.
        trailingSlash: true,
      }
    : {}),
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
