import Link from "next/link";

export const metadata = { title: "Termos de Uso" };

export default function Termos() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <Link href="/" className="text-sm text-brand-400 hover:underline">← Voltar</Link>
      <h1 className="mt-6 text-3xl font-extrabold text-white">Termos de Uso</h1>
      <p className="mt-4 text-white/60">
        ⚠️ Conteúdo de exemplo. Substitua por seus termos de uso reais (consulte um advogado se
        necessário). Defina aqui as regras de uso do produto, licença, responsabilidades e
        limitações.
      </p>
    </main>
  );
}
