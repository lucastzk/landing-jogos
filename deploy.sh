#!/usr/bin/env bash
# Atualiza o site no VPS: baixa o código novo, instala, builda e reinicia.
# Uso no VPS:  ./deploy.sh
set -euo pipefail
cd "$(dirname "$0")"

echo "==> Baixando alterações (git pull)"
git pull origin main

echo "==> Instalando dependências"
npm ci

echo "==> Gerando build de produção"
npm run build

echo "==> Reiniciando o app (PM2, relendo o ecosystem)"
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save

echo "==> Deploy concluído ✅"
