// app/admin/popups/popup-editor-client.tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { savePopupConfigAction } from "./actions";
import type {
  NewsletterPopupContent,
  AgeGatePopupContent,
  CookieBannerPopupContent,
} from "@/lib/content/popup-defaults";

export type PopupTab = "newsletter" | "age-gate" | "cookie-banner";

interface Props {
  initialNewsletter: NewsletterPopupContent;
  initialAgeGate: AgeGatePopupContent;
  initialCookieBanner: CookieBannerPopupContent;
}

export function PopupEditorClient({
  initialNewsletter,
  initialAgeGate,
  initialCookieBanner,
}: Props) {
  const [activeTab, setActiveTab] = useState<PopupTab>("newsletter");
  const [activeLang, setActiveLang] = useState<"nl" | "en">("nl");
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [feedback, setFeedback] = useState<{ status: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form states
  const [newsletter, setNewsletter] = useState<NewsletterPopupContent>(initialNewsletter);
  const [ageGate, setAgeGate] = useState<AgeGatePopupContent>(initialAgeGate);
  const [cookieBanner, setCookieBanner] = useState<CookieBannerPopupContent>(initialCookieBanner);

  // Field change helpers
  const handleNewsletterChange = (field: keyof NewsletterPopupContent, value: string) => {
    setNewsletter((prev) => ({
      ...prev,
      [field]: { ...prev[field], [activeLang]: value },
    }));
  };

  const handleAgeGateChange = (field: keyof AgeGatePopupContent, value: string) => {
    setAgeGate((prev) => ({
      ...prev,
      [field]: { ...prev[field], [activeLang]: value },
    }));
  };

  const handleCookieBannerChange = (field: keyof CookieBannerPopupContent, value: string) => {
    setCookieBanner((prev) => ({
      ...prev,
      [field]: { ...prev[field], [activeLang]: value },
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);

    const formData = new FormData();

    if (activeTab === "newsletter") {
      Object.entries(newsletter).forEach(([key, val]) => {
        formData.set(`${key}_nl`, val.nl);
        formData.set(`${key}_en`, val.en);
      });
    } else if (activeTab === "age-gate") {
      Object.entries(ageGate).forEach(([key, val]) => {
        formData.set(`${key}_nl`, val.nl);
        formData.set(`${key}_en`, val.en);
      });
    } else {
      Object.entries(cookieBanner).forEach(([key, val]) => {
        formData.set(`${key}_nl`, val.nl);
        formData.set(`${key}_en`, val.en);
      });
    }

    startTransition(async () => {
      const res = await savePopupConfigAction(activeTab, formData);
      if (res.success) {
        setFeedback({ status: "success", message: "✅ Wijzigingen succesvol opgeslagen!" });
      } else {
        setFeedback({ status: "error", message: res.message });
      }
    });
  };

  const tabs: { id: PopupTab; title: string; recipient: string }[] = [
    {
      id: "newsletter",
      title: "1. Club Chateau: Nieuwsbrief Modal",
      recipient: "Bezoekers bij 50% scroll of exit-intent",
    },
    {
      id: "age-gate",
      title: "2. 18+ Leeftijdscontrole (Age Gate)",
      recipient: "Nieuwe bezoekers bij het allereerste bezoek",
    },
    {
      id: "cookie-banner",
      title: "3. Cookie & Privacy Banner",
      recipient: "Alle websitebezoekers (onderaan)",
    },
  ];

  const currentTabMeta = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <div>
      {/* Header section */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="a-h1">Pop-up Studio &amp; Modal Editor</h1>
        <p className="a-subtitle">
          Beheer en bewerk alle pop-up teksten, compliance instellingen en triggers van Chateau Amsterdam. Wijzigingen zijn direct actief in productie.
        </p>
      </div>

      {/* Pop-up Selector Tabs */}
      <div className="a-filter-bar" style={{ marginBottom: "1.5rem" }}>
        <div className="a-chip-group" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`a-chip${activeTab === tab.id ? " is-active" : ""}`}
              onClick={() => {
                setActiveTab(tab.id);
                setFeedback(null);
              }}
              style={{ cursor: "pointer", fontWeight: activeTab === tab.id ? 600 : 400 }}
            >
              {tab.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(340px, 440px) 1fr", gap: "1.5rem", alignItems: "start" }}>
        
        {/* Left Column: Form Editor */}
        <div className="a-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", borderBottom: "1px solid var(--a-border)", paddingBottom: "0.875rem" }}>
            <div>
              <h2 className="a-h2" style={{ fontSize: "1.125rem", margin: 0 }}>
                ✏️ Teksten aanpassen
              </h2>
              <div style={{ fontSize: "0.8125rem", color: "var(--a-text-2)", marginTop: "2px" }}>
                Doelgroep: <strong>{currentTabMeta.recipient}</strong>
              </div>
            </div>

            {/* Language Switcher */}
            <div className="a-chip-group">
              <button
                type="button"
                className={`a-chip${activeLang === "nl" ? " is-active" : ""}`}
                onClick={() => setActiveLang("nl")}
                style={{ cursor: "pointer", fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
              >
                🇳🇱 Nederlands
              </button>
              <button
                type="button"
                className={`a-chip${activeLang === "en" ? " is-active" : ""}`}
                onClick={() => setActiveLang("en")}
                style={{ cursor: "pointer", fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
              >
                🇬🇧 English
              </button>
            </div>
          </div>

          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
            {/* Tab 1: Newsletter */}
            {activeTab === "newsletter" && (
              <>
                <div>
                  <label className="a-label" htmlFor="nl-badge" style={{ display: "block", marginBottom: "0.375rem" }}>
                    Badge Kicker
                  </label>
                  <input
                    id="nl-badge"
                    type="text"
                    className="a-input"
                    style={{ width: "100%", padding: "0.5rem" }}
                    value={newsletter.badge[activeLang] || ""}
                    onChange={(e) => handleNewsletterChange("badge", e.target.value)}
                    placeholder="bijv. CLUB CHATEAU · NIEUWS UIT DE WINERY"
                    required
                  />
                </div>

                <div>
                  <label className="a-label" htmlFor="nl-heading" style={{ display: "block", marginBottom: "0.375rem" }}>
                    Koptekst / Titel (Heading)
                  </label>
                  <input
                    id="nl-heading"
                    type="text"
                    className="a-input"
                    style={{ width: "100%", padding: "0.5rem" }}
                    value={newsletter.heading[activeLang] || ""}
                    onChange={(e) => handleNewsletterChange("heading", e.target.value)}
                    placeholder="Koptekst van de pop-up..."
                    required
                  />
                </div>

                <div>
                  <label className="a-label" htmlFor="nl-description" style={{ display: "block", marginBottom: "0.375rem" }}>
                    Beschrijving / Voordelen (Description)
                  </label>
                  <textarea
                    id="nl-description"
                    rows={3}
                    className="a-input"
                    style={{ width: "100%", padding: "0.5rem", fontFamily: "inherit" }}
                    value={newsletter.description[activeLang] || ""}
                    onChange={(e) => handleNewsletterChange("description", e.target.value)}
                    placeholder="Wat ontvangt de bezoeker bij aanmelding..."
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label className="a-label" htmlFor="nl-btn" style={{ display: "block", marginBottom: "0.375rem" }}>
                      Knoptekst
                    </label>
                    <input
                      id="nl-btn"
                      type="text"
                      className="a-input"
                      style={{ width: "100%", padding: "0.5rem" }}
                      value={newsletter.button_label[activeLang] || ""}
                      onChange={(e) => handleNewsletterChange("button_label", e.target.value)}
                      placeholder="bijv. Aanmelden →"
                      required
                    />
                  </div>
                  <div>
                    <label className="a-label" htmlFor="nl-placeholder" style={{ display: "block", marginBottom: "0.375rem" }}>
                      Input Placeholder
                    </label>
                    <input
                      id="nl-placeholder"
                      type="text"
                      className="a-input"
                      style={{ width: "100%", padding: "0.5rem" }}
                      value={newsletter.placeholder[activeLang] || ""}
                      onChange={(e) => handleNewsletterChange("placeholder", e.target.value)}
                      placeholder="bijv. Jouw e-mailadres"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="a-label" htmlFor="nl-disclaimer" style={{ display: "block", marginBottom: "0.375rem" }}>
                    Disclaimer / Uitschrijflink (Footer)
                  </label>
                  <input
                    id="nl-disclaimer"
                    type="text"
                    className="a-input"
                    style={{ width: "100%", padding: "0.5rem" }}
                    value={newsletter.disclaimer[activeLang] || ""}
                    onChange={(e) => handleNewsletterChange("disclaimer", e.target.value)}
                    placeholder="Uitschrijftekst..."
                    required
                  />
                </div>

                {/* Trigger settings */}
                <div style={{ borderTop: "1px solid var(--a-border)", paddingTop: "1rem", marginTop: "0.5rem" }}>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--a-text-1)", marginBottom: "0.625rem" }}>
                    ⚙️ Triggers &amp; Timing
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.625rem" }}>
                    <div>
                      <label className="a-label" style={{ fontSize: "0.75rem", color: "var(--a-text-2)", display: "block", marginBottom: "0.25rem" }}>
                        Scroll Diepte
                      </label>
                      <input
                        type="number"
                        className="a-input"
                        style={{ width: "100%", padding: "0.4rem", fontSize: "0.8125rem" }}
                        value={newsletter.trigger_scroll[activeLang] || "50"}
                        onChange={(e) => {
                          handleNewsletterChange("trigger_scroll", e.target.value);
                          setNewsletter((prev) => ({
                            ...prev,
                            trigger_scroll: { nl: e.target.value, en: e.target.value },
                          }));
                        }}
                      />
                      <span style={{ fontSize: "0.6875rem", color: "var(--a-text-3)" }}>% pagina</span>
                    </div>
                    <div>
                      <label className="a-label" style={{ fontSize: "0.75rem", color: "var(--a-text-2)", display: "block", marginBottom: "0.25rem" }}>
                        Timer Duur
                      </label>
                      <input
                        type="number"
                        className="a-input"
                        style={{ width: "100%", padding: "0.4rem", fontSize: "0.8125rem" }}
                        value={newsletter.trigger_timer[activeLang] || "30"}
                        onChange={(e) => {
                          handleNewsletterChange("trigger_timer", e.target.value);
                          setNewsletter((prev) => ({
                            ...prev,
                            trigger_timer: { nl: e.target.value, en: e.target.value },
                          }));
                        }}
                      />
                      <span style={{ fontSize: "0.6875rem", color: "var(--a-text-3)" }}>seconden</span>
                    </div>
                    <div>
                      <label className="a-label" style={{ fontSize: "0.75rem", color: "var(--a-text-2)", display: "block", marginBottom: "0.25rem" }}>
                        Onderdrukking
                      </label>
                      <input
                        type="number"
                        className="a-input"
                        style={{ width: "100%", padding: "0.4rem", fontSize: "0.8125rem" }}
                        value={newsletter.dismiss_days[activeLang] || "14"}
                        onChange={(e) => {
                          handleNewsletterChange("dismiss_days", e.target.value);
                          setNewsletter((prev) => ({
                            ...prev,
                            dismiss_days: { nl: e.target.value, en: e.target.value },
                          }));
                        }}
                      />
                      <span style={{ fontSize: "0.6875rem", color: "var(--a-text-3)" }}>dagen stil</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Tab 2: Age Gate */}
            {activeTab === "age-gate" && (
              <>
                <div>
                  <label className="a-label" htmlFor="ag-eyebrow" style={{ display: "block", marginBottom: "0.375rem" }}>
                    Kicker Label
                  </label>
                  <input
                    id="ag-eyebrow"
                    type="text"
                    className="a-input"
                    style={{ width: "100%", padding: "0.5rem" }}
                    value={ageGate.eyebrow[activeLang] || ""}
                    onChange={(e) => handleAgeGateChange("eyebrow", e.target.value)}
                    placeholder="bijv. Chateau Amsterdam"
                    required
                  />
                </div>

                <div>
                  <label className="a-label" htmlFor="ag-heading" style={{ display: "block", marginBottom: "0.375rem" }}>
                    Vraag / Titel (Heading)
                  </label>
                  <input
                    id="ag-heading"
                    type="text"
                    className="a-input"
                    style={{ width: "100%", padding: "0.5rem" }}
                    value={ageGate.heading[activeLang] || ""}
                    onChange={(e) => handleAgeGateChange("heading", e.target.value)}
                    placeholder="bijv. Ben je 18 jaar of ouder?"
                    required
                  />
                </div>

                <div>
                  <label className="a-label" htmlFor="ag-desc" style={{ display: "block", marginBottom: "0.375rem" }}>
                    Toelichtingstekst (Description)
                  </label>
                  <textarea
                    id="ag-desc"
                    rows={3}
                    className="a-input"
                    style={{ width: "100%", padding: "0.5rem", fontFamily: "inherit" }}
                    value={ageGate.description[activeLang] || ""}
                    onChange={(e) => handleAgeGateChange("description", e.target.value)}
                    placeholder="Toelichting over wijn en leeftijdsverificatie..."
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label className="a-label" htmlFor="ag-confirm" style={{ display: "block", marginBottom: "0.375rem" }}>
                      Bevestigingsknop (Ja)
                    </label>
                    <input
                      id="ag-confirm"
                      type="text"
                      className="a-input"
                      style={{ width: "100%", padding: "0.5rem" }}
                      value={ageGate.btn_confirm[activeLang] || ""}
                      onChange={(e) => handleAgeGateChange("btn_confirm", e.target.value)}
                      placeholder="bijv. Ja, ik ben 18+"
                      required
                    />
                  </div>
                  <div>
                    <label className="a-label" htmlFor="ag-deny" style={{ display: "block", marginBottom: "0.375rem" }}>
                      Weigerknop (Nee)
                    </label>
                    <input
                      id="ag-deny"
                      type="text"
                      className="a-input"
                      style={{ width: "100%", padding: "0.5rem" }}
                      value={ageGate.btn_deny[activeLang] || ""}
                      onChange={(e) => handleAgeGateChange("btn_deny", e.target.value)}
                      placeholder="bijv. Nee"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Tab 3: Cookie Banner */}
            {activeTab === "cookie-banner" && (
              <>
                <div>
                  <label className="a-label" htmlFor="cb-text" style={{ display: "block", marginBottom: "0.375rem" }}>
                    Verklaringstekst (Cookie Policy)
                  </label>
                  <textarea
                    id="cb-text"
                    rows={4}
                    className="a-input"
                    style={{ width: "100%", padding: "0.5rem", fontFamily: "inherit" }}
                    value={cookieBanner.text[activeLang] || ""}
                    onChange={(e) => handleCookieBannerChange("text", e.target.value)}
                    placeholder="Toelichting over privacy-vriendelijke analytics..."
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label className="a-label" htmlFor="cb-accept" style={{ display: "block", marginBottom: "0.375rem" }}>
                      Akkoord Knop
                    </label>
                    <input
                      id="cb-accept"
                      type="text"
                      className="a-input"
                      style={{ width: "100%", padding: "0.5rem" }}
                      value={cookieBanner.btn_accept[activeLang] || ""}
                      onChange={(e) => handleCookieBannerChange("btn_accept", e.target.value)}
                      placeholder="bijv. Akkoord"
                      required
                    />
                  </div>
                  <div>
                    <label className="a-label" htmlFor="cb-settings" style={{ display: "block", marginBottom: "0.375rem" }}>
                      Instellingen Knop
                    </label>
                    <input
                      id="cb-settings"
                      type="text"
                      className="a-input"
                      style={{ width: "100%", padding: "0.5rem" }}
                      value={cookieBanner.btn_settings[activeLang] || ""}
                      onChange={(e) => handleCookieBannerChange("btn_settings", e.target.value)}
                      placeholder="bijv. Instellingen"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Feedback notification */}
            {feedback ? (
              <div
                className={`a-alert ${feedback.status === "success" ? "a-alert--success" : "a-alert--danger"}`}
                style={{ padding: "0.625rem 0.875rem", fontSize: "0.875rem" }}
              >
                {feedback.message}
              </div>
            ) : null}

            {/* Submit Button */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button
                type="submit"
                disabled={isPending}
                className="a-btn a-btn--primary"
                style={{ minWidth: "160px" }}
              >
                {isPending ? "Opslaan..." : "💾 Wijzigingen opslaan"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Viewport Preview */}
        <div>
          {/* Viewport & Link Bar */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.5rem",
              marginBottom: "0.75rem",
            }}
          >
            <div className="a-chip-group">
              <button
                type="button"
                className={`a-chip${viewport === "desktop" ? " is-active" : ""}`}
                onClick={() => setViewport("desktop")}
                style={{ cursor: "pointer", fontSize: "0.75rem" }}
              >
                🖥️ Desktop
              </button>
              <button
                type="button"
                className={`a-chip${viewport === "mobile" ? " is-active" : ""}`}
                onClick={() => setViewport("mobile")}
                style={{ cursor: "pointer", fontSize: "0.75rem" }}
              >
                📱 Mobiel (390px)
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Link
                href="/popups"
                target="_blank"
                className="a-btn a-btn--secondary"
                style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                <span>🔗 Publieke Showcase</span>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" /></svg>
              </Link>
            </div>
          </div>

          {/* Device Frame */}
          <div
            style={{
              background: "#1E1C1A",
              borderRadius: "8px",
              padding: viewport === "mobile" ? "1.5rem 0.5rem" : "0.75rem",
              display: "flex",
              justifyContent: "center",
              boxShadow: "inset 0 2px 10px rgba(0,0,0,0.4)",
              minHeight: "680px",
              overflowX: "hidden",
            }}
          >
            <div
              style={{
                width: viewport === "mobile" ? "390px" : "100%",
                maxWidth: viewport === "mobile" ? "390px" : "100%",
                background: "#ffffff",
                borderRadius: viewport === "mobile" ? "24px" : "6px",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                transition: "all 0.3s ease",
                border: viewport === "mobile" ? "6px solid #2B2825" : "1px solid #D5CEBF",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Desktop Window Titlebar */}
              {viewport === "desktop" ? (
                <div
                  style={{
                    background: "#EBE5D8",
                    padding: "8px 14px",
                    borderBottom: "1px solid #D8D0C0",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", gap: "6px" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#FF5F56", display: "inline-block" }} />
                    <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#FFBD2E", display: "inline-block" }} />
                    <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#27C93F", display: "inline-block" }} />
                  </div>
                  <div style={{ fontSize: "11px", color: "#57534E", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <strong>Pop-up Preview:</strong> {currentTabMeta.title} ({activeLang.toUpperCase()})
                  </div>
                </div>
              ) : null}

              {/* Simulated Website Canvas with Modal Overlay */}
              <div
                style={{
                  width: "100%",
                  minHeight: "600px",
                  background: "#17140E",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: viewport === "mobile" ? "20px 12px" : "36px 24px",
                  flexGrow: 1,
                  boxSizing: "border-box",
                }}
              >
                {/* Backdrop effect */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(23, 20, 14, 0.72)",
                    backdropFilter: "blur(6px)",
                  }}
                />

                {/* Tab 1: Newsletter Card */}
                {activeTab === "newsletter" && (
                  <div
                    style={{
                      position: "relative",
                      zIndex: 2,
                      width: "100%",
                      maxWidth: "460px",
                      background: "#FAF7F2",
                      color: "#17140E",
                      border: "1px solid #E5DFD3",
                      borderRadius: "4px",
                      padding: viewport === "mobile" ? "28px 20px" : "36px 32px",
                      boxShadow: "0 24px 50px rgba(0,0,0,0.45)",
                      boxSizing: "border-box",
                    }}
                  >
                    <button
                      type="button"
                      style={{
                        position: "absolute",
                        top: "14px",
                        right: "14px",
                        width: "30px",
                        height: "30px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(23, 20, 14, 0.06)",
                        border: "none",
                        borderRadius: "50%",
                        color: "#78716C",
                        fontSize: "14px",
                        cursor: "pointer",
                      }}
                      aria-label="Sluiten"
                    >
                      ✕
                    </button>

                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "rgba(23, 20, 14, 0.05)",
                        border: "1px solid rgba(23, 20, 14, 0.1)",
                        padding: "4px 10px",
                        borderRadius: "9999px",
                        fontFamily: "monospace",
                        fontSize: "10px",
                        letterSpacing: "0.1em",
                        fontWeight: 600,
                        color: "#57534E",
                        marginBottom: "14px",
                      }}
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#FFCC00",
                          display: "inline-block",
                          boxShadow: "0 0 8px rgba(255, 204, 0, 0.8)",
                        }}
                      />
                      {newsletter.badge[activeLang] || "CLUB CHATEAU · NIEUWS UIT DE WINERY"}
                    </div>

                    <h2
                      style={{
                        fontFamily: "var(--font-archivo, -apple-system, sans-serif)",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        fontSize: viewport === "mobile" ? "20px" : "24px",
                        lineHeight: 1.15,
                        color: "#17140E",
                        margin: "0 0 10px 0",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {newsletter.heading[activeLang] || "Als eerste op de hoogte."}
                    </h2>

                    <p
                      style={{
                        fontSize: viewport === "mobile" ? "13px" : "14px",
                        lineHeight: 1.55,
                        color: "#57534E",
                        margin: "0 0 20px 0",
                      }}
                    >
                      {newsletter.description[activeLang] || "Ontvang exclusieve kortingen, uitnodigingen voor proeverijen en leuke weetjes en verhalen uit onze winery aan het IJ."}
                    </p>

                    <div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: viewport === "mobile" ? "column" : "row",
                          gap: "8px",
                        }}
                      >
                        <input
                          type="email"
                          readOnly
                          placeholder={newsletter.placeholder[activeLang] || "Jouw e-mailadres"}
                          style={{
                            flex: 1,
                            background: "#FFFFFF",
                            border: "1px solid #D5CEBF",
                            borderRadius: "3px",
                            padding: "10px 14px",
                            fontSize: "13px",
                            color: "#17140E",
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        />
                        <button
                          type="button"
                          style={{
                            background: "#17140E",
                            color: "#FAF7F2",
                            border: "none",
                            borderRadius: "3px",
                            padding: "10px 18px",
                            fontWeight: 700,
                            fontSize: "12px",
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {newsletter.button_label[activeLang] || "Aanmelden →"}
                        </button>
                      </div>

                      <p
                        style={{
                          fontSize: "11px",
                          color: "#78716C",
                          fontFamily: "monospace",
                          margin: "12px 0 0 0",
                          lineHeight: 1.4,
                        }}
                      >
                        {newsletter.disclaimer[activeLang] || "Uitschrijven kan op elk gewenst moment met één klik. Privacy gewaarborgd."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 2: Age Gate Card */}
                {activeTab === "age-gate" && (
                  <div
                    style={{
                      position: "relative",
                      zIndex: 2,
                      width: "100%",
                      maxWidth: "420px",
                      background: "#FAF7F2",
                      color: "#17140E",
                      border: "1px solid #E5DFD3",
                      borderRadius: "4px",
                      padding: "36px 32px",
                      textAlign: "center",
                      boxShadow: "0 24px 50px rgba(0,0,0,0.45)",
                      boxSizing: "border-box",
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        fontFamily: "monospace",
                        fontSize: "11px",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "#78716C",
                        marginBottom: "10px",
                      }}
                    >
                      {ageGate.eyebrow[activeLang] || "Chateau Amsterdam"}
                    </span>

                    <h2
                      style={{
                        fontFamily: "var(--font-archivo, -apple-system, sans-serif)",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        fontSize: viewport === "mobile" ? "20px" : "24px",
                        lineHeight: 1.15,
                        color: "#17140E",
                        margin: "0 0 10px 0",
                      }}
                    >
                      {ageGate.heading[activeLang] || "Ben je 18 jaar of ouder?"}
                    </h2>

                    <p
                      style={{
                        fontSize: viewport === "mobile" ? "13px" : "14px",
                        lineHeight: 1.55,
                        color: "#57534E",
                        margin: "0 0 22px 0",
                      }}
                    >
                      {ageGate.description[activeLang] || "Deze site gaat over wijn. Bevestig je leeftijd om verder te gaan."}
                    </p>

                    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                      <button
                        type="button"
                        style={{
                          background: "#17140E",
                          color: "#FAF7F2",
                          border: "none",
                          borderRadius: "3px",
                          padding: "10px 22px",
                          fontWeight: 700,
                          fontSize: "12px",
                          letterSpacing: "0.04em",
                          cursor: "pointer",
                        }}
                      >
                        {ageGate.btn_confirm[activeLang] || "Ja, ik ben 18+"}
                      </button>
                      <button
                        type="button"
                        style={{
                          background: "transparent",
                          color: "#17140E",
                          border: "1px solid #D5CEBF",
                          borderRadius: "3px",
                          padding: "10px 22px",
                          fontWeight: 600,
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        {ageGate.btn_deny[activeLang] || "Nee"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab 3: Cookie Banner */}
                {activeTab === "cookie-banner" && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "20px",
                      left: "20px",
                      right: "20px",
                      zIndex: 2,
                      background: "#FAF7F2",
                      color: "#17140E",
                      border: "1px solid #E5DFD3",
                      padding: "18px 22px",
                      borderRadius: "4px",
                      boxShadow: "0 14px 36px rgba(0,0,0,0.45)",
                      boxSizing: "border-box",
                    }}
                  >
                    <p style={{ fontSize: "13px", lineHeight: 1.5, color: "#57534E", margin: 0 }}>
                      {cookieBanner.text[activeLang] || "We gebruiken alleen functionele en anonieme analytische cookies om de website soepel te laten werken. Geen tracking door derden."}
                    </p>
                    <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                      <button
                        type="button"
                        style={{
                          background: "#17140E",
                          color: "#FAF7F2",
                          border: "none",
                          borderRadius: "3px",
                          padding: "7px 16px",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {cookieBanner.btn_accept[activeLang] || "Akkoord"}
                      </button>
                      <button
                        type="button"
                        style={{
                          background: "transparent",
                          color: "#17140E",
                          border: "1px solid #D5CEBF",
                          borderRadius: "3px",
                          padding: "7px 16px",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {cookieBanner.btn_settings[activeLang] || "Instellingen"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
