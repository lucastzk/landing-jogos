"use client";

import { useEffect, useState } from "react";
import type { EditableContent, EditableCheckout } from "@/lib/content-types";
import LandingEditor from "./LandingEditor";
import CheckoutEditor from "./CheckoutEditor";

type Status = "loading" | "login" | "ready";
type Tab = "pagina" | "checkout";

export default function AdminDashboard() {
  const [status, setStatus] = useState<Status>("loading");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [content, setContent] = useState<EditableContent | null>(null);
  const [checkout, setCheckout] = useState<EditableCheckout | null>(null);
  const [tab, setTab] = useState<Tab>("pagina");
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
      setSavedMsg(data.ok ? "Salvo! Recarregue o site para ver." : data.error || "Erro ao salvar.");
    } catch {
      setSavedMsg("Falha de conexão ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------------------------- LOADING
  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center bg-black text-bone/50">Carregando...</div>;
  }

  // ---------------------------------------------------------------- LOGIN
  if (status === "login") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-5">
        <form onSubmit={handleLogin} className="glass w-full max-w-sm rounded-3xl border-line p-8">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-bone">Painel do site</h1>
          <p className="mt-1 text-sm text-bone/50">Entre para editar a página e o checkout.</p>
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
  if (!content || !checkout) return null;

  return (
    <div className="min-h-screen bg-black pb-32">
      {/* Topo */}
      <header className="sticky top-0 z-40 border-b border-line bg-black/80 backdrop-blur">
        <div className="mx-auto max-w-3xl px-5 py-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-lg font-extrabold tracking-tight text-bone">Painel do site</h1>
              <p className="text-xs text-bone/45">Edite textos, imagens e o checkout</p>
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
          {/* Abas */}
          <div className="mt-3 flex gap-2">
            <TabBtn active={tab === "pagina"} onClick={() => setTab("pagina")} label="Conteúdo da página" />
            <TabBtn active={tab === "checkout"} onClick={() => setTab("checkout")} label="Checkout" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-6">
        {tab === "pagina" ? (
          <LandingEditor value={content} onChange={setContent} />
        ) : (
          <CheckoutEditor value={checkout} onChange={setCheckout} />
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

function TabBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
        active ? "bg-gradient-to-r from-red-700 to-red-500 text-white" : "border border-line text-bone/60 hover:text-bone"
      }`}
    >
      {label}
    </button>
  );
}
