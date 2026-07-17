// app/admin/wines/wine-form-wizard.tsx
"use client";

import { useState } from "react";
import type { Wine } from "@/lib/db/wines";
import type { PickerMediaItem } from "@/components/admin/image-picker";
import { saveWine } from "./actions";
import { ImageField } from "./image-field";

const STEPS = [
  { key: "foto", label: "Foto" },
  { key: "details", label: "Details" },
  { key: "profiel", label: "Profiel" },
  { key: "publiceren", label: "Publiceren" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

// A single <form> the whole time, steps only toggle which section is
// visible (via CSS display, not conditional unmounting), so every field
// stays in the DOM and its value is still included when the final step
// submits. This gives the "upload a photo, then fill in details, then
// save" flow that was missing, without needing separate pages per step.
export function WineFormWizard({
  wine,
  error,
  media,
}: {
  wine: Wine | null;
  error?: string;
  media: PickerMediaItem[];
}) {
  const [step, setStep] = useState<StepKey>("foto");
  const stepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <form action={saveWine} style={{ maxWidth: "48rem" }}>
      {wine ? <input type="hidden" name="id" value={wine.id} /> : null}
      {error ? (
        <p className="a-alert a-alert--danger" style={{ marginBottom: "1.25rem" }}>
          {error}
        </p>
      ) : null}

      <div className="a-wizard-steps">
        {STEPS.map((s, i) => (
          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              type="button"
              className={`a-wizard-step${step === s.key ? " is-active" : ""}${i < stepIndex ? " is-done" : ""}`}
              onClick={() => setStep(s.key)}
            >
              <span className="a-wizard-step-num">{i + 1}</span>
              {s.label}
            </button>
            {i < STEPS.length - 1 ? <span className="a-wizard-sep" /> : null}
          </div>
        ))}
      </div>

      <div className="a-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: step === "foto" ? "flex" : "none", flexDirection: "column", gap: "0.75rem" }}>
          <span className="a-label">Afbeelding</span>
          <span className="a-hint">Kies een bestaande foto, of upload er direct een nieuwe.</span>
          <ImageField media={media} initialValue={wine?.imageId ?? null} />
        </div>

        <div style={{ display: step === "details" ? "flex" : "none", flexDirection: "column", gap: "1.25rem" }}>
          <label className="a-field">
            <span className="a-label">Naam</span>
            <input required type="text" id="name" name="name" defaultValue={wine?.name} className="a-input" placeholder="Riesling" />
          </label>

          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            <label className="a-field">
              <span className="a-label">Type &amp; regio (NL)</span>
              <span className="a-hint">
                Korte typering, verschijnt naast het flesnummer op de site, geen volledige beschrijving.
              </span>
              <input type="text" id="metaNl" name="metaNl" defaultValue={wine?.metaNl} placeholder="Wit · Pfalz, DE" className="a-input" />
            </label>
            <label className="a-field">
              <span className="a-label">Type &amp; region (EN)</span>
              <span className="a-hint">Short label, same spot on the site, not a full description.</span>
              <input type="text" id="metaEn" name="metaEn" defaultValue={wine?.metaEn} placeholder="White · Pfalz, DE" className="a-input" />
            </label>
          </div>

          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            <label className="a-field">
              <span className="a-label">Tagline (NL)</span>
              <span className="a-hint">Korte, pakkende zin onder de wijnnaam.</span>
              <input type="text" id="tagNl" name="tagNl" defaultValue={wine?.tagNl} placeholder="de klassieker" className="a-input" />
            </label>
            <label className="a-field">
              <span className="a-label">Tagline (EN)</span>
              <span className="a-hint">Short, punchy line under the wine name.</span>
              <input type="text" id="tagEn" name="tagEn" defaultValue={wine?.tagEn} placeholder="the classic" className="a-input" />
            </label>
          </div>
        </div>

        <div style={{ display: step === "profiel" ? "flex" : "none", flexDirection: "column", gap: "1.25rem" }}>
          <span className="a-hint">
            Alles hieronder is optioneel en verschijnt op de detailpagina van deze wijn. Leeg laten mag, vul aan wanneer je de content klaar hebt.
          </span>

          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            <label className="a-field">
              <span className="a-label">Beschrijving (NL)</span>
              <textarea id="descriptionNl" name="descriptionNl" defaultValue={wine?.descriptionNl ?? ""} className="a-input" rows={3} />
            </label>
            <label className="a-field">
              <span className="a-label">Beschrijving (EN)</span>
              <textarea id="descriptionEn" name="descriptionEn" defaultValue={wine?.descriptionEn ?? ""} className="a-input" rows={3} />
            </label>
          </div>

          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            <label className="a-field">
              <span className="a-label">Druif / blend</span>
              <span className="a-hint">Bijv. &ldquo;Chardonnay, macabeo, viognier&rdquo;.</span>
              <input type="text" id="grapes" name="grapes" defaultValue={wine?.grapes ?? ""} className="a-input" />
            </label>
            <label className="a-field">
              <span className="a-label">Jaargang</span>
              <span className="a-hint">Bijv. &ldquo;2023&rdquo; of &ldquo;blend&rdquo;.</span>
              <input type="text" id="vintage" name="vintage" defaultValue={wine?.vintage ?? ""} className="a-input" />
            </label>
            <label className="a-field">
              <span className="a-label">Alcoholpercentage</span>
              <input type="text" id="abv" name="abv" defaultValue={wine?.abv ?? ""} className="a-input" placeholder="13" />
            </label>
          </div>

          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            <label className="a-field">
              <span className="a-label">Type (NL)</span>
              <input type="text" id="wineTypeNl" name="wineTypeNl" defaultValue={wine?.wineTypeNl ?? ""} className="a-input" />
            </label>
            <label className="a-field">
              <span className="a-label">Type (EN)</span>
              <input type="text" id="wineTypeEn" name="wineTypeEn" defaultValue={wine?.wineTypeEn ?? ""} className="a-input" />
            </label>
          </div>

          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            <label className="a-field">
              <span className="a-label">Regio (NL)</span>
              <input type="text" id="regionNl" name="regionNl" defaultValue={wine?.regionNl ?? ""} className="a-input" />
            </label>
            <label className="a-field">
              <span className="a-label">Regio (EN)</span>
              <input type="text" id="regionEn" name="regionEn" defaultValue={wine?.regionEn ?? ""} className="a-input" />
            </label>
          </div>

          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            <label className="a-field">
              <span className="a-label">Landbouwtechniek (NL)</span>
              <input type="text" id="farmingMethodNl" name="farmingMethodNl" defaultValue={wine?.farmingMethodNl ?? ""} className="a-input" />
            </label>
            <label className="a-field">
              <span className="a-label">Landbouwtechniek (EN)</span>
              <input type="text" id="farmingMethodEn" name="farmingMethodEn" defaultValue={wine?.farmingMethodEn ?? ""} className="a-input" />
            </label>
          </div>

          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            <label className="a-field">
              <span className="a-label">Vinificatie (NL)</span>
              <input type="text" id="vinificationNl" name="vinificationNl" defaultValue={wine?.vinificationNl ?? ""} className="a-input" />
            </label>
            <label className="a-field">
              <span className="a-label">Vinificatie (EN)</span>
              <input type="text" id="vinificationEn" name="vinificationEn" defaultValue={wine?.vinificationEn ?? ""} className="a-input" />
            </label>
          </div>

          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            <label className="a-field">
              <span className="a-label">Wijn-spijs suggestie (NL)</span>
              <textarea id="foodPairingNl" name="foodPairingNl" defaultValue={wine?.foodPairingNl ?? ""} className="a-input" rows={2} />
            </label>
            <label className="a-field">
              <span className="a-label">Wijn-spijs suggestie (EN)</span>
              <textarea id="foodPairingEn" name="foodPairingEn" defaultValue={wine?.foodPairingEn ?? ""} className="a-input" rows={2} />
            </label>
          </div>
        </div>

        <div style={{ display: step === "publiceren" ? "flex" : "none", flexDirection: "column", gap: "1.25rem" }}>
          <label className="a-field">
            <span className="a-label">Shopify handle</span>
            <input required type="text" id="shopifyHandle" name="shopifyHandle" defaultValue={wine?.shopifyHandle} className="a-input" />
          </label>

          <label className="a-checkbox-row">
            <input type="checkbox" id="isActive" name="isActive" defaultChecked={wine?.isActive ?? true} className="a-checkbox" />
            <span className="a-label" style={{ fontWeight: 500 }}>
              Actief op de website
            </span>
          </label>
        </div>
      </div>

      <div className="a-wizard-actions">
        <button
          type="button"
          className="a-btn a-btn--secondary"
          onClick={() => setStep(STEPS[Math.max(stepIndex - 1, 0)].key)}
          disabled={stepIndex === 0}
        >
          ← Vorige
        </button>
        {stepIndex < STEPS.length - 1 ? (
          <button type="button" className="a-btn a-btn--primary" onClick={() => setStep(STEPS[stepIndex + 1].key)}>
            Volgende →
          </button>
        ) : (
          <button type="submit" className="a-btn a-btn--primary">
            Opslaan
          </button>
        )}
      </div>
    </form>
  );
}
