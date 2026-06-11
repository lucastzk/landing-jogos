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

echo "==> Reiniciando o app (PM2)"
# Este script roda DESACOPLADO da sessão SSH (o workflow o lança em background),
# então o pm2 pode rodar normal — não há sessão pra ele prender.
pm2 delete landing-jogos >/dev/null 2>&1 || true
pm2 start ecosystem.config.cjs >/dev/null 2>&1 || pm2 restart landing-jogos >/dev/null 2>&1 || true
pm2 save >/dev/null 2>&1 || true

echo "==> Deploy concluído com sucesso ✅"
