/**
 * Configuração do PM2 — mantém o app Node no ar (reinicia se cair, sobe no boot).
 * Rode a partir da pasta do projeto:  pm2 start ecosystem.config.cjs
 */
module.exports = {
  apps: [
    {
      name: "landing-jogos",
      script: "node_modules/next/dist/bin/next",
      // -H 127.0.0.1: escuta só no localhost; o público chega pelo Nginx (porta
      // 80/443). Impede acessar a porta 3000 direto e forjar X-Real-IP/XFF.
      args: "start -p 3000 -H 127.0.0.1",
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
