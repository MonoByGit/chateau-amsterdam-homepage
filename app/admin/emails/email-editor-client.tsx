// app/admin/emails/email-editor-client.tsx
"use client";

import { useState, useTransition } from "react";
import { saveEmailTemplateAction } from "./actions";
import type { EmailTemplateContent } from "@/lib/content/defaults";

export type TemplateMeta = {
  id: string;
  title: string;
  recipient: string;
  description: string;
  content: EmailTemplateContent;
};

export function EmailEditorClient({ templates }: { templates: TemplateMeta[] }) {
  const [activeTemplateId, setActiveTemplateId] = useState<string>(templates[0].id);
  const [activeLang, setActiveLang] = useState<"nl" | "en">("nl");
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [feedback, setFeedback] = useState<{ status: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [previewKey, setPreviewKey] = useState<number>(Date.now());

  // Form local state per template
  const [formStates, setFormStates] = useState<Record<string, EmailTemplateContent>>(() => {
    const map: Record<string, EmailTemplateContent> = {};
    for (const t of templates) {
      map[t.id] = t.content;
    }
    return map;
  });

  const activeTemplate = templates.find((t) => t.id === activeTemplateId) || templates[0];
  const currentContent = formStates[activeTemplateId] || activeTemplate.content;

  const handleFieldChange = (field: keyof EmailTemplateContent, value: string) => {
    setFormStates((prev) => ({
      ...prev,
      [activeTemplateId]: {
        ...prev[activeTemplateId],
        [field]: {
          ...prev[activeTemplateId][field],
          [activeLang]: value,
        },
      },
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);

    const formData = new FormData();
    const content = formStates[activeTemplateId];

    for (const [key, pair] of Object.entries(content)) {
      formData.set(`${key}_nl`, pair.nl);
      formData.set(`${key}_en`, pair.en);
    }

    startTransition(async () => {
      const res = await saveEmailTemplateAction(activeTemplateId, formData);
      if (res.success) {
        setFeedback({ status: "success", message: "✅ Wijzigingen succesvol opgeslagen!" });
        setPreviewKey(Date.now());
      } else {
        setFeedback({ status: "error", message: res.message });
      }
    });
  };

  const [copied, setCopied] = useState(false);

  const handleCopyHtml = async () => {
    try {
      const res = await fetch(`/api/emails/preview?template=${activeTemplateId}`);
      const html = await res.text();
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy HTML", err);
    }
  };

  const handleDownloadHtml = async () => {
    try {
      const res = await fetch(`/api/emails/preview?template=${activeTemplateId}`);
      const html = await res.text();
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chateau-email-${activeTemplateId}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download HTML", err);
    }
  };

  const iframeSrc = `/api/emails/preview?template=${activeTemplateId}&v=${previewKey}`;

  return (
    <div>
      {/* Header section */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="a-h1">E-mail Studio &amp; Template Editor</h1>
        <p className="a-subtitle">
          Beheer en bewerk alle geautomatiseerde e-mails van Chateau Amsterdam. Wijzigingen zijn direct actief in de productie-mails.
        </p>
      </div>

      {/* Template Selector Tabs */}
      <div className="a-filter-bar" style={{ marginBottom: "1.5rem" }}>
        <div className="a-chip-group" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              className={`a-chip${activeTemplateId === tpl.id ? " is-active" : ""}`}
              onClick={() => {
                setActiveTemplateId(tpl.id);
                setFeedback(null);
              }}
              style={{ cursor: "pointer", fontWeight: activeTemplateId === tpl.id ? 600 : 400 }}
            >
              {tpl.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(340px, 420px) 1fr", gap: "1.5rem", alignItems: "start" }}>
        
        {/* Left Column: Form Editor */}
        <div className="a-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", borderBottom: "1px solid var(--a-border)", paddingBottom: "0.75rem" }}>
            <div>
              <h2 className="a-h2" style={{ fontSize: "1.125rem", margin: 0 }}>
                ✏️ Teksten aanpassen
              </h2>
              <div style={{ fontSize: "0.8125rem", color: "var(--a-text-2)", marginTop: "2px" }}>
                Ontvanger: <strong>{activeTemplate.recipient}</strong>
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
            {/* Subject */}
            <div>
              <label className="a-label" htmlFor="field-subject" style={{ display: "block", marginBottom: "0.375rem" }}>
                Onderwerpregel (Subject Line)
              </label>
              <input
                id="field-subject"
                type="text"
                className="a-input"
                style={{ width: "100%", padding: "0.5rem" }}
                value={currentContent.subject[activeLang] || ""}
                onChange={(e) => handleFieldChange("subject", e.target.value)}
                placeholder="Onderwerp van de e-mail..."
                required
              />
            </div>

            {/* Heading */}
            <div>
              <label className="a-label" htmlFor="field-heading" style={{ display: "block", marginBottom: "0.375rem" }}>
                Koptekst / Titel (Heading)
              </label>
              <input
                id="field-heading"
                type="text"
                className="a-input"
                style={{ width: "100%", padding: "0.5rem" }}
                value={currentContent.heading[activeLang] || ""}
                onChange={(e) => handleFieldChange("heading", e.target.value)}
                placeholder="Koptekst in de e-mail..."
                required
              />
            </div>

            {/* Intro Text */}
            <div>
              <label className="a-label" htmlFor="field-intro" style={{ display: "block", marginBottom: "0.375rem" }}>
                Inleidende tekst (Intro Text)
              </label>
              <textarea
                id="field-intro"
                rows={4}
                className="a-input"
                style={{ width: "100%", padding: "0.5rem", fontFamily: "inherit" }}
                value={currentContent.intro[activeLang] || ""}
                onChange={(e) => handleFieldChange("intro", e.target.value)}
                placeholder="Inleidende tekst..."
                required
              />
            </div>

            {/* Details Label */}
            <div>
              <label className="a-label" htmlFor="field-details" style={{ display: "block", marginBottom: "0.375rem" }}>
                Label van het details-blok (Details Header)
              </label>
              <input
                id="field-details"
                type="text"
                className="a-input"
                style={{ width: "100%", padding: "0.5rem" }}
                value={currentContent.details_label[activeLang] || ""}
                onChange={(e) => handleFieldChange("details_label", e.target.value)}
                placeholder="bijv. Samenvatting van je aanvraag"
                required
              />
            </div>

            {/* Footer note */}
            <div>
              <label className="a-label" htmlFor="field-footer" style={{ display: "block", marginBottom: "0.375rem" }}>
                Afsluitende toelichting / Vragen (Footer Note)
              </label>
              <textarea
                id="field-footer"
                rows={3}
                className="a-input"
                style={{ width: "100%", padding: "0.5rem", fontFamily: "inherit" }}
                value={currentContent.footer_note[activeLang] || ""}
                onChange={(e) => handleFieldChange("footer_note", e.target.value)}
                placeholder="Toelichting bij vragen..."
                required
              />
            </div>

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
          {/* Viewport Control Bar */}
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

            {/* Export & Utility Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={handleCopyHtml}
                className="a-btn a-btn--secondary"
                style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem", cursor: "pointer" }}
                title="Kopieer volledige HTML code voor externe e-mailtools"
              >
                {copied ? "✅ HTML Gekopieerd!" : "📋 HTML Kopiëren"}
              </button>

              <button
                type="button"
                onClick={handleDownloadHtml}
                className="a-btn a-btn--secondary"
                style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem", cursor: "pointer" }}
                title="Download als .html bestand"
              >
                📥 Download
              </button>

              <a
                href={iframeSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="a-btn a-btn--secondary"
                style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem", textDecoration: "none" }}
              >
                ↗ Openen
              </a>
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
              minHeight: "760px",
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
                    <strong>E-mail Preview:</strong> {currentContent.subject[activeLang] || "Chateau Amsterdam"}
                  </div>
                </div>
              ) : null}

              <iframe
                key={`${activeTemplateId}-${previewKey}-${viewport}`}
                src={iframeSrc}
                style={{
                  width: "100%",
                  height: "760px",
                  border: "none",
                  display: "block",
                  background: "#F4F0E8",
                  flexGrow: 1,
                  overflowX: "hidden",
                }}
                title="E-mail Live Preview"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
