"use client";

import { useEffect, useState } from "react";
import type { EditableContent, EditableCheckout } from "@/lib/content-types";
import MediaField from "./MediaField";
import ReaisInput from "./ReaisInput";

type Status = "loading" | "login" | "ready";

const inputClass =
  "w-full rounded-lg border border-line bg-white/[0.03] px-3 py-2.5 text-sm text-bone outline-none focus:border-red-500/60 focus:ring-2 focus:ring-red-500/15";

export default function AdminDashboard() {
  const [status, setStatus] = useState<Status>("loading");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [content, setContent] = useState<EditableContent | null>(null);
  const [checkout, setCheckout] = useState<EditableCheckout | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  async function loadContent() {
    const res = await fetch("/api/admin/content", { cache: "no-store" });
    if (res.status === 401) {
      setStatus("login");
      return;
    }
    const data = await res.json();
    if (data.ok) {
      setContent(data.content);
      setCheckout(data.checkout);
      setStatus("ready");
    }
  }

  useEffect(() => {
    loadContent();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.ok) {
      setPassword("");
      setStatus("loading");
      loadContent();
    } else {
      setLoginError(data.error || "Não foi possível entrar.");
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setContent(null);
    setCheckout(null);
    setStatus("login");
  }

  async function handleSave() {
    if (!content || !checkout) return;
    setSaving(true);
    setSavedMsg("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, checkout }),
      });
      const data = await res.json();
      setSavedMsg(data.ok ? "Alterações salvas! Recarregue o site para ver." : data.error || "Erro ao salvar.");
    } catch {
      setSavedMsg("Falha de conexão ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  // ----- Atualizadores imutáveis -----
  function setVideoUrl(url: string) {
    setContent((c) => (c ? { ...c, vsl: { ...c.vsl, videoUrl: url } } : c));
  }
  function setPoster(url: string) {
    setContent((c) => (c ? { ...c, vsl: { ...c.vsl, poster: url } } : c));
  }
  function setHero(url: string) {
    setContent((c) => (c ? { ...c, hero: { ...c.hero, mockupImage: url } } : c));
  }
  function setGameField(index: number, patch: Partial<EditableContent["highlights"]["games"][number]>) {
    setContent((c) => {
      if (!c) return c;
      const games = c.highlights.games.map((g, i) => (i === index ? { ...g, ...patch } : g));
      return { ...c, highlights: { ...c.highlights, games } };
    });
  }

  // ----- Atualizadores do checkout -----
  function patchCheckout(patch: Partial<EditableCheckout>) {
    setCheckout((c) => (c ? { ...c, ...patch } : c));
  }
  function patchProduct(patch: Partial<EditableCheckout["product"]>) {
    setCheckout((c) => (c ? { ...c, product: { ...c.product, ...patch } } : c));
  }
  function patchBump(patch: Partial<EditableCheckout["orderBump"]>) {
    setCheckout((c) => (c ? { ...c, orderBump: { ...c.orderBump, ...patch } } : c));
  }
  function patchMethods(patch: Partial<EditableCheckout["methods"]>) {
    setCheckout((c) => (c ? { ...c, methods: { ...c.methods, ...patch } } : c));
  }

  // ---------------------------------------------------------------- LOADING
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-bone/50">
        Carregando...
      </div>
    );
  }

  // ---------------------------------------------------------------- LOGIN
  if (status === "login") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-5">
        <form onSubmit={handleLogin} className="glass w-full max-w-sm rounded-3xl border-line p-8">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-bone">Painel do site</h1>
          <p className="mt-1 text-sm text-bone/50">Entre para editar vídeos e imagens.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            autoFocus
            className="mt-6 w-full rounded-2xl border border-line bg-white/[0.03] px-4 py-3.5 text-bone outline-none focus:border-red-500/70 focus:ring-4 focus:ring-red-500/15"
          />
          {loginError && <p className="mt-2 text-sm text-red-400">{loginError}</p>}
          <button
            type="submit"
            className="mt-4 w-full rounded-full bg-gradient-to-r from-red-700 to-red-500 px-6 py-3.5 font-bold text-white shadow-red-soft"
          >
            Entrar
          </button>
        </form>
      </div>
    );
  }

  // ---------------------------------------------------------------- READY
  if (!content) return null;

  return (
    <div className="min-h-screen bg-black pb-32">
      {/* Topo */}
      <header className="sticky top-0 z-40 border-b border-line bg-black/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <div>
            <h1 className="font-display text-lg font-extrabold tracking-tight text-bone">Painel do site</h1>
            <p className="text-xs text-bone/45">Vídeos e imagens</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer" className="rounded-full border border-line px-3.5 py-2 text-xs font-medium text-bone/60 hover:text-bone">
              Ver site
            </a>
            <button onClick={handleLogout} className="rounded-full border border-line px-3.5 py-2 text-xs font-medium text-bone/60 hover:text-red-400">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8">
        {/* VÍDEO */}
        <Section title="Vídeo de apresentação (VSL)" subtitle="Cole a URL do YouTube/Vimeo ou envie um arquivo MP4.">
          <div className="grid gap-4">
            <MediaField
              label="URL do vídeo"
              value={content.vsl.videoUrl}
              onChange={setVideoUrl}
              kind="any"
              accept="video/mp4,video/webm"
              hint="Aceita YouTube, Vimeo ou link direto .mp4. Para vídeos longos, prefira o YouTube/Vimeo."
            />
            <MediaField
              label="Capa do vídeo (poster)"
              value={content.vsl.poster}
              onChange={setPoster}
              hint="Imagem exibida antes do play (recomendado 1280x720)."
            />
          </div>
        </Section>

        {/* HERO */}
        <Section title="Imagem do topo (Hero)" subtitle="A imagem/mockup que aparece no topo do site.">
          <MediaField label="Imagem do hero" value={content.hero.mockupImage} onChange={setHero} />
        </Section>

        {/* DESTAQUES */}
        <Section title="Destaques" subtitle="Nome, categoria, descrição e imagem de cada item.">
          <div className="grid gap-4 lg:grid-cols-2">
            {content.highlights.games.map((game, i) => (
              <div key={i} className="rounded-2xl border border-line bg-white/[0.015] p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-bone/40">
                  Destaque {i + 1}
                </p>
                <div className="grid gap-3">
                  <Labeled label="Nome">
                    <input
                      type="text"
                      value={game.name}
                      onChange={(e) => setGameField(i, { name: e.target.value })}
                      placeholder="Nome do item"
                      className={inputClass}
                    />
                  </Labeled>
                  <Labeled label="Categoria">
                    <input
                      type="text"
                      value={game.genre}
                      onChange={(e) => setGameField(i, { genre: e.target.value })}
                      placeholder="Ex.: Corrida / Kart"
                      className={inputClass}
                    />
                  </Labeled>
                  <Labeled label="Descrição">
                    <textarea
                      value={game.description}
                      onChange={(e) => setGameField(i, { description: e.target.value })}
                      placeholder="Descrição curta do item"
                      rows={3}
                      className={`${inputClass} resize-y`}
                    />
                  </Labeled>
                  <MediaField
                    label="Imagem"
                    value={game.image}
                    onChange={(url) => setGameField(i, { image: url })}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* CHECKOUT */}
        {checkout && (
          <Section title="Checkout" subtitle="Logo, marca, produto, preço e formas de pagamento.">
            <div className="grid gap-4">
              {/* Marca + logo */}
              <div className="grid gap-3 rounded-2xl border border-line bg-white/[0.015] p-4">
                <Labeled label="Nome da marca">
                  <input
                    type="text"
                    value={checkout.brandName}
                    onChange={(e) => patchCheckout({ brandName: e.target.value })}
                    placeholder="Sua marca"
                    className={inputClass}
                  />
                </Labeled>
                <MediaField
                  label="Logo (topo do checkout)"
                  value={checkout.logoImage}
                  onChange={(url) => patchCheckout({ logoImage: url })}
                  hint="PNG transparente recomendado. Vazio = mostra o nome da marca."
                />
                <Labeled label={`Tamanho da logo — ${checkout.logoHeight}px`}>
                  <input
                    type="range"
                    min={24}
                    max={200}
                    step={2}
                    value={checkout.logoHeight}
                    onChange={(e) => patchCheckout({ logoHeight: Number(e.target.value) })}
                    className="w-full accent-red-500"
                  />
                </Labeled>
              </div>

              {/* Produto */}
              <div className="grid gap-3 rounded-2xl border border-line bg-white/[0.015] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-bone/40">Produto</p>
                <Labeled label="Nome do produto">
                  <input
                    type="text"
                    value={checkout.product.name}
                    onChange={(e) => patchProduct({ name: e.target.value })}
                    placeholder="Nome do seu produto"
                    className={inputClass}
                  />
                </Labeled>
                <Labeled label="Descrição curta">
                  <input
                    type="text"
                    value={checkout.product.description}
                    onChange={(e) => patchProduct({ description: e.target.value })}
                    className={inputClass}
                  />
                </Labeled>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Labeled label="Preço">
                    <ReaisInput cents={checkout.product.priceInCents} onChange={(c) => patchProduct({ priceInCents: c })} />
                  </Labeled>
                </div>
                <MediaField
                  label="Imagem do produto"
                  value={checkout.product.image}
                  onChange={(url) => patchProduct({ image: url })}
                />
              </div>

              {/* Order bump */}
              <div className="grid gap-3 rounded-2xl border border-line bg-white/[0.015] p-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checkout.orderBump.enabled}
                    onChange={(e) => patchBump({ enabled: e.target.checked })}
                    className="h-4 w-4 accent-red-500"
                  />
                  <span className="text-sm font-bold text-bone">Order bump (oferta extra com 1 clique)</span>
                </label>
                {checkout.orderBump.enabled && (
                  <>
                    <Labeled label="Título">
                      <input
                        type="text"
                        value={checkout.orderBump.title}
                        onChange={(e) => patchBump({ title: e.target.value })}
                        className={inputClass}
                      />
                    </Labeled>
                    <Labeled label="Descrição">
                      <textarea
                        rows={2}
                        value={checkout.orderBump.description}
                        onChange={(e) => patchBump({ description: e.target.value })}
                        className={`${inputClass} resize-y`}
                      />
                    </Labeled>
                    <div className="grid grid-cols-2 gap-3">
                      <Labeled label="De (riscado, opcional)">
                        <ReaisInput cents={checkout.orderBump.fromInCents} onChange={(c) => patchBump({ fromInCents: c })} />
                      </Labeled>
                      <Labeled label="Por">
                        <ReaisInput cents={checkout.orderBump.priceInCents} onChange={(c) => patchBump({ priceInCents: c })} />
                      </Labeled>
                    </div>
                  </>
                )}
              </div>

              {/* Pagamento */}
              <div className="grid gap-3 rounded-2xl border border-line bg-white/[0.015] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-bone/40">Pagamento</p>
                <div className="flex flex-wrap gap-5">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checkout.methods.pix}
                      onChange={(e) => patchMethods({ pix: e.target.checked })}
                      className="h-4 w-4 accent-red-500"
                    />
                    <span className="text-sm text-bone">PIX</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checkout.methods.card}
                      onChange={(e) => patchMethods({ card: e.target.checked })}
                      className="h-4 w-4 accent-red-500"
                    />
                    <span className="text-sm text-bone">Cartão</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Labeled label="Parcelas máx.">
                    <input
                      type="number"
                      min={1}
                      max={24}
                      value={checkout.maxInstallments}
                      onChange={(e) => patchCheckout({ maxInstallments: Number(e.target.value) })}
                      className={inputClass}
                    />
                  </Labeled>
                  <Labeled label="Garantia (dias)">
                    <input
                      type="number"
                      min={0}
                      value={checkout.guaranteeDays}
                      onChange={(e) => patchCheckout({ guaranteeDays: Number(e.target.value) })}
                      className={inputClass}
                    />
                  </Labeled>
                </div>
                <Labeled label="Texto de segurança">
                  <input
                    type="text"
                    value={checkout.securityText}
                    onChange={(e) => patchCheckout({ securityText: e.target.value })}
                    className={inputClass}
                  />
                </Labeled>
                <Labeled label="E-mail de suporte">
                  <input
                    type="email"
                    value={checkout.supportEmail}
                    onChange={(e) => patchCheckout({ supportEmail: e.target.value })}
                    className={inputClass}
                  />
                </Labeled>
              </div>
            </div>
          </Section>
        )}
      </main>

      {/* Barra de salvar fixa */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-black/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-3">
          <span className="text-sm text-bone/55">{savedMsg}</span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-gradient-to-r from-red-700 to-red-500 px-7 py-3 font-bold text-white shadow-red-soft transition-transform active:scale-95 disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-bone/50">{label}</span>
      {children}
    </label>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="font-display text-base font-bold tracking-tight text-bone">{title}</h2>
      {subtitle && <p className="mb-4 mt-0.5 text-sm text-bone/45">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      {children}
    </section>
  );
}
