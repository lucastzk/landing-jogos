# Deploy na Hostinger VPS

Este site é um **app Node.js** (Next.js). O checkout, o painel `/admin` e os
pagamentos rodam num servidor — e o painel grava arquivos em disco. Por isso
**não** funciona em hospedagem compartilhada/estática: precisa de **VPS**.

A app sobe na **porta 3000**; o **Nginx** recebe o domínio (80/443) e repassa
pra ela. Os dados editáveis ficam em `data/` e os uploads em `public/uploads/`
(ambos no disco do VPS — por isso persistem).

---

## Pré-requisitos
- VPS Hostinger com **Ubuntu** e acesso **SSH** (usuário root ou com sudo).
- Um **domínio** apontando pro IP do VPS (registro A no DNS).
- O código num repositório **GitHub** (ver Passo 1).

---

## Passo 1 — Subir o código pro GitHub
No seu PC, dentro da pasta do projeto (já é um repositório git):

```bash
# crie um repositório vazio em github.com (ex.: landing-jogos) e then:
git remote add origin https://github.com/SEU_USUARIO/landing-jogos.git
git push -u origin main
```

> O `.env` (com as chaves da AmploPay) **não vai** pro GitHub — está no
> `.gitignore`. As chaves você coloca direto no VPS (Passo 3).

---

## Passo 2 — Preparar o VPS (uma vez só)
Conecte no VPS por SSH e instale Node 20, PM2, Nginx e git:

```bash
# Node 20 (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx

# PM2 (mantém o app no ar e sobe no boot)
sudo npm install -g pm2
```

---

## Passo 3 — Clonar, configurar e subir o app

```bash
# escolha onde o site vai morar
sudo mkdir -p /var/www && cd /var/www
sudo git clone https://github.com/SEU_USUARIO/landing-jogos.git
sudo chown -R $USER:$USER /var/www/landing-jogos
cd /var/www/landing-jogos

# crie o .env de produção (veja a seção "Variáveis de ambiente" no fim)
nano .env

# instale, builde e inicie
npm ci
npm run build
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup    # rode o comando que ele imprimir, pra subir no boot
```

O app agora roda em `http://IP_DO_VPS:3000`.

---

## Passo 4 — Nginx + HTTPS (domínio → app)
Crie o site no Nginx:

```bash
sudo nano /etc/nginx/sites-available/landing-jogos
```

Cole (troque `seu-dominio.com.br`):

```nginx
server {
    listen 80;
    server_name seu-dominio.com.br www.seu-dominio.com.br;

    client_max_body_size 64M;   # uploads do painel

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ative e adicione HTTPS grátis (Let's Encrypt):

```bash
sudo ln -s /etc/nginx/sites-available/landing-jogos /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com.br -d www.seu-dominio.com.br
```

Pronto: `https://seu-dominio.com.br` já serve o site.

---

## Passo 5 — Atualizar o site ("mudou aqui → muda lá")

**Manual (simples):** sempre que houver alteração nova no GitHub, no VPS rode:

```bash
cd /var/www/landing-jogos && ./deploy.sh
```

(o `deploy.sh` faz `git pull` + `npm ci` + `build` + reinicia o app)

**Automático (recomendado):** o arquivo `.github/workflows/deploy.yml` já faz
deploy sozinho a cada `git push` na `main`. Pra ativar, no GitHub do projeto vá
em **Settings → Secrets and variables → Actions** e crie:

| Secret | Valor |
|---|---|
| `VPS_HOST` | IP do VPS |
| `VPS_USER` | usuário SSH (ex.: `root`) |
| `VPS_SSH_KEY` | a chave **privada** SSH (conteúdo do arquivo) |
| `VPS_PORT` | `22` |
| `VPS_PATH` | `/var/www/landing-jogos` |

A partir daí: a gente altera aqui → `git push` → o site atualiza sozinho. ✅

---

## Variáveis de ambiente (`.env` no VPS)
```ini
# AmploPay (Integrações → API)
AMPLOPAY_PUBLIC_KEY=sua_chave_publica
AMPLOPAY_SECRET_KEY=sua_chave_secreta
AMPLOPAY_API_BASE=https://app.amplopay.com/api/v1

# URL pública do site (usada no webhook de pagamento)
NEXT_PUBLIC_SITE_URL=https://seu-dominio.com.br

# Senha do painel /admin — use uma senha FORTE
ADMIN_PASSWORD=troque_por_uma_senha_forte
```

Depois de editar o `.env`, reinicie: `pm2 restart landing-jogos`.

> No painel da AmploPay, configure o **webhook/postback** para:
> `https://seu-dominio.com.br/api/webhook/amplopay`
