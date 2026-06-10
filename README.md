# Landing Page — Pack 500+ Jogos

Landing page de vendas (single page) em **Next.js 14 + TypeScript + Tailwind CSS**, mobile-first e otimizada para conversão.

## Como rodar

```bash
npm install
npm run dev
```

Abra **http://localhost:3000**.

Para gerar a versão de produção:

```bash
npm run build
npm start
```

## 💳 Checkout próprio (AmploPay)

O projeto tem um **checkout transparente** em `/checkout`, integrado à API da
AmploPay (PIX + cartão), no mesmo visual da landing. O cliente paga sem sair do
site; o PIX gera QR + copia-e-cola e a tela detecta o pagamento sozinha.

### 1. Configure as credenciais (lado servidor)

```bash
cp .env.example .env
```

Preencha no `.env` (gere chaves novas no painel da AmploPay → **Integrações → API**):

| Variável | O que é |
|---|---|
| `AMPLOPAY_PUBLIC_KEY`  | Client ID da AmploPay (sua chave pública) |
| `AMPLOPAY_SECRET_KEY`  | Client Secret (sua chave secreta — **nunca** vai pro front) |
| `AMPLOPAY_API_BASE`    | Opcional. Padrão: `https://api.amplopay.com` |
| `AMPLOPAY_WEBHOOK_SECRET` | Opcional. Token pra validar o postback |
| `NEXT_PUBLIC_SITE_URL` | URL pública do site (monta a URL do webhook) |

A autenticação é `Basic base64(PUBLIC_KEY:SECRET_KEY)` — já implementada.

### 2. Configure o produto

Tudo que aparece no checkout fica em **`config/checkout.ts`**: produto, preço
(em **centavos**: R$ 29,90 → `2990`), order bump, métodos e textos.

### 3. Webhook (confirmação de pagamento)

No painel da AmploPay, aponte o postback para:

```
https://SEU-DOMINIO/api/webhook/amplopay
```

O handler **re-consulta** o status real na AmploPay (`GET /v1/transactions/{id}`)
em vez de confiar no corpo. É em `app/api/webhook/amplopay/route.ts` que você
liga a entrega do produto (e-mail/acesso) quando `status === "paid"`.

### ⚠️ Importante

- **Backend obrigatório:** o checkout precisa de Node (Vercel, Railway, Render…).
  Em export estático (`STATIC_EXPORT=true`) as rotas `/api` **não** saem — nesse
  caso, hospede só a landing estática e rode o backend do checkout à parte.
- **Sem sandbox público:** a AmploPay testa contra produção com chaves reais.
  Teste com um valor baixo (ex.: R$ 1,00) e um PIX real.
- **Pontos a confirmar com chave real:** os nomes dos campos da *resposta* do PIX
  (`pix.qrcode`/`pix.qrcodeBase64`) e o formato do postback são inferidos — estão
  marcados com `[VERIFICAR]`/comentários em `lib/amplopay.ts`. O *request* (auth,
  endpoint, corpo) foi verificado ao vivo.

## ✏️ Onde editar (você só mexe em 1 arquivo)

Todo o conteúdo — textos, preços, imagens, depoimentos e o **link do checkout** — fica em:

> **`config/site.ts`**

### O mais importante para vender

1. **Link do checkout** → `config/site.ts` → `cta.checkoutUrl`
   Cole o link do seu Mercado Pago / Hotmart / Kiwify / link de pagamento.
2. **Preços** → `offer.fullPrice` e `offer.currentPrice`.
3. **Destaques** → `highlights.games` (4 a 6 jogos campeões, com imagem).
4. **Depoimentos** → `testimonials.items` — ⚠️ use avaliações **reais**, não invente.

## 🖼️ Imagens

Coloque seus arquivos na pasta `public/` e referencie no `config/site.ts`. Exemplos:

- Mockup do pack no Hero → `hero.mockupImage: "/mockup-pack.png"`
- Print/gif de cada jogo → `highlights.games[].image: "/jogos/jogo-1.gif"`
- Imagem de compartilhamento (Open Graph, 1200x630) → `public/og-image.jpg`

Enquanto você não tiver as imagens, a página mostra placeholders gerados por CSS (sem quebrar).

## 🎨 Cores

Editáveis em `tailwind.config.ts`:

- `ink` → tons de fundo (dark mode base)
- `brand` → cor de marca (roxo)
- `cta` → **cor exclusiva dos botões de compra** (verde, alto contraste)

## Estrutura

```
app/            → layout, página principal e páginas legais
components/      → cada seção da landing é um componente
config/site.ts  → TODO o conteúdo editável
```
