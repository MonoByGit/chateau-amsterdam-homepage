"use client";

import { useEffect, useRef, useState } from "react";

export function useReveal(delay = 0) {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timeout: ReturnType<typeof setTimeout> | undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (delay > 0) {
              timeout = setTimeout(() => setIsVisible(true), delay * 1000);
            } else {
              setIsVisible(true);
            }
            observer.unobserve(el);
            return;
          }
        }
      },
      // Thresholds copied from the legacy src/main.js scroll-reveal logic —
      // not arbitrary, do not "clean up": 0.18 intersection ratio and a
      // -6% bottom rootMargin trigger the reveal slightly before an element
      // is fully in view, and `delay` is expressed in seconds (matching the
      // stagger delays main.js read off `data-delay` attributes).
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timeout) clearTimeout(timeout);
    };
  }, [delay]);

  return { ref, isVisible };
}
