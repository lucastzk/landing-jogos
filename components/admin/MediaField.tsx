"use client";

import { useRef, useState } from "react";

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  hint?: string;
  /** "image" mostra preview de imagem; "any" também aceita vídeo. */
  kind?: "image" | "any";
};

function isVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);
}

export default function MediaField({ label, value, onChange, accept = "image/*", hint, kind = "image" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Falha no upload.");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Falha de conexão no upload.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const showPreview = !!value && kind === "image";

  return (
    <div className="rounded-2xl border border-line bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-bone">{label}</span>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs font-medium text-bone/45 transition-colors hover:text-red-400"
          >
            Remover
          </button>
        )}
      </div>

      {/* Preview */}
      <div className="mb-3 flex h-32 items-center justify-center overflow-hidden rounded-xl border border-line bg-black/40">
        {value ? (
          kind === "any" && isVideo(value) ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video src={value} className="h-full w-full object-contain" muted controls />
          ) : showPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={label} className="h-full w-full object-contain" />
          ) : (
            <span className="px-3 text-center text-xs text-bone/40 break-all">{value}</span>
          )
        ) : (
          <span className="text-xs text-bone/30">Sem mídia</span>
        )}
      </div>

      {/* Ações */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-lg bg-gradient-to-r from-red-700 to-red-500 px-3.5 py-2 text-xs font-bold text-white shadow-red-soft transition-transform active:scale-95 disabled:opacity-60"
        >
          {uploading ? "Enviando..." : "Enviar arquivo"}
        </button>
        <span className="text-xs text-bone/30">ou cole uma URL:</span>
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
        className="mt-2 w-full rounded-lg border border-line bg-white/[0.03] px-3 py-2 text-sm text-bone/80 outline-none focus:border-red-500/60"
      />

      {hint && <p className="mt-2 text-xs text-bone/40">{hint}</p>}
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
