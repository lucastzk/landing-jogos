"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { captureTracking, decorateCheckoutLinks } from "@/lib/tracking";
import { fbTrack } from "@/lib/pixel";

/**
 * Camada de movimento (estilo estúdio):
 *  - Lenis: scroll suave com inércia — SEMPRE ligado (ignora o "reduzir
 *    movimento" do Windows de propósito, porque o site é todo baseado nisso).
 *  - Marquees que aceleram/recuam conforme a velocidade do scroll.
 *  - Parallax multicamada ([data-parallax]).
 *  - Reveal de elementos no scroll.
 *  - Botões magnéticos (desktop).
 */
export default function Interactions() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];
    const fine = window.matchMedia("(pointer: fine)").matches;

    // ---------- Rastreio de UTMs (Facebook Ads → checkout → AmploPay) ----------
    // Captura os UTMs da URL, persiste na sessão e os repassa aos links de
    // /checkout. A persistência garante a atribuição mesmo após a navegação.
    captureTracking();
    decorateCheckoutLinks();

    // ---------- Lenis (só no DESKTOP) ----------
    // No celular o scroll NATIVO é mais leve e fluido; o Lenis intercepta o toque
    // e roda recálculo a cada frame, pesando o render no mobile. Por isso: off.
    const lenis = fine
      ? new Lenis({
          duration: 1.25,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          wheelMultiplier: 1,
        })
      : null;

    // Âncoras com scroll suave
    const onAnchor = (e: Event) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href");
      if (id && id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          if (lenis) {
            lenis.scrollTo(target as HTMLElement, { offset: -80 });
          } else {
            const y = (target as HTMLElement).getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: y, behavior: "smooth" });
          }
        }
      }
    };
    document.addEventListener("click", onAnchor);

    // ---------- Meta Pixel: clique em "comprar" → InitiateCheckout ----------
    // Captura TODOS os botões de compra da landing num só lugar (Hero, Oferta,
    // CTA final, header, barra fixa do mobile): todos são <a> que apontam para
    // /checkout. Assim rastreamos a intenção de compra sem tocar em cada botão.
    const onCheckoutClick = (e: Event) => {
      const a = (e.target as HTMLElement).closest('a[href*="/checkout"]') as HTMLAnchorElement | null;
      if (a) fbTrack("InitiateCheckout");
    };
    document.addEventListener("click", onCheckoutClick);

    // ---------- Coleta de elementos ----------
    // Parallax só no desktop: ler getBoundingClientRect de cada elemento a cada
    // frame trava o scroll no celular. No mobile os elementos ficam estáticos.
    const parallaxEls = fine
      ? Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"))
      : [];
    const marqueeTracks = Array.from(
      document.querySelectorAll<HTMLElement>("[data-marquee] .marquee__track")
    );
    const marquees = marqueeTracks.map((track) => ({ track, x: 0, half: 0 }));

    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    document.body.appendChild(bar);

    // ---------- Botões magnéticos ----------
    if (fine) {
      const magnets = document.querySelectorAll<HTMLElement>("[data-magnetic]");
      const magHandlers: Array<() => void> = [];
      magnets.forEach((el) => {
        const onMM = (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          el.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * 0.28}px, ${
            (e.clientY - (r.top + r.height / 2)) * 0.28
          }px)`;
        };
        const reset = () => (el.style.transform = "");
        el.addEventListener("mousemove", onMM as EventListener);
        el.addEventListener("mouseleave", reset);
        magHandlers.push(() => {
          el.removeEventListener("mousemove", onMM as EventListener);
          el.removeEventListener("mouseleave", reset);
        });
      });

      cleanups.push(() => {
        magHandlers.forEach((fn) => fn());
      });
    }

    // ---------- Loop único ----------
    let rafId = 0;
    let last = 0;
    const loop = (t: number) => {
      if (lenis) lenis.raf(t);
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
      last = t;

      const vh = window.innerHeight;
      const vel = lenis ? lenis.velocity || 0 : 0;

      // Barra de progresso (Lenis no desktop; scroll nativo no celular)
      const prog = lenis
        ? lenis.progress || 0
        : window.scrollY / Math.max(1, document.documentElement.scrollHeight - vh);
      bar.style.width = `${prog * 100}%`;

      // Parallax (relativo à posição na tela → funciona na página toda)
      for (const el of parallaxEls) {
        const speed = Number(el.dataset.parallax || "0.08");
        const r = el.getBoundingClientRect();
        const offset = r.top + r.height / 2 - vh / 2;
        el.style.transform = `translate3d(0, ${(-offset * speed).toFixed(2)}px, 0)`;
      }

      // Marquees: velocidade base + empurrão pela velocidade do scroll
      const push = vel * 0.9;
      for (const m of marquees) {
        if (!m.half) m.half = m.track.scrollWidth / 2;
        m.x -= (40 * dt + Math.abs(push) * 0.06 + push * 0.04);
        if (m.half) {
          while (m.x <= -m.half) m.x += m.half;
          while (m.x > 0) m.x -= m.half;
        }
        m.track.style.transform = `translate3d(${m.x.toFixed(2)}px, 0, 0)`;
      }

      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    // OBS.: o "reveal" (aparecer ao rolar) agora é 100% CSS (scroll-driven, em
    // app/globals.css). Não há lógica de reveal aqui de propósito — é o que
    // garante que o conteúdo nunca fique invisível nem trave ao voltar de página.

    const onResize = () => marquees.forEach((m) => (m.half = m.track.scrollWidth / 2));
    window.addEventListener("resize", onResize);

    cleanups.push(() => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", onAnchor);
      document.removeEventListener("click", onCheckoutClick);
      window.removeEventListener("resize", onResize);
      bar.remove();
      if (lenis) lenis.destroy();
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
