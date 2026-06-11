/**
 * ============================================================================
 *  ARQUIVO DE CONFIGURAÇÃO DA PÁGINA
 * ============================================================================
 *  Edite TUDO por aqui: textos, preços, imagens, link do checkout, depoimentos.
 *  Você NÃO precisa mexer no código dos componentes.
 *
 *  Este é um TEMPLATE genérico de página de vendas. Troque os textos abaixo
 *  pelo seu produto real. Vídeos e imagens também podem ser trocados pelo
 *  painel em /admin.
 * ============================================================================
 */

export const site = {
  // ----------------------------------------------------------------------
  // 0. CONFIGURAÇÕES GERAIS / SEO
  // ----------------------------------------------------------------------
  meta: {
    siteName: "Seu Produto",
    title: "Seu Produto — escreva aqui a promessa principal",
    description:
      "Descreva em uma frase o que o seu produto entrega e por que vale a pena. Acesso imediato, pagamento único.",
    // URL pública do site (usado em Open Graph). Troque quando publicar.
    url: "https://seu-dominio.com.br",
    // Imagem de compartilhamento (1200x630). Coloque o arquivo em /public.
    ogImage: "/og-image.jpg",
    locale: "pt_BR",
  },

  // Nome da marca (aparece no topo e no rodapé)
  brand: {
    name: "SUA MARCA",
  },

  // ----------------------------------------------------------------------
  // 1. AÇÃO PRINCIPAL (CTA) — uma única ação: COMPRAR
  // ----------------------------------------------------------------------
  cta: {
    // Checkout próprio (página /checkout deste projeto, integrada à AmploPay).
    // Para usar um checkout externo, basta trocar por uma URL https://… completa.
    checkoutUrl: "/checkout",
    // Texto do botão — usado IGUAL em todos os CTAs da página (não varie).
    label: "QUERO AGORA",
    // Frase curta de reforço que aparece embaixo dos botões.
    subtext: "Acesso imediato • Pagamento único • Garantia de 7 dias",
  },

  // Faixa de texto rolando (marquee). Edite as palavras à vontade.
  marqueeWords: [
    "ACESSO IMEDIATO",
    "PAGAMENTO ÚNICO",
    "SEM MENSALIDADE",
    "GARANTIA DE 7 DIAS",
    "SUPORTE DEDICADO",
    "FEITO PRA VOCÊ",
  ],

  // ----------------------------------------------------------------------
  // 2. HERO
  // ----------------------------------------------------------------------
  hero: {
    kicker: "SEU PRODUTO",
    // Promessa principal em LINHAS — cada linha sobe com efeito cinético.
    // Marque uma palavra em vermelho com `headlineAccentLine`.
    headlineLines: ["A SOLUÇÃO", "QUE VOCÊ", "PROCURAVA."],
    // Qual linha (índice, começando em 0) fica em vermelho. Use -1 para nenhuma.
    headlineAccentLine: 2,
    subheadline:
      "Escreva aqui a promessa principal do seu produto: o que ele resolve, pra quem é e por que comprar hoje. Edite este texto em config/site.ts.",
    // Imagem/mockup do produto. Coloque em /public ou suba pelo painel /admin.
    // Enquanto não tiver a sua, fica um mockup gerado por CSS (não precisa de arquivo).
    mockupImage: "", // ex: "/mockup-produto.png"
    mockupAlt: "Imagem do seu produto",
    // Selos de confiança rápidos abaixo do CTA.
    trustBadges: ["Acesso imediato", "Pagamento único", "Garantia de 7 dias", "Suporte"],
  },

  // ----------------------------------------------------------------------
  // 2.5 VÍDEO DE APRESENTAÇÃO (VSL)
  // ----------------------------------------------------------------------
  vsl: {
    kicker: "VEJA POR DENTRO",
    title: "Veja exatamente o que você vai receber",
    subtitle:
      "Grave um vídeo curto apresentando seu produto. Você pode colar a URL do YouTube/Vimeo (ou enviar um arquivo) pelo painel /admin.",
    // 👉 Cole a URL do seu vídeo. Aceita YouTube, Vimeo ou um arquivo .mp4 direto.
    videoUrl: "",
    // Imagem de capa exibida antes do play (recomendado 1280x720).
    poster: "",
    // Selos rápidos exibidos abaixo do vídeo.
    bullets: ["Apresentação rápida", "Mostre o produto por dentro", "Tire as principais dúvidas"],
  },

  // ----------------------------------------------------------------------
  //  PÁGINA VSL (/vsl) — vídeo-porteiro para o anúncio. O botão que leva à
  //  landing só aparece QUANDO O VÍDEO TERMINA. Use um vídeo VERTICAL (.mp4 de
  //  preferência: autoplay mudo, clique para desmutar e libera o botão no fim).
  // ----------------------------------------------------------------------
  vslPage: {
    headline: "", // título opcional acima do vídeo (vazio = nada)
    // 👉 Vídeo VERTICAL. Aceita .mp4 (recomendado) ou YouTube/Vimeo.
    videoUrl: "",
    poster: "", // capa opcional
    ctaLabel: "QUERO APROVEITAR A OFERTA", // botão que aparece no fim
    unmuteHint: "Toque na tela para ativar o som",
    // Só para YouTube/Vimeo (não dá para detectar o fim): libera o botão após X
    // segundos — coloque a duração do vídeo. Com .mp4, deixe 0 (usa o fim real).
    revealAfterSeconds: 0,
  },

  // ----------------------------------------------------------------------
  // 3. DESTAQUES — principais itens/recursos do seu produto
  // ----------------------------------------------------------------------
  highlights: {
    title: "O que está incluído",
    subtitle:
      "Destaque aqui os principais itens, módulos ou recursos do seu produto. Edite nome, categoria, descrição e imagem pelo painel /admin.",
    games: [
      {
        name: "Item 1",
        genre: "Destaque",
        description: "Descreva este item, módulo ou recurso do seu produto.",
        image: "",
      },
      {
        name: "Item 2",
        genre: "Destaque",
        description: "Descreva este item, módulo ou recurso do seu produto.",
        image: "",
      },
      {
        name: "Item 3",
        genre: "Destaque",
        description: "Descreva este item, módulo ou recurso do seu produto.",
        image: "",
      },
      {
        name: "Item 4",
        genre: "Destaque",
        description: "Descreva este item, módulo ou recurso do seu produto.",
        image: "",
      },
      {
        name: "Item 5",
        genre: "Destaque",
        description: "Descreva este item, módulo ou recurso do seu produto.",
        image: "",
      },
      {
        name: "Item 6",
        genre: "Destaque",
        description: "Descreva este item, módulo ou recurso do seu produto.",
        image: "",
      },
    ],
  },

  // ----------------------------------------------------------------------
  // 4. O QUE VOCÊ RECEBE
  // ----------------------------------------------------------------------
  whatYouGet: {
    title: "O que você recebe ao comprar",
    items: [
      {
        icon: "package",
        title: "Seu produto completo",
        text: "Descreva a entrega principal do seu produto — tudo organizado e pronto para usar.",
      },
      {
        icon: "download",
        title: "Acesso imediato",
        text: "Assim que o pagamento é confirmado, você recebe o acesso na hora.",
      },
      {
        icon: "devices",
        title: "Acesse de onde quiser",
        text: "Use no computador ou no celular, quando e onde for melhor pra você.",
      },
      {
        icon: "play",
        title: "Fácil de usar",
        text: "Passo a passo simples incluso. Em poucos minutos você já está usando.",
      },
      {
        icon: "infinity",
        title: "É seu para sempre",
        text: "Pagamento único, sem mensalidade. Comprou, é seu — sem assinatura.",
      },
      {
        icon: "refresh",
        title: "Atualizações inclusas",
        text: "Quando houver novidades, você recebe sem pagar a mais.",
      },
    ],
  },

  // ----------------------------------------------------------------------
  // 5. BENEFÍCIOS / TRANSFORMAÇÃO (emocional)
  // ----------------------------------------------------------------------
  benefits: {
    title: "Por que vale a pena",
    items: [
      {
        emoji: "⏱️",
        title: "Economiza o seu tempo",
        text: "Explique como o seu produto poupa tempo ou esforço de quem compra.",
      },
      {
        emoji: "🎯",
        title: "Resolve o problema certo",
        text: "Mostre, em uma frase, o principal problema que o seu produto resolve.",
      },
      {
        emoji: "💸",
        title: "Vale cada centavo",
        text: "Justifique o valor: o que a pessoa ganha em troca do preço que paga.",
      },
      {
        emoji: "✅",
        title: "Sem complicação",
        text: "Reforce que é simples começar e usar, do início ao fim.",
      },
    ],
  },

  // ----------------------------------------------------------------------
  // 6. PROVA SOCIAL (depoimentos)
  // ⚠️ Use SOMENTE avaliações REAIS de clientes. Publicar depoimento inventado
  //    é propaganda enganosa (CDC). Os itens abaixo são apenas placeholders.
  // ----------------------------------------------------------------------
  testimonials: {
    title: "O que dizem os clientes",
    subtitle: "Substitua pelos depoimentos REAIS dos seus clientes.",
    items: [
      { name: "Cliente 1", stars: 5, text: "Adicione aqui um depoimento real de um cliente." },
      { name: "Cliente 2", stars: 5, text: "Adicione aqui um depoimento real de um cliente." },
      { name: "Cliente 3", stars: 5, text: "Adicione aqui um depoimento real de um cliente." },
      { name: "Cliente 4", stars: 5, text: "Adicione aqui um depoimento real de um cliente." },
      { name: "Cliente 5", stars: 5, text: "Adicione aqui um depoimento real de um cliente." },
      { name: "Cliente 6", stars: 5, text: "Adicione aqui um depoimento real de um cliente." },
    ],
  },

  // ----------------------------------------------------------------------
  // 7. OFERTA E PREÇO
  // ----------------------------------------------------------------------
  offer: {
    title: "A oferta completa",
    subtitle: "Tudo isso por um pagamento único:",
    ribbon: "OFERTA",
    // Preço "cheio" (riscado) só para ancoragem REAL. Deixe "" se não existir.
    fullPrice: "",
    currentPrice: "R$ 29,90",
    installments: "",
    priceCaption: "Pagamento único • sem mensalidade • acesso imediato",
    includes: [
      "Acesso completo ao produto",
      "Acesso imediato após a compra",
      "Use no PC e no celular",
      "Passo a passo de uso",
      "Atualizações futuras inclusas",
      "Garantia incondicional de 7 dias",
    ],
    // Escassez/urgência REAL e OPCIONAL. Não use contador falso.
    scarcityText: "",
    securityText: "Compra 100% segura • pagamento criptografado",
    paymentMethods: ["Pix", "Cartão"],
  },

  // ----------------------------------------------------------------------
  // 8. GARANTIA
  // ----------------------------------------------------------------------
  guarantee: {
    title: "Risco zero: garantia de 7 dias",
    text: "Compre e teste à vontade. Se nos primeiros 7 dias você achar que não valeu a pena, é só pedir o reembolso — devolvemos 100% do seu dinheiro, sem perguntas e sem burocracia.",
    badge: "Garantia incondicional",
    days: 7,
    points: ["100% do dinheiro de volta", "Sem perguntas", "Sem burocracia"],
  },

  // ----------------------------------------------------------------------
  // 9. FAQ
  // ----------------------------------------------------------------------
  faq: {
    title: "Perguntas frequentes",
    items: [
      {
        q: "Como eu recebo depois de comprar?",
        a: "Assim que o pagamento é confirmado, você recebe o acesso imediatamente, por e-mail e/ou na própria plataforma. Sem espera.",
      },
      {
        q: "Funciona no meu PC e no meu celular?",
        a: "Sim. Você consegue acessar do computador e do celular, quando quiser.",
      },
      {
        q: "É seguro? Vou receber mesmo o que comprei?",
        a: "Sim. O pagamento é processado por uma plataforma de checkout segura e você conta com garantia de 7 dias. Se algo não estiver certo, é só pedir reembolso.",
      },
      {
        q: "Preciso pagar mensalidade ou assinatura?",
        a: "Não. É um pagamento único. Você compra uma vez e o acesso é seu.",
      },
      {
        q: "Posso pedir reembolso?",
        a: "Pode. Você tem 7 dias de garantia incondicional. Se não gostar, devolvemos 100% do valor, sem perguntas.",
      },
    ],
  },

  // ----------------------------------------------------------------------
  // 10. CTA FINAL
  // ----------------------------------------------------------------------
  finalCta: {
    title: "Comece ainda hoje",
    text: "Acesso imediato e garantia de 7 dias. O único risco é continuar sem.",
  },

  // ----------------------------------------------------------------------
  // 11. RODAPÉ
  // ----------------------------------------------------------------------
  footer: {
    brand: "Seu Produto",
    description: "Uma frase curta descrevendo a sua marca ou o seu produto.",
    links: [
      { label: "Termos de uso", href: "/termos" },
      { label: "Política de privacidade", href: "/privacidade" },
      { label: "Contato", href: "mailto:seu-email@exemplo.com.br" },
    ],
    // Aviso legal — ajuste conforme a sua realidade jurídica.
    disclaimer:
      "Conteúdo e produto de responsabilidade do próprio vendedor.",
    copyrightName: "Seu Produto",
  },
} as const;

export type SiteConfig = typeof site;
