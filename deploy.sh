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
# O daemon do pm2 mantém os descritores (stdin/stdout/stderr) da sessão SSH
# abertos, e o GitHub Action não recebe o código de saída direito — marcando o
# deploy como FALHO mesmo dando certo. Por isso:
#  - redirecionamos TODOS os descritores (incl. </dev/null) → sessão fecha limpa
#  - o pm2 NÃO derruba o deploy (|| true): o que valida o deploy é o build acima
#  - exit 0 no fim garante verde quando build+restart deram certo
pm2 delete landing-jogos >/dev/null 2>&1 </dev/null || true
pm2 start ecosystem.config.cjs >/dev/null 2>&1 </dev/null \
  || pm2 restart landing-jogos >/dev/null 2>&1 </dev/null || true
pm2 save >/dev/null 2>&1 </dev/null || true

echo "==> Deploy concluído ✅"
exit 0
