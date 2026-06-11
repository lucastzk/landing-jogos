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

echo "==> Reiniciando o app (PM2, desacoplado da sessão SSH)"
# O daemon do pm2 segura os descritores da sessão SSH abertos, e o GitHub Action
# fica sem conseguir fechar a conexão → marca FALHO mesmo o deploy dando certo.
# Solução: rodar o restart 100% DESACOPLADO (nohup + background + disown), com
# TODOS os descritores redirecionados. Aí a sessão SSH fecha limpa e o Action
# recebe o exit 0. O `sleep` dá tempo do app subir antes da sessão encerrar.
nohup bash -lc '
  pm2 delete landing-jogos >/dev/null 2>&1 || true
  pm2 start ecosystem.config.cjs >/dev/null 2>&1 || pm2 restart landing-jogos >/dev/null 2>&1 || true
  pm2 save >/dev/null 2>&1 || true
' >/dev/null 2>&1 </dev/null &
disown 2>/dev/null || true
sleep 6

echo "==> Deploy concluído ✅"
exit 0
