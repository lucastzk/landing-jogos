"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { captureTracking, decorateCheckoutLinks } from "@/lib/tracking";

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

    // ---------- Lenis ----------
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.8,
    });

    // Âncoras com scroll suave
    const onAnchor = (e: Event) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href");
      if (id && id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target as HTMLElement, { offset: -80 });
        }
      }
    };
    document.addEventListener("click", onAnchor);

    // ---------- Coleta de elementos ----------
    const parallaxEls = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    const marqueeTracks = Array.from(
      document.querySelectorAll<HTMLElement>("[data-marquee] .marquee__track")
    );
    const marquees = marqueeTracks.map((track) => ({ track, x: 0, half: 0 }));

    // Elementos que aparecem ao entrar na viewport. Revelar é feito DENTRO do
    // loop (posição real) em vez de IntersectionObserver — assim funciona com o
    // Lenis e também ao VOLTAR de outra página (onde o observer não re-dispara).
    let revealEls = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal], .mask"));

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
    let revealAccum = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
      last = t;

      const vh = window.innerHeight;
      const vel = lenis.velocity || 0;

      // Barra de progresso
      bar.style.width = `${(lenis.progress || 0) * 100}%`;

      // Parallax (relativo à posição na tela → funciona na página toda)
      for (const el of parallaxEls) {
        const speed = Number(el.dataset.parallax || "0.08");
        const r = el.getBoundingClientRect();
        const offset = r.top + r.height / 2 - vh / 2;
        el.style.transform = `translate3d(0, ${(-offset * speed).toFixed(2)}px, 0)`;
      }

      // Reveal: revela cada elemento quando o topo entra na viewport. Checado a
      // cada ~100ms (não todo frame) pra não pesar/travar o scroll.
      revealAccum += dt;
      if (revealAccum > 0.1 && revealEls.length) {
        revealAccum = 0;
        revealEls = revealEls.filter((el) => {
          if (el.getBoundingClientRect().top < vh * 0.9) {
            el.classList.add("in-view");
            return false; // revelado → sai da lista
          }
          return true;
        });
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

    // Rede de segurança (1,5s): revela só o que já está NA TELA ou acima — pra
    // o topo nunca ficar preso invisível ao voltar de outra página. O conteúdo
    // mais abaixo continua sendo revelado COM animação pelo loop, ao rolar.
    const safetyTimer = window.setTimeout(() => {
      const vh = window.innerHeight;
      document
        .querySelectorAll<HTMLElement>("[data-reveal]:not(.in-view), .mask:not(.in-view)")
        .forEach((el) => {
          if (el.getBoundingClientRect().top < vh) el.classList.add("in-view");
        });
    }, 1500);

    const onResize = () => marquees.forEach((m) => (m.half = m.track.scrollWidth / 2));
    window.addEventListener("resize", onResize);

    cleanups.push(() => {
      cancelAnimationFrame(rafId);
      clearTimeout(safetyTimer);
      document.removeEventListener("click", onAnchor);
      window.removeEventListener("resize", onResize);
      bar.remove();
      lenis.destroy();
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
