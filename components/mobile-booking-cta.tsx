// components/mobile-booking-cta.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language";

export function MobileBookingCta() {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 400) {
        setShow(true);
      } else {
        setShow(false);
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.25rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 99,
        display: "block",
      }}
      className="mobile-booking-cta-wrap"
    >
      <Link
        href="/tours-tastings#reserveren"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "#1c1917",
          color: "var(--a-accent, #cda757)",
          border: "1px solid var(--a-accent, #cda757)",
          borderRadius: "999px",
          padding: "0.625rem 1.25rem",
          fontSize: "0.875rem",
          fontWeight: 600,
          textDecoration: "none",
          boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
          backdropFilter: "blur(8px)",
          letterSpacing: "0.02em",
        }}
      >
        <span>🍷</span>
        <span>{t("Boek een Tasting", "Book a Tasting")}</span>
        <span>→</span>
      </Link>
    </div>
  );
}
