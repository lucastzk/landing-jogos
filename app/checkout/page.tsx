import type { Metadata } from "next";
import Link from "next/link";
import { getCheckout } from "@/lib/content";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout seguro",
  // Páginas de checkout não devem ser indexadas.
  robots: { index: false, follow: false },
};

// Lê as edições do painel admin em runtime (logo, produto, preço...).
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const checkout = await getCheckout();

  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      {/* brilho de fundo, igual ao restante do site */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-red-600/15 blur-3xl" aria-hidden="true" />

      {/* Topo */}
      <header className="relative border-b border-line/70">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2">
            {checkout.logoImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={checkout.logoImage}
                alt={checkout.brandName}
                style={{ height: `${checkout.logoHeight}px` }}
                className="w-auto max-w-[60%] object-contain sm:max-w-[340px]"
              />
            ) : (
              <span className="font-display text-lg font-extrabold tracking-tight text-bone">
                {checkout.brandName}
              </span>
            )}
          </Link>
          <span className="flex items-center gap-1.5 text-xs font-medium text-bone/50">
            <svg className="h-4 w-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Compra segura
          </span>
        </div>
      </header>

      {/* Conteúdo */}
      <section className="relative mx-auto max-w-4xl px-5 py-8 sm:py-12">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-bone sm:text-3xl">
            Finalize sua compra
          </h1>
          <p className="mt-1.5 text-sm text-bone/55">
            Falta pouco. Preencha os dados e escolha como pagar.
          </p>
        </div>

        <CheckoutForm checkout={checkout} />

        <p className="mt-8 text-center text-xs text-bone/35">
          Ambiente protegido. Não armazenamos os dados do seu cartão.
        </p>
      </section>
    </main>
  );
}
