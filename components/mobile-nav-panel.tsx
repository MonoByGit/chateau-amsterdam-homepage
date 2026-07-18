// components/mobile-nav-panel.tsx
"use client";

import { useLanguage } from "@/lib/language";
import { useMobileNav } from "@/lib/mobile-nav/context";
import { NAV_LINKS } from "@/components/site-header";
import type { HeaderContent } from "@/lib/content/defaults";

// Rendered as a sibling of <SiteHeader> (see app/(site)/layout.tsx), not
// nested inside it: .site-header uses mix-blend-mode: difference for its
// unscrolled, over-the-hero look, and any fixed-position panel painted
// inside that subtree gets folded into the same blend group, which made an
// earlier version of this panel render as a transparent, colour-inverted
// mess over the hero photo instead of a solid nav drawer.
export function MobileNavPanel({ content }: { content: HeaderContent }) {
  const { lang, setLang, t } = useLanguage();
  const { isOpen, close } = useMobileNav();

  return (
    <>
      <div className={`mobile-nav-overlay${isOpen ? " is-open" : ""}`} onClick={close} aria-hidden={!isOpen} />
      <nav
        id="mobile-nav"
        className={`mobile-nav${isOpen ? " is-open" : ""}`}
        aria-label="Mobile Navigation"
        aria-hidden={!isOpen}
      >
        <div className="mobile-nav-links">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={close}>
              {t(content[link.fieldKey].nl, content[link.fieldKey].en)}
            </a>
          ))}
        </div>

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

        <a className="btn btn--primary mobile-nav-cta" href="/tours-tastings#reserveren" onClick={close}>
          {t(content.cta_label.nl, content.cta_label.en)}
        </a>
      </nav>
    </>
  );
}
