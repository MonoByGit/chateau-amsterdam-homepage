"use client";

import { useLanguage } from "@/lib/language";

export function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="site-footer on-dark">
      <div className="footer-cheers">
        Proost
        <em>santé, cheers, salud</em>
      </div>
      <div className="footer-grid">
        <div>
          <h4>Chateau Amsterdam</h4>
          <p className="footer-note">
            {t(
              "Urban winery aan het IJ. Druiven uit heel Europa, wijn uit Noord, sinds 2017.",
              "Urban winery on the IJ. Grapes from all over Europe, wine from Amsterdam-Noord, since 2017."
            )}
          </p>
        </div>
        <div>
          <h4>{t("Ontdek", "Discover")}</h4>
          <a href="#verhaal">{t("Het verhaal", "Our story")}</a>
          <a href="#proces">{t("Het proces", "The process")}</a>
          <a href="#wijnen">{t("De collectie", "The collection")}</a>
        </div>
        <div>
          <h4>{t("Doen", "Do")}</h4>
          <a href="#paden">Tours &amp; tastings</a>
          <a href="#bedrijven">{t("Voor bedrijven", "For businesses")}</a>
          <a href="#wijnen">Webshop</a>
        </div>
        <div>
          <h4>Contact</h4>
          <a href="mailto:info@chateau.amsterdam">info@chateau.amsterdam</a>
          <a href="https://www.instagram.com/chateauamsterdam/" target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          <a href="https://www.linkedin.com/company/chateau-amsterdam/" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <img className="footer-logo" src="/assets/chateau-logo.png" alt="Chateau Amsterdam Logo Monochromatic" />
        <span>© 2026 Chateau Amsterdam</span>
      </div>
    </footer>
  );
}
