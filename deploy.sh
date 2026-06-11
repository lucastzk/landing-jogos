#!/usr/bin/env bash
# Atualiza o site no VPS: baixa o código novo, instala, builda e reinicia.
# Uso no VPS:  ./deploy.sh
set -euo pipefail
cd "$(dirname "$0")"

echo "==> Sincronizando com o repositório (fetch + reset)"
git fetch origin main
git reset --hard origin/main

echo "==> Instalando dependências"
npm ci

echo "==> Gerando build de produção"
npm run build

echo "==> Reiniciando o app (PM2, config nova do ecosystem)"
pm2 delete landing-jogos 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save

echo "==> Deploy concluído ✅"
