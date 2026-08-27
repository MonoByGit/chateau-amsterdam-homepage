// app/(site)/popups/popups-client.tsx
"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/language";
import type {
  NewsletterPopupContent,
  AgeGatePopupContent,
  CookieBannerPopupContent,
} from "@/lib/content/popup-defaults";

interface Props {
  newsletterContent: NewsletterPopupContent;
  ageGateContent: AgeGatePopupContent;
  cookieBannerContent: CookieBannerPopupContent;
}

export function PopupsClient({
  newsletterContent,
  ageGateContent,
  cookieBannerContent,
}: Props) {
  const { lang, setLang, t } = useLanguage();
  const [newsletterTestEmail, setNewsletterTestEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  function triggerModal() {
    window.dispatchEvent(new CustomEvent("open-newsletter-modal"));
  }

  function resetLocalStorage() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("chateau-newsletter-subscribed");
      window.localStorage.removeItem("chateau-newsletter-dismissed-at");
      window.localStorage.removeItem("age-verified");
      window.localStorage.removeItem("cookie-consent");
      setResetMessage(t("✓ Alle pop-up statussen zijn gereset!", "✓ All pop-up states have been reset!"));
      setTimeout(() => setResetMessage(""), 3000);
    }
  }

  const nlBadge = newsletterContent.badge?.[lang] || "CLUB CHATEAU · NIEUWS UIT DE WINERY";
  const nlHeading = newsletterContent.heading?.[lang] || "Als eerste op de hoogte.";
  const nlDesc = newsletterContent.description?.[lang] || "Ontvang exclusieve kortingen, uitnodigingen voor proeverijen en leuke weetjes en verhalen uit onze winery aan het IJ.";
  const nlPlaceholder = newsletterContent.placeholder?.[lang] || "Jouw e-mailadres";
  const nlBtn = newsletterContent.button_label?.[lang] || "Aanmelden →";
  const nlDisclaimer = newsletterContent.disclaimer?.[lang] || "Uitschrijven kan op elk gewenst moment met één klik.";
  const nlSuccessHeading = newsletterContent.success_heading?.[lang] || "Je staat op de gastenlijst.";
  const nlSuccessDesc = newsletterContent.success_description?.[lang] || "Dank voor je aanmelding. Je ontvangt binnenkort uitnodigingen voor onze nieuwste bottelingen, proeverijen en events.";

  const agEyebrow = ageGateContent.eyebrow?.[lang] || "Chateau Amsterdam";
  const agHeading = ageGateContent.heading?.[lang] || "Ben je 18 jaar of ouder?";
  const agDesc = ageGateContent.description?.[lang] || "Deze site gaat over wijn. Bevestig je leeftijd om verder te gaan.";
  const agConfirm = ageGateContent.btn_confirm?.[lang] || "Ja, ik ben 18+";
  const agDeny = ageGateContent.btn_deny?.[lang] || "Nee";

  const cbText = cookieBannerContent.text?.[lang] || "We gebruiken alleen functionele en anonieme analytische cookies om de website soepel te laten werken. Geen tracking door derden.";
  const cbAccept = cookieBannerContent.btn_accept?.[lang] || "Akkoord";
  const cbSettings = cookieBannerContent.btn_settings?.[lang] || "Instellingen";

  const dismissDays = newsletterContent.dismiss_days?.[lang] || "14";
  const triggerScroll = newsletterContent.trigger_scroll?.[lang] || "50";
  const triggerTimer = newsletterContent.trigger_timer?.[lang] || "30";

  return (
    <div className="popups-showcase" style={{ padding: "130px var(--gutter) 100px", maxWidth: "1100px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--theme-border)", paddingBottom: "32px", marginBottom: "48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--theme-accent-text)", display: "block", marginBottom: "12px" }}>
              Chateau Amsterdam · Klant &amp; Team Review
            </span>
            <h1 style={{ fontStretch: "125%", fontWeight: 800, textTransform: "uppercase", fontSize: "clamp(32px, 4.5vw, 54px)", lineHeight: 1.05, letterSpacing: "-0.01em" }}>
              Pop-ups &amp; Modals Overzicht
            </h1>
            <p style={{ marginTop: "14px", fontSize: "16px", color: "var(--theme-fg-muted)", maxWidth: "68ch", lineHeight: 1.6 }}>
              {t(
                "Op deze pagina staan alle pop-ups, timing-regels en interacties overzichtelijk naast elkaar. Alle teksten en triggers kunnen rechtstreeks vanuit het CMS worden aangepast.",
                "This page provides an overview of all pop-ups, timing rules, and interactions. All copy and triggers can be edited directly from the CMS."
              )}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-start" }}>
            <div style={{ display: "inline-flex", background: "var(--theme-bg-card)", border: "1px solid var(--theme-border)", padding: "4px", borderRadius: "2px" }}>
              <button
                type="button"
                onClick={() => setLang("nl")}
                style={{
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                  fontWeight: lang === "nl" ? 700 : 400,
                  background: lang === "nl" ? "var(--theme-fg)" : "transparent",
                  color: lang === "nl" ? "var(--theme-bg)" : "var(--theme-fg-muted)",
                  borderRadius: "2px",
                  cursor: "pointer",
                }}
              >
                🇳🇱 Nederlands
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                style={{
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                  fontWeight: lang === "en" ? 700 : 400,
                  background: lang === "en" ? "var(--theme-fg)" : "transparent",
                  color: lang === "en" ? "var(--theme-bg)" : "var(--theme-fg-muted)",
                  borderRadius: "2px",
                  cursor: "pointer",
                }}
              >
                🇬🇧 English
              </button>
            </div>

            <button
              type="button"
              onClick={resetLocalStorage}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--theme-accent-text)",
                background: "transparent",
                border: "1px dashed var(--theme-border)",
                padding: "8px 12px",
                borderRadius: "2px",
                cursor: "pointer",
                width: "100%",
                textAlign: "center",
              }}
            >
              🔄 {t("Reset browserstatussen", "Reset browser states")}
            </button>
            {resetMessage && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--theme-accent-text)", textAlign: "center", width: "100%" }}>
                {resetMessage}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Popups */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "36px" }}>
        {/* Card 1: Newsletter Modal */}
        <div style={{ background: "var(--theme-bg-card)", border: "1px solid var(--theme-border)", borderRadius: "4px", padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--theme-accent-text)", fontWeight: 600 }}>
                1. Nieuwsbrief Modal (Club Chateau)
              </span>
              <span style={{ background: "rgba(255, 204, 0, 0.15)", color: "var(--theme-accent-text)", fontSize: "11px", fontFamily: "var(--font-mono)", padding: "2px 8px", borderRadius: "2px" }}>
                Lead Gen
              </span>
            </div>

            {/* Live visual representation */}
            <div style={{ background: "var(--theme-bg)", border: "1px solid var(--theme-border)", borderRadius: "4px", padding: "28px", margin: "16px 0 24px", boxShadow: "0 10px 25px rgba(0,0,0,0.06)", position: "relative" }}>
              <div className="newsletter-badge">
                <span className="newsletter-badge-dot" />
                {nlBadge}
              </div>

              {newsletterSubmitted ? (
                <div style={{ textAlign: "center", padding: "12px 0" }}>
                  <div className="newsletter-success-icon" style={{ width: "42px", height: "42px", fontSize: "20px", margin: "0 auto 12px" }}>✓</div>
                  <h3 style={{ fontStretch: "120%", fontWeight: 800, textTransform: "uppercase", fontSize: "20px" }}>
                    {nlSuccessHeading}
                  </h3>
                  <p style={{ fontSize: "13.5px", color: "var(--theme-fg-muted)", marginTop: "8px" }}>
                    {nlSuccessDesc}
                  </p>
                  <button
                    type="button"
                    onClick={() => setNewsletterSubmitted(false)}
                    style={{ marginTop: "14px", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--theme-accent-text)", textDecoration: "underline", cursor: "pointer" }}
                  >
                    ← {t("Reset formulier", "Reset form")}
                  </button>
                </div>
              ) : (
                <>
                  <h3 style={{ fontStretch: "120%", fontWeight: 800, textTransform: "uppercase", fontSize: "22px", lineHeight: 1.15 }}>
                    {nlHeading}
                  </h3>
                  <p style={{ fontSize: "14px", lineHeight: 1.55, color: "var(--theme-fg-muted)", marginTop: "10px" }}>
                    {nlDesc}
                  </p>

                  <div style={{ marginTop: "20px" }}>
                    <div className="newsletter-input-wrap">
                      <input
                        type="email"
                        placeholder={nlPlaceholder}
                        value={newsletterTestEmail}
                        onChange={(e) => setNewsletterTestEmail(e.target.value)}
                        className="newsletter-input"
                        style={{ padding: "10px 14px", fontSize: "13.5px" }}
                      />
                      <button
                        type="button"
                        className="btn btn--primary"
                        onClick={() => setNewsletterSubmitted(true)}
                        style={{ padding: "10px 18px", fontSize: "12px" }}
                      >
                        {nlBtn}
                      </button>
                    </div>
                    <span style={{ display: "block", marginTop: "10px", fontSize: "11px", color: "var(--theme-fg-muted)", fontFamily: "var(--font-mono)" }}>
                      {nlDisclaimer}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Specifications & Rules */}
            <div style={{ fontSize: "13.5px", lineHeight: 1.6, color: "var(--theme-fg)" }}>
              <strong style={{ display: "block", marginBottom: "6px", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--theme-fg-muted)" }}>
                ⚙️ Huidige Triggers &amp; Specificaties:
              </strong>
              <ul style={{ paddingLeft: "18px", marginBottom: "16px" }}>
                <li><strong>Wanneer:</strong> Pas ná goedkeuring 18+ gate; bij <strong>≥ {triggerScroll}% scroll</strong>, <strong>exit-intent</strong> of <strong>{triggerTimer} sec</strong> timer.</li>
                <li><strong>Vaste trigger:</strong> Ook op elk moment te openen via de <em>"Club Chateau"</em> link in de footer.</li>
                <li><strong>Sluiten:</strong> Via kruisje ✕, Escape-toets, of klik buiten de kaart.</li>
                <li><strong>Bewaartermijn:</strong> <strong>{dismissDays} dagen</strong> stil na wegklikken; <strong>nooit meer</strong> tonen na inschrijving.</li>
              </ul>
            </div>
          </div>

          <div style={{ marginTop: "20px", paddingTop: "18px", borderTop: "1px solid var(--theme-border)", display: "flex", gap: "10px" }}>
            <button
              type="button"
              className="btn btn--primary"
              onClick={triggerModal}
              style={{ fontSize: "12px", padding: "10px 16px" }}
            >
              🚀 {t("Open Live Modal Nu", "Open Live Modal Now")}
            </button>
          </div>
        </div>

        {/* Card 2: Age Gate (18+) */}
        <div style={{ background: "var(--theme-bg-card)", border: "1px solid var(--theme-border)", borderRadius: "4px", padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--theme-accent-text)", fontWeight: 600 }}>
                2. 18+ Leeftijdscontrole (Age Gate)
              </span>
              <span style={{ background: "rgba(23, 20, 14, 0.08)", color: "var(--theme-fg)", fontSize: "11px", fontFamily: "var(--font-mono)", padding: "2px 8px", borderRadius: "2px" }}>
                Wettelijk Verplicht
              </span>
            </div>

            {/* Live visual representation */}
            <div style={{ background: "var(--theme-bg)", border: "1px solid var(--theme-border)", borderRadius: "4px", padding: "28px", margin: "16px 0 24px", textAlign: "center", boxShadow: "0 10px 25px rgba(0,0,0,0.06)" }}>
              <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--theme-fg-muted)", marginBottom: "12px" }}>
                {agEyebrow}
              </span>
              <h3 style={{ fontStretch: "125%", fontWeight: 800, textTransform: "uppercase", fontSize: "22px", lineHeight: 1.15 }}>
                {agHeading}
              </h3>
              <p style={{ marginTop: "10px", fontSize: "14px", lineHeight: 1.55, color: "var(--theme-fg-muted)" }}>
                {agDesc}
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px", flexWrap: "wrap" }}>
                <button type="button" className="btn btn--primary" style={{ padding: "8px 18px", fontSize: "12px" }}>
                  {agConfirm}
                </button>
                <button type="button" className="btn" style={{ padding: "8px 18px", fontSize: "12px" }}>
                  {agDeny}
                </button>
              </div>
            </div>

            {/* Specifications & Rules */}
            <div style={{ fontSize: "13.5px", lineHeight: 1.6, color: "var(--theme-fg)" }}>
              <strong style={{ display: "block", marginBottom: "6px", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--theme-fg-muted)" }}>
                ⚙️ Specificaties &amp; Gedrag:
              </strong>
              <ul style={{ paddingLeft: "18px", marginBottom: "16px" }}>
                <li><strong>Wanneer:</strong> Direct bij het eerste bezoek op <strong>elke pagina</strong>.</li>
                <li><strong>Actie 'Ja':</strong> Modal sluit direct en bezoeker krijgt toegang tot de site.</li>
                <li><strong>Actie 'Nee':</strong> Stuurt de bezoeker direct door naar <code>alcoholinfo.nl</code> (Trimbos-instituut).</li>
                <li><strong>Bewaartermijn:</strong> <strong>Permanent</strong> onthouden in browser (`localStorage`).</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Card 3: Cookie Banner */}
        <div style={{ background: "var(--theme-bg-card)", border: "1px solid var(--theme-border)", borderRadius: "4px", padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--theme-accent-text)", fontWeight: 600 }}>
                3. Cookie &amp; Privacy Banner
              </span>
              <span style={{ background: "rgba(23, 20, 14, 0.08)", color: "var(--theme-fg)", fontSize: "11px", fontFamily: "var(--font-mono)", padding: "2px 8px", borderRadius: "2px" }}>
                AVG / Privacy
              </span>
            </div>

            {/* Live visual representation */}
            <div style={{ background: "var(--theme-bg)", border: "1px solid var(--theme-border)", borderRadius: "4px", padding: "20px", margin: "16px 0 24px", boxShadow: "0 10px 25px rgba(0,0,0,0.06)" }}>
              <p style={{ fontSize: "13px", lineHeight: 1.5, color: "var(--theme-fg-muted)" }}>
                {cbText}
              </p>
              <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                <button type="button" className="btn btn--primary" style={{ padding: "6px 14px", fontSize: "11px" }}>
                  {cbAccept}
                </button>
                <button type="button" className="btn" style={{ padding: "6px 14px", fontSize: "11px" }}>
                  {cbSettings}
                </button>
              </div>
            </div>

            {/* Specifications & Rules */}
            <div style={{ fontSize: "13.5px", lineHeight: 1.6, color: "var(--theme-fg)" }}>
              <strong style={{ display: "block", marginBottom: "6px", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--theme-fg-muted)" }}>
                ⚙️ Specificaties &amp; Privacy:
              </strong>
              <ul style={{ paddingLeft: "18px" }}>
                <li><strong>Locatie:</strong> Subtiele balk onderaan het scherm.</li>
                <li><strong>Analytics:</strong> Gekoppeld aan zelfgehoste, cookieloze Umami Analytics (100% AVG-compliant).</li>
                <li><strong>Bewaartermijn:</strong> Onthoudt de keuze permanent in de browser.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Card 4: Feedback & Iteratie Tips voor Klant */}
        <div style={{ background: "var(--theme-bg-dim)", border: "1px dashed var(--theme-accent)", borderRadius: "4px", padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--theme-accent-text)", fontWeight: 600, display: "block", marginBottom: "12px" }}>
              💡 CMS Beheer
            </span>
            <h3 style={{ fontStretch: "120%", fontWeight: 800, textTransform: "uppercase", fontSize: "20px", lineHeight: 1.2 }}>
              Teksten of timing aanpassen?
            </h3>
            <p style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--theme-fg)", marginTop: "12px" }}>
              Alle teksten, knoplabels en trigger-instellingen (zoals scrollpercentage en timers) kunnen direct door het team worden aangepast in het CMS onder <strong>Pop-ups &amp; Modals</strong>.
            </p>
            <ul style={{ fontSize: "13.5px", lineHeight: 1.6, color: "var(--theme-fg)", paddingLeft: "18px", marginTop: "10px" }}>
              <li>Directe tweetalige bewerking (NL &amp; EN).</li>
              <li>Live voorbeeld tijdens het typen.</li>
              <li>Directe synchronisatie met de live website.</li>
            </ul>
          </div>

          <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--theme-border)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--theme-fg-muted)" }}>
              Mono by Dusty · Chateau Amsterdam Website
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
