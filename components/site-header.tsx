// components/site-header.tsx
"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language";
import { useMagnetic } from "@/lib/use-magnetic";
import { useCart } from "@/lib/cart/context";
import type { HeaderContent } from "@/lib/content/defaults";

const NAV_LINKS: Array<{ href: string; fieldKey: keyof HeaderContent }> = [
  { href: "/#verhaal", fieldKey: "nav_1_label" },
  { href: "/#proces", fieldKey: "nav_2_label" },
  { href: "/#wijnen", fieldKey: "nav_3_label" },
  { href: "/voor-bedrijven", fieldKey: "nav_4_label" },
  { href: "/#bezoek", fieldKey: "nav_5_label" },
];

export function SiteHeader({ content }: { content: HeaderContent }) {
  const { lang, setLang, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const magneticRef = useMagnetic();
  const { cart, openCart } = useCart();
  const itemCount = cart?.totalQuantity ?? 0;

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 40);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header${isScrolled ? " is-scrolled" : ""}`} id="header">
      <a className="brand" href="/">
        <img className="brand-logo" src="/assets/chateau-logo.png" alt="Chateau Amsterdam Logo" />
        <small>Urban&nbsp;Winery&nbsp;·&nbsp;aan&nbsp;het&nbsp;IJ</small>
      </a>
      <nav className="site-nav" aria-label="Main Navigation">
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href}>
            {t(content[link.fieldKey].nl, content[link.fieldKey].en)}
          </a>
        ))}

        <div className="lang-selector">
          <button
            type="button"
            className={`lang-btn${lang === "nl" ? " active" : ""}`}
            onClick={() => setLang("nl")}
            aria-label="Switch to Dutch"
            aria-pressed={lang === "nl"}
          >
            NL
          </button>
          <span className="lang-divider">/</span>
          <button
            type="button"
            className={`lang-btn${lang === "en" ? " active" : ""}`}
            onClick={() => setLang("en")}
            aria-label="Switch to English"
            aria-pressed={lang === "en"}
          >
            EN
          </button>
        </div>

        <a className="nav-cta" ref={magneticRef as React.RefObject<HTMLAnchorElement>} href="/tours-tastings#reserveren">
          {t(content.cta_label.nl, content.cta_label.en)}
        </a>

        <button type="button" className="cart-trigger" aria-label={t("Open winkelmandje", "Open cart")} onClick={openCart}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M6 8h12l-1.2 11a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </svg>
          {itemCount > 0 ? <span className="cart-trigger-count">{itemCount}</span> : null}
        </button>
      </nav>
    </header>
  );
}
