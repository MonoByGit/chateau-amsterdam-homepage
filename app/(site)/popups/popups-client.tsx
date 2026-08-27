// app/(site)/popups/popups-client.tsx
"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/language";

export function PopupsClient() {
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
                "Op deze pagina staan alle pop-ups, timing-regels en interacties overzichtelijk naast elkaar. Zo kun je direct de opmaak beoordelen, teksten testen en eenvoudig feedback geven.",
                "This page provides an overview of all pop-ups, timing rules, and interactions. You can review layouts, test copy, and iterate easily."
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
                {t("CLUB CHATEAU · NIEUWS UIT DE WINERY", "CLUB CHATEAU · WINERY DISPATCHES")}
              </div>

              {newsletterSubmitted ? (
                <div style={{ textAlign: "center", padding: "12px 0" }}>
                  <div className="newsletter-success-icon" style={{ width: "42px", height: "42px", fontSize: "20px", margin: "0 auto 12px" }}>✓</div>
                  <h3 style={{ fontStretch: "120%", fontWeight: 800, textTransform: "uppercase", fontSize: "20px" }}>
                    {t("Je staat op de gastenlijst.", "You are on the guestlist.")}
                  </h3>
                  <p style={{ fontSize: "13.5px", color: "var(--theme-fg-muted)", marginTop: "8px" }}>
                    {t(
                      "Dank voor je aanmelding. Je ontvangt binnenkort uitnodigingen voor onze nieuwste bottelingen, proeverijen en events.",
                      "Thank you for joining. You'll receive invitations for new releases, exclusive tastings and winery events."
                    )}
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
                    {t("Als eerste op de hoogte.", "Be the first to know.")}
                  </h3>
                  <p style={{ fontSize: "14px", lineHeight: 1.55, color: "var(--theme-fg-muted)", marginTop: "10px" }}>
                    {t(
                      "Ontvang exclusieve kortingen, uitnodigingen voor proeverijen en leuke weetjes en verhalen uit onze winery aan het IJ.",
                      "Receive exclusive discounts, invitations to tastings, and stories & wine facts from our winery on the IJ waterfront."
                    )}
                  </p>

                  <div style={{ marginTop: "20px" }}>
                    <div className="newsletter-input-wrap">
                      <input
                        type="email"
                        placeholder={t("Jouw e-mailadres", "Your email address")}
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
                        {t("Aanmelden →", "Join Club →")}
                      </button>
                    </div>
                    <span style={{ display: "block", marginTop: "10px", fontSize: "11px", color: "var(--theme-fg-muted)", fontFamily: "var(--font-mono)" }}>
                      {t("Uitschrijven kan op elk gewenst moment met één klik.", "Unsubscribe anytime with one click.")}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Specifications & Rules */}
            <div style={{ fontSize: "13.5px", lineHeight: 1.6, color: "var(--theme-fg)" }}>
              <strong style={{ display: "block", marginBottom: "6px", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--theme-fg-muted)" }}>
                ⚙️ Specificaties &amp; Triggers:
              </strong>
              <ul style={{ paddingLeft: "18px", marginBottom: "16px" }}>
                <li><strong>Wanneer:</strong> Pas ná goedkeuring 18+ gate; bij <strong>≥ 50% scroll</strong>, <strong>exit-intent</strong> (muis naar boven) of 30 sec tijd.</li>
                <li><strong>Vaste trigger:</strong> Ook op elk moment te openen via de <em>"Club Chateau"</em> link in de footer.</li>
                <li><strong>Sluiten:</strong> Via kruisje ✕, Escape-toets, of klik buiten de kaart.</li>
                <li><strong>Bewaartermijn:</strong> <strong>14 dagen</strong> stil na wegklikken; <strong>nooit meer</strong> tonen na inschrijving.</li>
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
                Chateau Amsterdam
              </span>
              <h3 style={{ fontStretch: "125%", fontWeight: 800, textTransform: "uppercase", fontSize: "22px", lineHeight: 1.15 }}>
                {t("Ben je 18 jaar of ouder?", "Are you 18 years or older?")}
              </h3>
              <p style={{ marginTop: "10px", fontSize: "14px", lineHeight: 1.55, color: "var(--theme-fg-muted)" }}>
                {t(
                  "Deze site gaat over wijn. Bevestig je leeftijd om verder te gaan.",
                  "This site is about wine. Please confirm your age to continue."
                )}
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px", flexWrap: "wrap" }}>
                <button type="button" className="btn btn--primary" style={{ padding: "8px 18px", fontSize: "12px" }}>
                  {t("Ja, ik ben 18+", "Yes, I'm 18+")}
                </button>
                <button type="button" className="btn" style={{ padding: "8px 18px", fontSize: "12px" }}>
                  {t("Nee", "No")}
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
                {t(
                  "We gebruiken alleen functionele en anonieme analytische cookies om de website soepel te laten werken. Geen tracking door derden.",
                  "We only use functional and privacy-friendly analytics cookies to ensure a smooth experience. No third-party tracking."
                )}
              </p>
              <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                <button type="button" className="btn btn--primary" style={{ padding: "6px 14px", fontSize: "11px" }}>
                  {t("Akkoord", "Accept")}
                </button>
                <button type="button" className="btn" style={{ padding: "6px 14px", fontSize: "11px" }}>
                  {t("Instellingen", "Settings")}
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
              💡 Feedback &amp; Iteratie Gids
            </span>
            <h3 style={{ fontStretch: "120%", fontWeight: 800, textTransform: "uppercase", fontSize: "20px", lineHeight: 1.2 }}>
              Hoe feedback doorgeven?
            </h3>
            <p style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--theme-fg)", marginTop: "12px" }}>
              Wil je iets aanpassen aan de pop-ups? Let bij feedback vooral op:
            </p>
            <ul style={{ fontSize: "13.5px", lineHeight: 1.6, color: "var(--theme-fg)", paddingLeft: "18px", marginTop: "10px" }}>
              <li><strong>Koptekst:</strong> Spreekt <em>"Als eerste op de hoogte"</em> aan, of liever een specifiekere actie (bijv. <em>"Club Chateau"</em> of <em>"Ontvang 10% welkomstkorting"</em>)?</li>
              <li><strong>Voordelen/Belofte:</strong> Welke voordelen willen we precies benadrukken (korting, wijnweetjes, secret tastings)?</li>
              <li><strong>Timing:</strong> Vind je 50% scroll prettig of wil je hem sneller / later zien verschijnen?</li>
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
