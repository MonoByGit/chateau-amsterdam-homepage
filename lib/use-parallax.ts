"use client";

import { useEffect, useRef } from "react";

export function useParallax(speed = 0.1) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let ticking = false;
    let rafId: number | undefined;

    function apply() {
      if (!el) return;
      const vh = window.innerHeight;
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) {
        ticking = false;
        return;
      }
      const center = r.top + r.height / 2 - vh / 2;
      el.style.transform = `translateY(${(-center * speed).toFixed(1)}px)`;
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        rafId = requestAnimationFrame(apply);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    apply();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId !== undefined) cancelAnimationFrame(rafId);
    };
  }, [speed]);

  return ref;
}
