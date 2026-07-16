"use client";

import { useEffect, useRef } from "react";

export function useMagnetic(strength = 0.3) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hoverCapable = window.matchMedia("(hover: hover)").matches;
    if (reduced || !hoverCapable) return;

    function onMouseMove(e: MouseEvent) {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.translate = `${x * strength}px ${y * strength}px`;
    }

    function onMouseLeave() {
      if (!el) return;
      el.style.transition = "translate 0.6s cubic-bezier(0.19,1,0.22,1)";
      el.style.translate = "0px 0px";
      setTimeout(() => {
        if (el) el.style.transition = "";
      }, 600);
    }

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);
    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [strength]);

  return ref;
}
