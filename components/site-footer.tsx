// components/site-footer.tsx
"use client";

import { useLanguage } from "@/lib/language";
import type { FooterContent } from "@/lib/content/defaults";

export function SiteFooter({ content }: { content: FooterContent }) {
  const { t } = useLanguage();

  return (
    <footer className="site-footer on-dark" id="footer">
      <div className="footer-cheers">
        Proost
        <em>santé, cheers, salud</em>
      </div>
      <div className="footer-grid">
        <div>
          <h4>Chateau Amsterdam</h4>
          <p className="footer-note">{t(content.footer_note.nl, content.footer_note.en)}</p>
          <button
            type="button"
            className="footer-newsletter-trigger"
            onClick={() => window.dispatchEvent(new CustomEvent("open-newsletter-modal"))}
            style={{
              marginTop: "16px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--theme-accent)",
              cursor: "pointer",
              padding: "6px 0",
              borderBottom: "1px solid var(--theme-accent)",
            }}
          >
            {t("Club Chateau (Nieuwsbrief) →", "Club Chateau (Newsletter) →")}
          </button>
        </div>
        <div>
          <h4>{t(content.discover_heading.nl, content.discover_heading.en)}</h4>
          <a href="/#verhaal">{t(content.discover_link_1.nl, content.discover_link_1.en)}</a>
          <a href="/#proces">{t(content.discover_link_2.nl, content.discover_link_2.en)}</a>
          <a href="/#wijnen">{t(content.discover_link_3.nl, content.discover_link_3.en)}</a>
        </div>
        <div>
          <h4>{t(content.do_heading.nl, content.do_heading.en)}</h4>
          <a href="/tours-tastings">Tours &amp; tastings</a>
          <a href="/voor-bedrijven">{t(content.do_link_2.nl, content.do_link_2.en)}</a>
          <a href="/#wijnen">Webshop</a>
        </div>
        <div>
          <h4>Contact</h4>
          <a href="mailto:winery@chateau.amsterdam">winery@chateau.amsterdam</a>
          <a href="mailto:sales@chateau.amsterdam">sales@chateau.amsterdam</a>
          <a href="https://www.instagram.com/chateauamsterdam/" target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          <a href="https://www.linkedin.com/company/chateauamsterdam/" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <img className="footer-logo" src="/assets/chateau-logo.png" alt="Chateau Amsterdam Logo Monochromatic" />
        <span>© 2026 Chateau Amsterdam</span>
        <nav className="footer-legal">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-newsletter-modal"))}
            style={{
              color: "inherit",
              fontSize: "inherit",
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            {t("Nieuwsbrief", "Newsletter")}
          </button>
          <a href="/privacybeleid">{t("Privacybeleid", "Privacy policy")}</a>
          <a href="/algemene-voorwaarden">{t("Algemene voorwaarden", "Terms & conditions")}</a>
        </nav>
      </div>
    </footer>
  );
}
