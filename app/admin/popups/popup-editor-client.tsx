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
  const [previewLang, setPreviewLang] = useState<"nl" | "en">("nl");
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [newsletter, setNewsletter] = useState<NewsletterPopupContent>(initialNewsletter);
  const [ageGate, setAgeGate] = useState<AgeGatePopupContent>(initialAgeGate);
  const [cookieBanner, setCookieBanner] = useState<CookieBannerPopupContent>(initialCookieBanner);

  // Field change helpers
  function updateNewsletter(field: keyof NewsletterPopupContent, lang: "nl" | "en", value: string) {
    setNewsletter((prev) => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value },
    }));
  }

  function updateAgeGate(field: keyof AgeGatePopupContent, lang: "nl" | "en", value: string) {
    setAgeGate((prev) => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value },
    }));
  }

  function updateCookieBanner(field: keyof CookieBannerPopupContent, lang: "nl" | "en", value: string) {
    setCookieBanner((prev) => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value },
    }));
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatusMessage(null);

    const formData = new FormData();

    if (activeTab === "newsletter") {
      Object.entries(newsletter).forEach(([key, val]) => {
        formData.append(`${key}_nl`, val.nl);
        formData.append(`${key}_en`, val.en);
      });
    } else if (activeTab === "age-gate") {
      Object.entries(ageGate).forEach(([key, val]) => {
        formData.append(`${key}_nl`, val.nl);
        formData.append(`${key}_en`, val.en);
      });
    } else {
      Object.entries(cookieBanner).forEach(([key, val]) => {
        formData.append(`${key}_nl`, val.nl);
        formData.append(`${key}_en`, val.en);
      });
    }

    startTransition(async () => {
      const res = await savePopupConfigAction(activeTab, formData);
      if (res.success) {
        setStatusMessage({ type: "success", text: res.message });
      } else {
        setStatusMessage({ type: "error", text: res.message });
      }
      setTimeout(() => setStatusMessage(null), 4000);
    });
  }

  return (
    <div className="a-content-page" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div className="a-content-header" style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div className="a-content-kicker">CMS · Conversie &amp; Compliance</div>
            <h1 className="a-content-title" style={{ fontSize: "28px", textTransform: "uppercase" }}>
              Pop-ups &amp; Modals Beheer
            </h1>
            <p className="a-content-sub" style={{ marginTop: "6px" }}>
              Beheer teksten, koppen, knoppen en timing van de Club Chateau nieuwsbrief, de 18+ leeftijdscontrole en de cookie banner.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Link
              href="/popups"
              target="_blank"
              className="a-btn a-btn-outline"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}
            >
              <span>🔗 Publieke Showcase</span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" /></svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="a-content-tabs" style={{ display: "flex", borderBottom: "1px solid var(--admin-border)", gap: "4px", marginBottom: "32px" }}>
        <button
          type="button"
          onClick={() => setActiveTab("newsletter")}
          style={{
            padding: "10px 18px",
            fontSize: "13px",
            fontWeight: activeTab === "newsletter" ? 700 : 500,
            borderBottom: activeTab === "newsletter" ? "2px solid var(--admin-fg)" : "2px solid transparent",
            color: activeTab === "newsletter" ? "var(--admin-fg)" : "var(--admin-fg-muted)",
            background: "none",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
          }}
        >
          🍷 1. Club Chateau Nieuwsbrief
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("age-gate")}
          style={{
            padding: "10px 18px",
            fontSize: "13px",
            fontWeight: activeTab === "age-gate" ? 700 : 500,
            borderBottom: activeTab === "age-gate" ? "2px solid var(--admin-fg)" : "2px solid transparent",
            color: activeTab === "age-gate" ? "var(--admin-fg)" : "var(--admin-fg-muted)",
            background: "none",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
          }}
        >
          🔞 2. 18+ Leeftijdscontrole
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("cookie-banner")}
          style={{
            padding: "10px 18px",
            fontSize: "13px",
            fontWeight: activeTab === "cookie-banner" ? 700 : 500,
            borderBottom: activeTab === "cookie-banner" ? "2px solid var(--admin-fg)" : "2px solid transparent",
            color: activeTab === "cookie-banner" ? "var(--admin-fg)" : "var(--admin-fg-muted)",
            background: "none",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
          }}
        >
          🍪 3. Cookie Banner
        </button>
      </div>

      {statusMessage && (
        <div
          style={{
            padding: "12px 18px",
            marginBottom: "24px",
            borderRadius: "4px",
            fontSize: "13.5px",
            fontFamily: "var(--font-mono)",
            background: statusMessage.type === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${statusMessage.type === "success" ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            color: statusMessage.type === "success" ? "#166534" : "#991b1b",
          }}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Main Grid: Form Left, Live Preview Right */}
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "36px", alignItems: "start" }}>
        {/* Form Column */}
        <form onSubmit={handleSave} style={{ background: "var(--admin-card)", border: "1px solid var(--admin-border)", borderRadius: "4px", padding: "28px" }}>
          {activeTab === "newsletter" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ borderBottom: "1px solid var(--admin-border)", paddingBottom: "12px", marginBottom: "4px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Inschrijf Modal Teksten</h3>
                <p style={{ fontSize: "12.5px", color: "var(--admin-fg-muted)" }}>Beheer de teksten van de Club Chateau popup.</p>
              </div>

              {/* Badge */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>Badge Kicker</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <input
                    type="text"
                    value={newsletter.badge.nl}
                    onChange={(e) => updateNewsletter("badge", "nl", e.target.value)}
                    className="a-input"
                    placeholder="NL Badge"
                  />
                  <input
                    type="text"
                    value={newsletter.badge.en}
                    onChange={(e) => updateNewsletter("badge", "en", e.target.value)}
                    className="a-input"
                    placeholder="EN Badge"
                  />
                </div>
              </div>

              {/* Heading */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>Koptekst (Titel)</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <input
                    type="text"
                    value={newsletter.heading.nl}
                    onChange={(e) => updateNewsletter("heading", "nl", e.target.value)}
                    className="a-input"
                    placeholder="NL Titel"
                  />
                  <input
                    type="text"
                    value={newsletter.heading.en}
                    onChange={(e) => updateNewsletter("heading", "en", e.target.value)}
                    className="a-input"
                    placeholder="EN Title"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>Beschrijving (Voordelen)</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <textarea
                    rows={3}
                    value={newsletter.description.nl}
                    onChange={(e) => updateNewsletter("description", "nl", e.target.value)}
                    className="a-input"
                    placeholder="NL Beschrijving"
                  />
                  <textarea
                    rows={3}
                    value={newsletter.description.en}
                    onChange={(e) => updateNewsletter("description", "en", e.target.value)}
                    className="a-input"
                    placeholder="EN Description"
                  />
                </div>
              </div>

              {/* Button & Placeholder */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>Knoptekst</label>
                  <input
                    type="text"
                    value={newsletter.button_label.nl}
                    onChange={(e) => updateNewsletter("button_label", "nl", e.target.value)}
                    className="a-input"
                    style={{ marginBottom: "6px" }}
                    placeholder="NL: Aanmelden →"
                  />
                  <input
                    type="text"
                    value={newsletter.button_label.en}
                    onChange={(e) => updateNewsletter("button_label", "en", e.target.value)}
                    className="a-input"
                    placeholder="EN: Join Club →"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>Input Placeholder</label>
                  <input
                    type="text"
                    value={newsletter.placeholder.nl}
                    onChange={(e) => updateNewsletter("placeholder", "nl", e.target.value)}
                    className="a-input"
                    style={{ marginBottom: "6px" }}
                    placeholder="NL: Jouw e-mailadres"
                  />
                  <input
                    type="text"
                    value={newsletter.placeholder.en}
                    onChange={(e) => updateNewsletter("placeholder", "en", e.target.value)}
                    className="a-input"
                    placeholder="EN: Your email address"
                  />
                </div>
              </div>

              {/* Disclaimer */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>Disclaimer / Uitschrijflink</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <input
                    type="text"
                    value={newsletter.disclaimer.nl}
                    onChange={(e) => updateNewsletter("disclaimer", "nl", e.target.value)}
                    className="a-input"
                    placeholder="NL Disclaimer"
                  />
                  <input
                    type="text"
                    value={newsletter.disclaimer.en}
                    onChange={(e) => updateNewsletter("disclaimer", "en", e.target.value)}
                    className="a-input"
                    placeholder="EN Disclaimer"
                  />
                </div>
              </div>

              {/* Trigger Settings */}
              <div style={{ borderTop: "1px solid var(--admin-border)", paddingTop: "18px", marginTop: "8px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px" }}>⚙️ Triggers &amp; Timing</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--admin-fg-muted)", marginBottom: "4px" }}>Scroll Percentage (%)</label>
                    <input
                      type="number"
                      value={newsletter.trigger_scroll.nl}
                      onChange={(e) => {
                        updateNewsletter("trigger_scroll", "nl", e.target.value);
                        updateNewsletter("trigger_scroll", "en", e.target.value);
                      }}
                      className="a-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--admin-fg-muted)", marginBottom: "4px" }}>Timer (seconden)</label>
                    <input
                      type="number"
                      value={newsletter.trigger_timer.nl}
                      onChange={(e) => {
                        updateNewsletter("trigger_timer", "nl", e.target.value);
                        updateNewsletter("trigger_timer", "en", e.target.value);
                      }}
                      className="a-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--admin-fg-muted)", marginBottom: "4px" }}>Bewaartermijn (dagen)</label>
                    <input
                      type="number"
                      value={newsletter.dismiss_days.nl}
                      onChange={(e) => {
                        updateNewsletter("dismiss_days", "nl", e.target.value);
                        updateNewsletter("dismiss_days", "en", e.target.value);
                      }}
                      className="a-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "age-gate" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ borderBottom: "1px solid var(--admin-border)", paddingBottom: "12px", marginBottom: "4px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700 }}>18+ Leeftijdscontrole Teksten</h3>
                <p style={{ fontSize: "12.5px", color: "var(--admin-fg-muted)" }}>Wettelijke leeftijdsverificatie bij het eerste bezoek.</p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>Kicker Label</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <input
                    type="text"
                    value={ageGate.eyebrow.nl}
                    onChange={(e) => updateAgeGate("eyebrow", "nl", e.target.value)}
                    className="a-input"
                  />
                  <input
                    type="text"
                    value={ageGate.eyebrow.en}
                    onChange={(e) => updateAgeGate("eyebrow", "en", e.target.value)}
                    className="a-input"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>Vraag / Titel</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <input
                    type="text"
                    value={ageGate.heading.nl}
                    onChange={(e) => updateAgeGate("heading", "nl", e.target.value)}
                    className="a-input"
                  />
                  <input
                    type="text"
                    value={ageGate.heading.en}
                    onChange={(e) => updateAgeGate("heading", "en", e.target.value)}
                    className="a-input"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>Uitlegtekst</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <textarea
                    rows={2}
                    value={ageGate.description.nl}
                    onChange={(e) => updateAgeGate("description", "nl", e.target.value)}
                    className="a-input"
                  />
                  <textarea
                    rows={2}
                    value={ageGate.description.en}
                    onChange={(e) => updateAgeGate("description", "en", e.target.value)}
                    className="a-input"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>Bevestigingsknop (Ja)</label>
                  <input
                    type="text"
                    value={ageGate.btn_confirm.nl}
                    onChange={(e) => updateAgeGate("btn_confirm", "nl", e.target.value)}
                    className="a-input"
                    style={{ marginBottom: "6px" }}
                  />
                  <input
                    type="text"
                    value={ageGate.btn_confirm.en}
                    onChange={(e) => updateAgeGate("btn_confirm", "en", e.target.value)}
                    className="a-input"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>Weigerknop (Nee)</label>
                  <input
                    type="text"
                    value={ageGate.btn_deny.nl}
                    onChange={(e) => updateAgeGate("btn_deny", "nl", e.target.value)}
                    className="a-input"
                    style={{ marginBottom: "6px" }}
                  />
                  <input
                    type="text"
                    value={ageGate.btn_deny.en}
                    onChange={(e) => updateAgeGate("btn_deny", "en", e.target.value)}
                    className="a-input"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "cookie-banner" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ borderBottom: "1px solid var(--admin-border)", paddingBottom: "12px", marginBottom: "4px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Cookie Banner Teksten</h3>
                <p style={{ fontSize: "12.5px", color: "var(--admin-fg-muted)" }}>Privacy &amp; AVG-vriendelijke cookieverklaring.</p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>Verklaringstekst</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <textarea
                    rows={3}
                    value={cookieBanner.text.nl}
                    onChange={(e) => updateCookieBanner("text", "nl", e.target.value)}
                    className="a-input"
                  />
                  <textarea
                    rows={3}
                    value={cookieBanner.text.en}
                    onChange={(e) => updateCookieBanner("text", "en", e.target.value)}
                    className="a-input"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>Akkoord Knop</label>
                  <input
                    type="text"
                    value={cookieBanner.btn_accept.nl}
                    onChange={(e) => updateCookieBanner("btn_accept", "nl", e.target.value)}
                    className="a-input"
                    style={{ marginBottom: "6px" }}
                  />
                  <input
                    type="text"
                    value={cookieBanner.btn_accept.en}
                    onChange={(e) => updateCookieBanner("btn_accept", "en", e.target.value)}
                    className="a-input"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>Instellingen Knop</label>
                  <input
                    type="text"
                    value={cookieBanner.btn_settings.nl}
                    onChange={(e) => updateCookieBanner("btn_settings", "nl", e.target.value)}
                    className="a-input"
                    style={{ marginBottom: "6px" }}
                  />
                  <input
                    type="text"
                    value={cookieBanner.btn_settings.en}
                    onChange={(e) => updateCookieBanner("btn_settings", "en", e.target.value)}
                    className="a-input"
                  />
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid var(--admin-border)", display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={isPending}
              className="a-btn a-btn-primary"
              style={{ padding: "10px 24px", fontSize: "13px" }}
            >
              {isPending ? "Opslaan..." : "💾 Wijzigingen Opslaan"}
            </button>
          </div>
        </form>

        {/* Live Preview Column */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, fontFamily: "var(--font-mono)", textTransform: "uppercase", color: "var(--admin-fg-muted)" }}>
              Live Visueel Voorbeeld
            </span>
            <div style={{ display: "inline-flex", background: "var(--admin-card)", border: "1px solid var(--admin-border)", borderRadius: "3px", padding: "2px" }}>
              <button
                type="button"
                onClick={() => setPreviewLang("nl")}
                style={{
                  padding: "4px 10px",
                  fontSize: "11px",
                  fontWeight: previewLang === "nl" ? 700 : 400,
                  background: previewLang === "nl" ? "var(--admin-fg)" : "transparent",
                  color: previewLang === "nl" ? "var(--admin-bg)" : "var(--admin-fg-muted)",
                  border: "none",
                  borderRadius: "2px",
                  cursor: "pointer",
                }}
              >
                NL
              </button>
              <button
                type="button"
                onClick={() => setPreviewLang("en")}
                style={{
                  padding: "4px 10px",
                  fontSize: "11px",
                  fontWeight: previewLang === "en" ? 700 : 400,
                  background: previewLang === "en" ? "var(--admin-fg)" : "transparent",
                  color: previewLang === "en" ? "var(--admin-bg)" : "var(--admin-fg-muted)",
                  border: "none",
                  borderRadius: "2px",
                  cursor: "pointer",
                }}
              >
                EN
              </button>
            </div>
          </div>

          {/* Preview Container */}
          <div style={{ background: "var(--theme-bg)", border: "1px solid var(--admin-border)", borderRadius: "4px", padding: "28px", boxShadow: "0 10px 30px rgba(0,0,0,0.06)", position: "relative" }}>
            {activeTab === "newsletter" && (
              <div>
                <div className="newsletter-badge" style={{ marginBottom: "14px" }}>
                  <span className="newsletter-badge-dot" />
                  {newsletter.badge[previewLang]}
                </div>
                <h3 style={{ fontStretch: "120%", fontWeight: 800, textTransform: "uppercase", fontSize: "21px", lineHeight: 1.15 }}>
                  {newsletter.heading[previewLang]}
                </h3>
                <p style={{ fontSize: "13.5px", lineHeight: 1.55, color: "var(--theme-fg-muted)", marginTop: "10px" }}>
                  {newsletter.description[previewLang]}
                </p>
                <div style={{ marginTop: "18px" }}>
                  <div className="newsletter-input-wrap">
                    <input
                      type="email"
                      readOnly
                      placeholder={newsletter.placeholder[previewLang]}
                      className="newsletter-input"
                      style={{ padding: "8px 12px", fontSize: "13px" }}
                    />
                    <button type="button" className="btn btn--primary" style={{ padding: "8px 16px", fontSize: "11.5px" }}>
                      {newsletter.button_label[previewLang]}
                    </button>
                  </div>
                  <span style={{ display: "block", marginTop: "10px", fontSize: "10.5px", color: "var(--theme-fg-muted)", fontFamily: "var(--font-mono)" }}>
                    {newsletter.disclaimer[previewLang]}
                  </span>
                </div>
              </div>
            )}

            {activeTab === "age-gate" && (
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--theme-fg-muted)", marginBottom: "10px" }}>
                  {ageGate.eyebrow[previewLang]}
                </span>
                <h3 style={{ fontStretch: "125%", fontWeight: 800, textTransform: "uppercase", fontSize: "20px", lineHeight: 1.15 }}>
                  {ageGate.heading[previewLang]}
                </h3>
                <p style={{ marginTop: "10px", fontSize: "13.5px", lineHeight: 1.55, color: "var(--theme-fg-muted)" }}>
                  {ageGate.description[previewLang]}
                </p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "18px" }}>
                  <button type="button" className="btn btn--primary" style={{ padding: "8px 18px", fontSize: "12px" }}>
                    {ageGate.btn_confirm[previewLang]}
                  </button>
                  <button type="button" className="btn" style={{ padding: "8px 18px", fontSize: "12px" }}>
                    {ageGate.btn_deny[previewLang]}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "cookie-banner" && (
              <div>
                <p style={{ fontSize: "13px", lineHeight: 1.5, color: "var(--theme-fg-muted)" }}>
                  {cookieBanner.text[previewLang]}
                </p>
                <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                  <button type="button" className="btn btn--primary" style={{ padding: "6px 14px", fontSize: "11px" }}>
                    {cookieBanner.btn_accept[previewLang]}
                  </button>
                  <button type="button" className="btn" style={{ padding: "6px 14px", fontSize: "11px" }}>
                    {cookieBanner.btn_settings[previewLang]}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
