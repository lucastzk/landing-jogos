/**
 * Configuração do PM2 — mantém o app Node no ar (reinicia se cair, sobe no boot).
 * Rode a partir da pasta do projeto:  pm2 start ecosystem.config.cjs
 */
module.exports = {
  apps: [
    {
      name: "landing-jogos",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
