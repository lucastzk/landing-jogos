import Link from "next/link";

export const metadata = { title: "Política de Privacidade" };

export default function Privacidade() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <Link href="/" className="text-sm text-brand-400 hover:underline">← Voltar</Link>
      <h1 className="mt-6 text-3xl font-extrabold text-white">Política de Privacidade</h1>
      <p className="mt-4 text-white/60">
        ⚠️ Conteúdo de exemplo. Substitua pela sua política de privacidade real, em conformidade com
        a LGPD. Explique quais dados você coleta, como usa e como o cliente pode solicitar exclusão.
      </p>
    </main>
  );
}
