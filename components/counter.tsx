"use client";

import { useEffect, useRef, useState } from "react";

function format(value: number, useDots: boolean): string {
  const rounded = Math.round(value);
  return useDots ? rounded.toLocaleString("nl-NL") : rounded.toString();
}

export function Counter({ target, format: fmt }: { target: number; format?: "dots" }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Tracks the in-flight requestAnimationFrame handle so cleanup can
    // cancel it. Without this, unmounting mid-animation leaves the
    // self-scheduling `tick` loop running forever, calling
    // requestAnimationFrame and setState on an unmounted component
    // (the same class of bug fixed in useReveal's dangling setTimeout
    // and useMagnetic's dangling setTimeout).
    let rafId: number | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(el);

          const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          if (reduced) {
            setDisplay(format(target, fmt === "dots"));
            return;
          }

          const duration = 1600;
          const start = performance.now();
          function tick(now: number) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setDisplay(format(target * eased, fmt === "dots"));
            if (progress < 1) {
              rafId = requestAnimationFrame(tick);
            } else {
              rafId = null;
            }
          }
          rafId = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [target, fmt]);

  return (
    <span ref={ref} data-testid="counter">
      {display}
    </span>
  );
}
