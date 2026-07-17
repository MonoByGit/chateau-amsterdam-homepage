// components/site-header.tsx
"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language";
import { useMagnetic } from "@/lib/use-magnetic";
import type { HeaderContent } from "@/lib/content/defaults";

const NAV_LINKS: Array<{ href: string; fieldKey: keyof HeaderContent }> = [
  { href: "#verhaal", fieldKey: "nav_1_label" },
  { href: "#proces", fieldKey: "nav_2_label" },
  { href: "#wijnen", fieldKey: "nav_3_label" },
  { href: "/voor-bedrijven", fieldKey: "nav_4_label" },
  { href: "#bezoek", fieldKey: "nav_5_label" },
];

export function SiteHeader({ content }: { content: HeaderContent }) {
  const { lang, setLang, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const magneticRef = useMagnetic();

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
      <a className="brand" href="#top">
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

        <a className="nav-cta" ref={magneticRef as React.RefObject<HTMLAnchorElement>} href="#paden">
          {t(content.cta_label.nl, content.cta_label.en)}
        </a>
      </nav>
    </header>
  );
}
