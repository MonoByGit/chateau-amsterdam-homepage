// app/admin/availability/sync-card.tsx
"use client";

import { useState, useTransition } from "react";
import { saveIcalSyncUrl, triggerGoogleCalendarSync } from "./actions";

export function SyncCard({ initialIcalUrl }: { initialIcalUrl: string }) {
  const [icalUrl, setIcalUrl] = useState(initialIcalUrl);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSave = (formData: FormData) => {
    startTransition(async () => {
      const res = await saveIcalSyncUrl(formData);
      setFeedback({ type: res.success ? "success" : "error", text: res.message });
    });
  };

  const handleSyncNow = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await triggerGoogleCalendarSync();
      setFeedback({ type: res.success ? "success" : "error", text: res.message });
    });
  };

  return (
    <div className="a-card" style={{ padding: "1.25rem", marginBottom: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            📅 Google Workspace Calendar Koppeling (iCal Sync)
          </h3>
          <p className="a-subtitle" style={{ margin: "0.25rem 0 0 0", fontSize: "0.8125rem" }}>
            Koppel de Google Calendar van Chateau Amsterdam. Afspraken of sluitingen in Google Calendar blokkeren automatisch de tijden op de site.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSyncNow}
          disabled={isPending || !icalUrl}
          className="a-btn a-btn--primary"
          style={{ whiteSpace: "nowrap" }}
        >
          {isPending ? "Bezig met sync..." : "🔄 Nu Synchroniseren"}
        </button>
      </div>

      <form action={handleSave} style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <label className="a-field">
          <span className="a-label">Geheime iCal URL van Google Calendar</span>
          <input
            name="icalUrl"
            type="url"
            className="a-input"
            placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
            value={icalUrl}
            onChange={(e) => setIcalUrl(e.target.value)}
          />
        </label>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
          <span className="a-hint" style={{ fontSize: "0.75rem" }}>
            💡 <strong>Waar te vinden in Google Calendar?</strong> Instellingen van de agenda → Agenda integreren → <em>Geheim adres in iCal-indeling</em>.
          </span>
          <button type="submit" disabled={isPending} className="a-btn a-btn--secondary" style={{ fontSize: "0.8125rem" }}>
            URL Opslaan
          </button>
        </div>
      </form>

      {feedback ? (
        <div
          style={{
            marginTop: "1rem",
            padding: "0.625rem 0.875rem",
            borderRadius: "var(--a-r)",
            fontSize: "0.8125rem",
            background: feedback.type === "success" ? "rgba(72, 187, 120, 0.12)" : "rgba(229, 62, 62, 0.12)",
            color: feedback.type === "success" ? "var(--a-success)" : "var(--a-danger)",
            border: `1px solid ${feedback.type === "success" ? "var(--a-success)" : "var(--a-danger)"}`,
          }}
        >
          {feedback.text}
        </div>
      ) : null}
    </div>
  );
}
