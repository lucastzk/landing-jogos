"use client";

import type { EditableContent } from "@/lib/content-types";
import { Txt, Area, StrList, AdminCard, ItemList, inputCls } from "./fields";
import MediaField from "./MediaField";

type Props = {
  value: EditableContent;
  onChange: (v: EditableContent) => void;
};

export default function LandingEditor({ value, onChange }: Props) {
  // Atualiza uma seção-objeto (mescla parcial).
  function sec<K extends keyof EditableContent>(key: K, patch: Partial<EditableContent[K]>) {
    onChange({ ...value, [key]: { ...(value[key] as object), ...patch } });
  }

  return (
    <div className="grid gap-4">
      {/* GERAL / SEO */}
      <AdminCard title="Geral & SEO">
        <Txt label="Nome do site" value={value.meta.siteName} onChange={(v) => sec("meta", { siteName: v })} />
        <Txt label="Título (aba do navegador / Google)" value={value.meta.title} onChange={(v) => sec("meta", { title: v })} />
        <Area label="Descrição (SEO)" value={value.meta.description} onChange={(v) => sec("meta", { description: v })} rows={2} />
        <Txt label="Nome da marca (topo/rodapé)" value={value.brand.name} onChange={(v) => sec("brand", { name: v })} />
      </AdminCard>

      {/* BOTÃO DE COMPRA */}
      <AdminCard title="Botão de compra (CTA)">
        <Txt label="Texto do botão" value={value.cta.label} onChange={(v) => sec("cta", { label: v })} />
        <Txt label="Frase abaixo do botão" value={value.cta.subtext} onChange={(v) => sec("cta", { subtext: v })} />
      </AdminCard>

      {/* FAIXA ROLANTE */}
      <AdminCard title="Faixa rolante (marquee)">
        <StrList label="Palavras/frases que ficam passando" values={value.marqueeWords} onChange={(v) => onChange({ ...value, marqueeWords: v })} />
      </AdminCard>

      {/* HERO */}
      <AdminCard title="Topo da página (Hero)">
        <Txt label="Selo (kicker)" value={value.hero.kicker} onChange={(v) => sec("hero", { kicker: v })} />
        <StrList label="Título principal (uma linha por campo)" values={value.hero.headlineLines} onChange={(v) => sec("hero", { headlineLines: v })} />
        <Area label="Subtítulo" value={value.hero.subheadline} onChange={(v) => sec("hero", { subheadline: v })} />
        <StrList label="Selos de confiança" values={value.hero.trustBadges} onChange={(v) => sec("hero", { trustBadges: v })} />
        <MediaField label="Imagem do topo" value={value.hero.mockupImage} onChange={(url) => sec("hero", { mockupImage: url })} />
      </AdminCard>

      {/* VÍDEO */}
      <AdminCard title="Vídeo de apresentação (VSL)">
        <Txt label="Selo (kicker)" value={value.vsl.kicker} onChange={(v) => sec("vsl", { kicker: v })} />
        <Txt label="Título" value={value.vsl.title} onChange={(v) => sec("vsl", { title: v })} />
        <Area label="Subtítulo" value={value.vsl.subtitle} onChange={(v) => sec("vsl", { subtitle: v })} rows={2} />
        <MediaField
          label="Vídeo (URL do YouTube/Vimeo ou arquivo)"
          value={value.vsl.videoUrl}
          onChange={(url) => sec("vsl", { videoUrl: url })}
          kind="any"
          accept="video/mp4,video/webm"
          hint="Aceita YouTube, Vimeo ou .mp4."
        />
        <MediaField label="Capa do vídeo (poster)" value={value.vsl.poster} onChange={(url) => sec("vsl", { poster: url })} />
        <StrList label="Selos abaixo do vídeo" values={value.vsl.bullets} onChange={(v) => sec("vsl", { bullets: v })} />
      </AdminCard>

      {/* DESTAQUES */}
      <AdminCard title="Destaques">
        <Txt label="Título da seção" value={value.highlights.title} onChange={(v) => sec("highlights", { title: v })} />
        <Area label="Subtítulo" value={value.highlights.subtitle} onChange={(v) => sec("highlights", { subtitle: v })} rows={2} />
        <ItemList
          items={value.highlights.games}
          onChange={(items) => sec("highlights", { games: items })}
          empty={() => ({ name: "", genre: "", description: "", image: "" })}
          addLabel="+ Adicionar destaque"
          render={(g, set) => (
            <>
              <Txt label="Nome" value={g.name} onChange={(v) => set({ name: v })} />
              <Txt label="Categoria" value={g.genre} onChange={(v) => set({ genre: v })} />
              <Area label="Descrição" value={g.description} onChange={(v) => set({ description: v })} rows={2} />
              <MediaField label="Imagem" value={g.image} onChange={(url) => set({ image: url })} />
            </>
          )}
        />
      </AdminCard>

      {/* O QUE VOCÊ RECEBE */}
      <AdminCard title="O que você recebe">
        <Txt label="Título da seção" value={value.whatYouGet.title} onChange={(v) => sec("whatYouGet", { title: v })} />
        <ItemList
          items={value.whatYouGet.items}
          onChange={(items) => sec("whatYouGet", { items })}
          empty={() => ({ icon: "package", title: "", text: "" })}
          render={(i, set) => (
            <>
              <Txt label="Título" value={i.title} onChange={(v) => set({ title: v })} />
              <Area label="Texto" value={i.text} onChange={(v) => set({ text: v })} rows={2} />
            </>
          )}
        />
      </AdminCard>

      {/* BENEFÍCIOS */}
      <AdminCard title="Benefícios">
        <Txt label="Título da seção" value={value.benefits.title} onChange={(v) => sec("benefits", { title: v })} />
        <ItemList
          items={value.benefits.items}
          onChange={(items) => sec("benefits", { items })}
          empty={() => ({ emoji: "✅", title: "", text: "" })}
          render={(i, set) => (
            <>
              <Txt label="Emoji" value={i.emoji} onChange={(v) => set({ emoji: v })} />
              <Txt label="Título" value={i.title} onChange={(v) => set({ title: v })} />
              <Area label="Texto" value={i.text} onChange={(v) => set({ text: v })} rows={2} />
            </>
          )}
        />
      </AdminCard>

      {/* DEPOIMENTOS */}
      <AdminCard title="Depoimentos (use reais!)">
        <Txt label="Título da seção" value={value.testimonials.title} onChange={(v) => sec("testimonials", { title: v })} />
        <Area label="Subtítulo" value={value.testimonials.subtitle} onChange={(v) => sec("testimonials", { subtitle: v })} rows={2} />
        <ItemList
          items={value.testimonials.items}
          onChange={(items) => sec("testimonials", { items })}
          empty={() => ({ name: "", stars: 5, text: "" })}
          addLabel="+ Adicionar depoimento"
          render={(t, set) => (
            <>
              <Txt label="Nome" value={t.name} onChange={(v) => set({ name: v })} />
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-bone/50">Estrelas (1 a 5)</span>
                <input
                  type="number"
                  min={1}
                  max={5}
                  className={inputCls}
                  value={t.stars}
                  onChange={(e) => set({ stars: Number(e.target.value) })}
                />
              </label>
              <Area label="Depoimento" value={t.text} onChange={(v) => set({ text: v })} rows={2} />
            </>
          )}
        />
      </AdminCard>

      {/* OFERTA */}
      <AdminCard title="Oferta & preço (exibição)">
        <Txt label="Título da seção" value={value.offer.title} onChange={(v) => sec("offer", { title: v })} />
        <Txt label="Subtítulo" value={value.offer.subtitle} onChange={(v) => sec("offer", { subtitle: v })} />
        <Txt label="Faixa (ribbon)" value={value.offer.ribbon} onChange={(v) => sec("offer", { ribbon: v })} />
        <div className="grid grid-cols-2 gap-3">
          <Txt label="Preço cheio (riscado, opcional)" value={value.offer.fullPrice} onChange={(v) => sec("offer", { fullPrice: v })} />
          <Txt label="Preço atual" value={value.offer.currentPrice} onChange={(v) => sec("offer", { currentPrice: v })} />
        </div>
        <Txt label="Legenda do preço" value={value.offer.priceCaption} onChange={(v) => sec("offer", { priceCaption: v })} />
        <StrList label="O que está incluso" values={value.offer.includes} onChange={(v) => sec("offer", { includes: v })} />
        <Txt label="Texto de escassez (opcional)" value={value.offer.scarcityText} onChange={(v) => sec("offer", { scarcityText: v })} />
        <Txt label="Texto de segurança" value={value.offer.securityText} onChange={(v) => sec("offer", { securityText: v })} />
        <p className="text-xs text-bone/35">
          ⚠️ O preço REAL cobrado no checkout é o da aba “Checkout”. Este aqui é só o que aparece na landing.
        </p>
      </AdminCard>

      {/* GARANTIA */}
      <AdminCard title="Garantia">
        <Txt label="Título" value={value.guarantee.title} onChange={(v) => sec("guarantee", { title: v })} />
        <Area label="Texto" value={value.guarantee.text} onChange={(v) => sec("guarantee", { text: v })} rows={2} />
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-bone/50">Dias de garantia</span>
          <input
            type="number"
            min={0}
            className={inputCls}
            value={value.guarantee.days}
            onChange={(e) => sec("guarantee", { days: Number(e.target.value) })}
          />
        </label>
        <StrList label="Pontos da garantia" values={value.guarantee.points} onChange={(v) => sec("guarantee", { points: v })} />
      </AdminCard>

      {/* FAQ */}
      <AdminCard title="Perguntas frequentes (FAQ)">
        <Txt label="Título da seção" value={value.faq.title} onChange={(v) => sec("faq", { title: v })} />
        <ItemList
          items={value.faq.items}
          onChange={(items) => sec("faq", { items })}
          empty={() => ({ q: "", a: "" })}
          addLabel="+ Adicionar pergunta"
          render={(f, set) => (
            <>
              <Txt label="Pergunta" value={f.q} onChange={(v) => set({ q: v })} />
              <Area label="Resposta" value={f.a} onChange={(v) => set({ a: v })} rows={2} />
            </>
          )}
        />
      </AdminCard>

      {/* CTA FINAL */}
      <AdminCard title="Chamada final">
        <Txt label="Título" value={value.finalCta.title} onChange={(v) => sec("finalCta", { title: v })} />
        <Area label="Texto" value={value.finalCta.text} onChange={(v) => sec("finalCta", { text: v })} rows={2} />
      </AdminCard>

      {/* RODAPÉ */}
      <AdminCard title="Rodapé">
        <Txt label="Marca" value={value.footer.brand} onChange={(v) => sec("footer", { brand: v })} />
        <Txt label="Descrição" value={value.footer.description} onChange={(v) => sec("footer", { description: v })} />
        <Area label="Aviso legal (disclaimer)" value={value.footer.disclaimer} onChange={(v) => sec("footer", { disclaimer: v })} rows={2} />
      </AdminCard>
    </div>
  );
}
