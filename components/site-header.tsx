"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language";

const NAV_LINKS: Array<{ href: string; nl: string; en: string }> = [
  { href: "#verhaal", nl: "Het verhaal", en: "Our story" },
  { href: "#proces", nl: "Het proces", en: "The process" },
  { href: "#wijnen", nl: "Wijnen", en: "Wines" },
  { href: "#bedrijven", nl: "Voor bedrijven", en: "For businesses" },
  { href: "#bezoek", nl: "Bezoek", en: "Visit" },
];

export function SiteHeader() {
  const { lang, setLang } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 40);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header${isScrolled ? " is-scrolled" : ""}`}>
      <a className="brand" href="#top">
        <img className="brand-logo" src="/assets/chateau-logo.png" alt="Chateau Amsterdam Logo" />
        <small>Urban&nbsp;Winery&nbsp;·&nbsp;aan&nbsp;het&nbsp;IJ</small>
      </a>
      <nav className="site-nav" aria-label="Main Navigation">
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href}>
            {lang === "nl" ? link.nl : link.en}
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

        <a className="nav-cta" href="#paden">
          {lang === "nl" ? "Boek een tasting" : "Book a tasting"}
        </a>
      </nav>
    </header>
  );
}
