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
# Redireciona a saída do pm2 pra /dev/null: senão o daemon do pm2 mantém os
# descritores (stdout/stderr) da sessão SSH abertos, e o GitHub Action não
# recebe o código de saída direito — marcando o deploy como FALHO mesmo dando
# certo. Com o redirecionamento, a sessão fecha limpa.
pm2 delete landing-jogos >/dev/null 2>&1 || true
pm2 start ecosystem.config.cjs >/dev/null 2>&1
pm2 save >/dev/null 2>&1

echo "==> Deploy concluído ✅"
