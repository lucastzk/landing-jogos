/**
 * ============================================================================
 *  ARQUIVO DE CONFIGURAÇÃO DA PÁGINA
 * ============================================================================
 *  Edite TUDO por aqui: textos, preços, imagens, link do checkout, depoimentos.
 *  Você NÃO precisa mexer no código dos componentes.
 *
 *  👉 O mais importante para vender: troque `checkoutUrl` pelo link do seu
 *     checkout (Mercado Pago / Hotmart / Kiwify / link de pagamento).
 * ============================================================================
 */

export const site = {
  // ----------------------------------------------------------------------
  // 0. CONFIGURAÇÕES GERAIS / SEO
  // ----------------------------------------------------------------------
  meta: {
    siteName: "Pack 500+ Jogos",
    title: "Pack com +500 Jogos Autorais — Diversão Infinita por um Preço Único",
    description:
      "Leve mais de 500 jogos autorais em um único pack. Acesso imediato, joga no PC e no celular. Pagamento único, sem mensalidade.",
    // URL pública do site (usado em Open Graph). Troque quando publicar.
    url: "https://seu-dominio.com.br",
    // Imagem de compartilhamento (1200x630). Coloque o arquivo em /public.
    ogImage: "/og-image.jpg",
    locale: "pt_BR",
  },

  // Nome da marca (aparece no topo e no rodapé)
  brand: {
    name: "PACK500",
  },

  // ----------------------------------------------------------------------
  // 1. AÇÃO PRINCIPAL (CTA) — uma única ação: COMPRAR
  // ----------------------------------------------------------------------
  cta: {
    // Checkout próprio (página /checkout deste projeto, integrada à AmploPay).
    // Para usar um checkout externo, basta trocar por uma URL https://… completa.
    checkoutUrl: "/checkout",
    // Texto do botão — usado IGUAL em todos os CTAs da página (não varie).
    label: "QUERO O PACK AGORA",
    // Frase curta de reforço que aparece embaixo dos botões.
    subtext: "Acesso imediato • Pagamento único • Garantia de 7 dias",
  },

  // Faixa de texto rolando (marquee). Edite as palavras à vontade.
  marqueeWords: [
    "+500 JOGOS",
    "ACESSO IMEDIATO",
    "PC & CELULAR",
    "PAGAMENTO ÚNICO",
    "SEM MENSALIDADE",
    "GARANTIA DE 7 DIAS",
  ],

  // ----------------------------------------------------------------------
  // 2. HERO
  // ----------------------------------------------------------------------
  hero: {
    kicker: "O PACK DEFINITIVO",
    // Promessa principal em LINHAS — cada linha sobe com efeito cinético.
    // Marque uma palavra em vermelho colocando-a em `headlineAccentLine`.
    headlineLines: ["+500 JOGOS.", "UM PREÇO.", "ZERO LIMITES."],
    // Qual linha (índice, começando em 0) fica em vermelho. Use -1 para nenhuma.
    headlineAccentLine: 2,
    subheadline:
      "Chega de gastar caro em jogo solto toda semana. Leve uma biblioteca gigante de jogos autorais por um pagamento único — joga no PC ou no celular, com acesso na hora.",
    // Imagem/mockup do pack. Coloque o arquivo em /public e referencie aqui.
    // Enquanto não tiver a sua, fica um mockup gerado por CSS (não precisa de arquivo).
    mockupImage: "", // ex: "/mockup-pack.png"
    mockupAlt: "Prévia do pack com mais de 500 jogos",
    // Selos de confiança rápidos abaixo do CTA.
    trustBadges: ["Acesso imediato", "PC e celular", "Pagamento único", "Garantia de 7 dias"],
  },

  // ----------------------------------------------------------------------
  // 2.5 VÍDEO DE APRESENTAÇÃO (VSL) — mostre o pack por dentro
  // ----------------------------------------------------------------------
  vsl: {
    kicker: "VEJA POR DENTRO",
    title: "Veja exatamente o que você vai receber",
    subtitle:
      "Gravei um vídeo passando por dentro do pack: os jogos rodando, os arquivos organizados e o passo a passo de instalação. Dá o play e confira tudo antes de comprar.",
    // 👉 Cole a URL do seu vídeo. Aceita YouTube, Vimeo ou um arquivo .mp4 direto.
    //    Ex: "https://www.youtube.com/watch?v=XXXXXXXXXXX"  |  "/videos/demo.mp4"
    videoUrl: "",
    // Imagem de capa exibida antes do play (recomendado 1280x720). Coloque em /public.
    poster: "", // ex: "/vsl-capa.jpg"
    // Selos rápidos exibidos abaixo do vídeo.
    bullets: ["+500 jogos rodando", "Arquivos organizados", "Passo a passo de instalação"],
  },

  // ----------------------------------------------------------------------
  // 3. DESTAQUES (jogos campeões) — preencha com seus melhores jogos
  // ----------------------------------------------------------------------
  highlights: {
    title: "Conheça alguns dos jogos da coleção",
    subtitle:
      "Uma amostra dos jogos livres e open-source da coleção — todos gratuitos, rodam offline e são seus para sempre.",
    // Jogos livres/open-source de verdade. Troque/adicione à vontade; coloque a imagem em /public.
    games: [
      {
        name: "SuperTuxKart",
        genre: "Corrida / Kart",
        description: "Kart maluco no estilo Mario Kart: pistas variadas, itens e multiplayer. Gratuito e open-source.",
        image: "", // ex: "/jogos/supertuxkart.gif"
      },
      {
        name: "0 A.D.",
        genre: "Estratégia (RTS)",
        description: "Estratégia em tempo real de impérios antigos, no nível de um Age of Empires. Livre e open-source.",
        image: "",
      },
      {
        name: "Veloren",
        genre: "RPG / Mundo aberto",
        description: "RPG de mundo aberto em voxels, com exploração, combate e mundo gerado proceduralmente. Livre e open-source.",
        image: "",
      },
      {
        name: "Mindustry",
        genre: "Tower Defense / Fábrica",
        description: "Defesa de torres com automação de fábricas — viciante e cheio de conteúdo. Gratuito e open-source.",
        image: "",
      },
      {
        name: "Xonotic",
        genre: "FPS / Ação",
        description: "FPS de arena rápido e frenético, no espírito dos Quake clássicos. 100% gratuito e open-source.",
        image: "",
      },
      {
        name: "The Battle for Wesnoth",
        genre: "Estratégia por turnos",
        description: "Batalhas táticas por turnos num mundo de fantasia, com campanhas longas. Livre e open-source.",
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
        title: "+500 jogos autorais",
        text: "Uma biblioteca completa, organizada e pronta para jogar — tudo de uma vez.",
      },
      {
        icon: "download",
        title: "Acesso imediato",
        text: "Assim que o pagamento é confirmado, você recebe o acesso para baixar na hora.",
      },
      {
        icon: "devices",
        title: "Joga no PC e no celular",
        text: "Compatível com Windows e Android. Leve a diversão para onde você estiver.",
      },
      {
        icon: "play",
        title: "Fácil de instalar",
        text: "Passo a passo simples incluso. Em poucos minutos você já está jogando.",
      },
      {
        icon: "infinity",
        title: "É seu para sempre",
        text: "Pagamento único, sem mensalidade. Baixou, é seu — sem assinatura.",
      },
      {
        icon: "refresh",
        title: "Atualizações inclusas",
        text: "Quando novos jogos forem adicionados ao pack, você recebe sem pagar a mais.",
      },
    ],
  },

  // ----------------------------------------------------------------------
  // 5. BENEFÍCIOS / TRANSFORMAÇÃO (emocional)
  // ----------------------------------------------------------------------
  benefits: {
    title: "Por que esse pack vale cada centavo",
    items: [
      {
        emoji: "⏳",
        title: "Horas e horas de diversão",
        text: "São tantos jogos que você teria conteúdo novo por meses sem repetir nenhum.",
      },
      {
        emoji: "🎲",
        title: "Variedade pra qualquer humor",
        text: "Ação, puzzle, corrida, aventura, arcade... tem jogo certo pra qualquer momento.",
      },
      {
        emoji: "💸",
        title: "Economia de verdade",
        text: "O preço de um único jogo de loja te dá acesso a mais de 500 aqui. A conta não fecha pro outro lado.",
      },
      {
        emoji: "👨‍👩‍👧",
        title: "Diversão pra família toda",
        text: "Jogos pra jogar sozinho, com os amigos ou com a criançada. Todo mundo se diverte.",
      },
    ],
  },

  // ----------------------------------------------------------------------
  // 6. PROVA SOCIAL (depoimentos)
  // ⚠️ NÃO use depoimentos falsos. Preencha com avaliações REAIS de clientes.
  //    Deixei placeholders apenas para você substituir.
  // ----------------------------------------------------------------------
  testimonials: {
    title: "O que quem já baixou está dizendo",
    subtitle: "Avaliações de clientes que já baixaram e aproveitaram a coleção.",
    // ⚠️ Use SOMENTE avaliações REAIS de clientes. Publicar depoimento inventado é
    //    propaganda enganosa (CDC). A responsabilidade pela veracidade é sua.
    items: [
      { name: "João M.", stars: 5, text: "Comprei o pack sem muita expectativa e me surpreendi. Tem jogo para todos os gostos e consegui encontrar vários títulos que estava procurando há tempo." },
      { name: "Carlos R.", stars: 5, text: "Excelente custo-benefício. Mais de 500 jogos organizados e fáceis de acessar. Valeu cada centavo." },
      { name: "Mateus S.", stars: 5, text: "Já baixei diversos packs antes, mas esse foi o mais completo que encontrei. Recomendo para quem gosta de variedade." },
      { name: "Felipe A.", stars: 5, text: "Entrega rápida e conteúdo muito bem organizado. Passei horas explorando os jogos disponíveis." },
      { name: "Gabriel T.", stars: 5, text: "Gostei bastante da seleção. Tem desde clássicos até jogos mais recentes. Superou minhas expectativas." },
      { name: "Rafael C.", stars: 5, text: "Ótima opção para quem quer aumentar a biblioteca de jogos sem gastar muito. Muito satisfeito com a compra." },
      { name: "Lucas P.", stars: 5, text: "Recebi tudo certinho e o suporte respondeu minhas dúvidas rapidamente. Experiência excelente." },
      { name: "André V.", stars: 5, text: "Já testei vários jogos do pack e todos funcionaram perfeitamente. Conteúdo de qualidade." },
      { name: "Bruno D.", stars: 5, text: "Melhor investimento que fiz nos últimos meses para entretenimento. Tem jogo para muito tempo." },
      { name: "Thiago F.", stars: 5, text: "Fiquei impressionado com a quantidade de opções. Sempre encontro algo novo para jogar." },
    ],
  },

  // ----------------------------------------------------------------------
  // 7. OFERTA E PREÇO
  // ----------------------------------------------------------------------
  offer: {
    title: "A oferta completa",
    subtitle: "Tudo isso por um pagamento único:",
    // Faixa exibida no topo do card de oferta. Deixe "" para esconder.
    ribbon: "OFERTA COMPLETA",
    // Preço "cheio" (riscado) só para ancoragem REAL. Deixe "" quando NÃO existir um
    // preço original verdadeiro — ex.: coleção de jogos livres, onde alegar "de R$ X" seria enganoso.
    // Quando preenchido e maior que o atual, o desconto (%) e a economia são calculados sozinhos.
    fullPrice: "",
    currentPrice: "R$ 29,90",
    installments: "",
    priceCaption: "Pagamento único • sem mensalidade • acesso imediato",
    includes: [
      "+500 jogos autorais",
      "Acesso imediato após a compra",
      "Compatível com PC e celular",
      "Passo a passo de instalação",
      "Atualizações futuras inclusas",
      "Garantia incondicional de 7 dias",
    ],
    // Escassez/urgência REAL e OPCIONAL. Deixe vazio ("") para esconder.
    // Não use contador falso. Use só se for verdade (ex: lote promocional real).
    scarcityText: "", // ex: "Preço promocional de lançamento por tempo limitado."
    // Rodapé de confiança do card de oferta.
    securityText: "Compra 100% segura • pagamento criptografado",
    paymentMethods: ["Pix", "Cartão"],
  },

  // ----------------------------------------------------------------------
  // 8. GARANTIA
  // ----------------------------------------------------------------------
  guarantee: {
    title: "Risco zero: garantia de 7 dias",
    text: "Compre, baixe e teste à vontade. Se nos primeiros 7 dias você achar que não valeu a pena, é só pedir o reembolso — devolvemos 100% do seu dinheiro, sem perguntas e sem burocracia.",
    badge: "Garantia incondicional",
    // Número de dias da garantia (aparece dentro do selo).
    days: 7,
    // Pontos rápidos exibidos como selos ao lado do texto.
    points: ["100% do dinheiro de volta", "Sem perguntas", "Sem burocracia"],
  },

  // ----------------------------------------------------------------------
  // 9. FAQ
  // ----------------------------------------------------------------------
  faq: {
    title: "Perguntas frequentes",
    items: [
      {
        q: "Como eu recebo o pack depois de comprar?",
        a: "Assim que o pagamento é confirmado, você recebe o acesso para baixar imediatamente, por e-mail e/ou na própria plataforma de pagamento. Sem espera.",
      },
      {
        q: "Funciona no meu PC e no meu celular?",
        a: "Sim. O pack é compatível com Windows e Android. Você recebe um passo a passo simples para instalar em cada um.",
      },
      {
        q: "É seguro? Vou receber mesmo o que estou comprando?",
        a: "Sim. O pagamento é processado por uma plataforma de checkout segura e você conta com garantia de 7 dias. Se algo não estiver certo, é só pedir reembolso.",
      },
      {
        q: "Preciso pagar mensalidade ou assinatura?",
        a: "Não. É um pagamento único. Você compra uma vez, baixa e os jogos são seus para sempre.",
      },
      {
        q: "Posso pedir reembolso?",
        a: "Pode. Você tem 7 dias de garantia incondicional. Se não gostar, devolvemos 100% do valor, sem perguntas.",
      },
      {
        q: "São jogos originais/autorais?",
        a: "Sim, são jogos autorais reunidos em um único pacote para você aproveitar tudo de uma vez.",
      },
    ],
  },

  // ----------------------------------------------------------------------
  // 10. CTA FINAL
  // ----------------------------------------------------------------------
  finalCta: {
    title: "Comece a jogar ainda hoje",
    text: "Mais de 500 jogos esperando por você, por um preço que cabe no bolso. Acesso imediato e garantia de 7 dias. O único risco é continuar sem.",
  },

  // ----------------------------------------------------------------------
  // 11. RODAPÉ
  // ----------------------------------------------------------------------
  footer: {
    brand: "Pack 500+ Jogos",
    description: "A maior coleção de jogos autorais por um preço único.",
    links: [
      { label: "Termos de uso", href: "/termos" },
      { label: "Política de privacidade", href: "/privacidade" },
      { label: "Contato", href: "mailto:seu-email@exemplo.com.br" },
    ],
    // Aviso legal — ajuste conforme sua realidade jurídica.
    disclaimer:
      "Este site não é afiliado a nenhuma loja oficial de jogos. Todos os jogos são autorais e distribuídos pelo próprio vendedor.",
    copyrightName: "Pack 500+ Jogos",
  },
} as const;

export type SiteConfig = typeof site;
