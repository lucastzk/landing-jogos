"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { captureTracking, decorateCheckoutLinks } from "@/lib/tracking";
import { fbTrack } from "@/lib/pixel";

/**
 * Camada de movimento.
 *  - DESKTOP (pointer fine): Lenis (scroll suave), parallax, marquees reativos ao
 *    scroll, barra de progresso e botões magnéticos — tudo num RAF único.
 *  - MOBILE (toque): NADA disso roda. Lenis/parallax/RAF travavam o iPhone, então
 *    usamos scroll NATIVO + marquees por CSS (compositor). Só o rastreio de UTMs
 *    e os cliques (âncora + InitiateCheckout) seguem ativos. Main thread livre.
 */
export default function Interactions() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];
    const fine = window.matchMedia("(pointer: fine)").matches;

    // ---------- Rastreio de UTMs (sempre) ----------
    captureTracking();
    decorateCheckoutLinks();

    // ---------- Cliques (sempre) ----------
    // No desktop o Lenis (definido abaixo) faz o scroll suave da âncora; no mobile
    // cai no scroll nativo suave. `lenis` é lido no clique, então pode ser null aqui.
    let lenis: Lenis | null = null;

    const onAnchor = (e: Event) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href");
      if (id && id.length > 1) {
        const target = document.querySelector(id) as HTMLElement | null;
        if (target) {
          e.preventDefault();
          if (lenis) {
            lenis.scrollTo(target, { offset: -80 });
          } else {
            window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
          }
        }
      }
    };
    document.addEventListener("click", onAnchor);
    cleanups.push(() => document.removeEventListener("click", onAnchor));

    // Meta Pixel: clique em qualquer botão de compra → InitiateCheckout.
    const onCheckoutClick = (e: Event) => {
      const a = (e.target as HTMLElement).closest('a[href*="/checkout"]') as HTMLAnchorElement | null;
      if (a) fbTrack("InitiateCheckout");
    };
    document.addEventListener("click", onCheckoutClick);
    cleanups.push(() => document.removeEventListener("click", onCheckoutClick));

    const marqueeTracks = Array.from(
      document.querySelectorAll<HTMLElement>("[data-marquee] .marquee__track")
    );

    // ===================== MOBILE: leve (sem JS de animação) =====================
    if (!fine) {
      // Marquee roda por CSS (animate-marquee). Nada de Lenis/parallax/RAF/barra.
      marqueeTracks.forEach((t) => t.classList.add("animate-marquee"));
      return () => cleanups.forEach((fn) => fn());
    }

    // ===================== DESKTOP: experiência completa =====================
    lenis = new Lenis({
      duration: 1.25,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
    });
    const lenisInstance = lenis;

    const parallaxEls = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    const marquees = marqueeTracks.map((track) => ({ track, x: 0, half: 0 }));

    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    document.body.appendChild(bar);

    // ---------- Botões magnéticos ----------
    const magnets = document.querySelectorAll<HTMLElement>("[data-magnetic]");
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
      cleanups.push(() => {
        el.removeEventListener("mousemove", onMM as EventListener);
        el.removeEventListener("mouseleave", reset);
      });
    });

    // ---------- Loop único ----------
    let rafId = 0;
    let last = 0;
    const loop = (t: number) => {
      lenisInstance.raf(t);
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
      last = t;

      const vh = window.innerHeight;
      const vel = lenisInstance.velocity || 0;

      bar.style.width = `${(lenisInstance.progress || 0) * 100}%`;

      for (const el of parallaxEls) {
        const speed = Number(el.dataset.parallax || "0.08");
        const r = el.getBoundingClientRect();
        const offset = r.top + r.height / 2 - vh / 2;
        el.style.transform = `translate3d(0, ${(-offset * speed).toFixed(2)}px, 0)`;
      }

      const push = vel * 0.9;
      for (const m of marquees) {
        if (!m.half) m.half = m.track.scrollWidth / 2;
        m.x -= 40 * dt + Math.abs(push) * 0.06 + push * 0.04;
        if (m.half) {
          while (m.x <= -m.half) m.x += m.half;
          while (m.x > 0) m.x -= m.half;
        }
        m.track.style.transform = `translate3d(${m.x.toFixed(2)}px, 0, 0)`;
      }

      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    const onResize = () => marquees.forEach((m) => (m.half = m.track.scrollWidth / 2));
    window.addEventListener("resize", onResize);

    cleanups.push(() => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      bar.remove();
      lenisInstance.destroy();
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
