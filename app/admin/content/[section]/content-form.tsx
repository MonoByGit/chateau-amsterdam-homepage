// app/admin/content/[section]/content-form.tsx
"use client";

import { useActionState, useState } from "react";
import { saveSection } from "./actions";

type Block = { fieldKey: string; valueNl: string; valueEn: string };

const IMAGE_FIELD_TITLES: Record<string, string> = {
  // Homepage Hero & Process
  hero_image_url: "📷 Openingsfoto Homepage (Hero Section)",
  step_1_image_url: "📷 Proces Stap 1 Foto — De Druif",
  step_2_image_url: "📷 Proces Stap 2 Foto — De Reis",
  step_3_image_url: "📷 Proces Stap 3 Foto — De Makerij",
  step_4_image_url: "📷 Proces Stap 4 Foto — De Fles",

  // Homepage Routes (Paths)
  path_1_image_url: "📷 Route 1 Sfeerfoto — Tour & Tastings",
  path_2_image_url: "📷 Route 2 Sfeerfoto — Voor Bedrijven / B2B",
  path_3_image_url: "📷 Route 3 Sfeerfoto — De Webshop",

  // Homepage Place
  place_image_url: "📷 Achtergrondfoto Locatie (Bezoek Ons / Kaart)",

  // Tour & Tasting Pagina
  hero_photo_url: "📷 Tour & Tasting — Openingsfoto (Hero)",
  tour_main_photo_url: "📷 Tour & Tasting — Grote Foto (Tussen de tanks)",
  tour_detail_photo_url: "📷 Tour & Tasting — Detail Foto (Druiven)",
  tasting_main_photo_url: "📷 Tour & Tasting — Proeverij Foto (Tafel)",
  reserve_photo_url: "📷 Tour & Tasting — Reserveren Sectie Foto",

  // Voor Bedrijven Pagina
  intro_photo_url: "📷 Voor Bedrijven — Introductie Sfeerfoto",
};

const PRESET_ASSETS = [
  { label: "🥂 Proosten Sfeer (Tour & Tasting)", url: "/assets/tasting-hero.jpg" },
  { label: "📍 Gouden 3D Kaart Noord", url: "/assets/place-map.jpg" },
  { label: "🍇 Pluk Verse Druiven", url: "/assets/step-druif.jpg" },
  { label: "🚛 Gekoeld Transport", url: "/assets/step-reis.png" },
  { label: "🏭 Makerij & RVS Vaten", url: "/assets/step-makerij.jpg" },
  { label: "🍾 Bottellijn & Fles", url: "/assets/step-fles.jpg" },
  { label: "🍷 Proeverij op Vat", url: "/assets/path-taste.jpg" },
  { label: "🍽️ Bedrijven Lang Gedekte Tafel", url: "/assets/path-pour.jpg" },
  { label: "📦 Webshop Fles uit Doos", url: "/assets/path-drink.png" },
  { label: "🏛️ Winery Exterieur Sfeer", url: "/assets/hero-winery.jpg" },
  { label: "🏭 Winery Hal Binnen", url: "/assets/place-hal.jpg" },
];

async function submitSection(section: string, page: string, _prevState: string | null, formData: FormData): Promise<string> {
  await saveSection(section, page, formData);
  return "Opgeslagen";
}

function formatFieldLabel(key: string): { title: string; isImage: boolean } {
  const isImage = key.includes("image_url") || key.includes("photo");
  if (isImage && IMAGE_FIELD_TITLES[key]) {
    return { title: IMAGE_FIELD_TITLES[key], isImage: true };
  }
  const humanized = key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: isImage ? `🖼️ Foto: ${humanized}` : humanized,
    isImage,
  };
}

function ImageFieldInput({ fieldKey, initialValue }: { fieldKey: string; initialValue: string }) {
  const [val, setVal] = useState(initialValue);
  const [imgError, setImgError] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%" }}>
      <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Visual Live Image Thumbnail Preview */}
        <div style={{ flexShrink: 0 }}>
          <span className="a-label" style={{ marginBottom: "0.375rem", display: "block", fontSize: "0.75rem" }}>
            Visuele weergave:
          </span>
          <div
            style={{
              width: "180px",
              height: "115px",
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid var(--a-border)",
              background: "var(--a-surface-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {val && !imgError ? (
              <img
                src={val}
                alt="Voorbeeld"
                onError={() => setImgError(true)}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ fontSize: "0.75rem", color: "var(--a-text-muted)", textAlign: "center", padding: "0.5rem" }}>
                {imgError ? "⚠️ Afbeelding niet gevonden" : "Geen foto ingesteld"}
              </div>
            )}
          </div>
        </div>

        {/* Input Field & Preset Quick Select */}
        <div style={{ flex: 1, minWidth: "260px" }}>
          <label className="a-field">
            <span className="a-label">Afbeeldingspad of URL</span>
            <input
              type="text"
              name={`${fieldKey}__nl`}
              value={val}
              onChange={(e) => {
                setVal(e.target.value);
                setImgError(false);
              }}
              className="a-input"
              placeholder="/assets/place-map.jpg of https://..."
            />
            <input type="hidden" name={`${fieldKey}__en`} value={val} />
          </label>

          <div style={{ marginTop: "0.625rem", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--a-text-muted)" }}>Snel een sfeerafbeelding kiezen:</span>
            <select
              className="a-input a-select"
              style={{ fontSize: "0.75rem", padding: "0.375rem 2.5rem 0.375rem 0.625rem", height: "auto", cursor: "pointer" }}
              onChange={(e) => {
                if (e.target.value) {
                  setVal(e.target.value);
                  setImgError(false);
                }
              }}
              value=""
            >
              <option value="">-- Kies een foto uit de bibliotheek --</option>
              {PRESET_ASSETS.map((asset) => (
                <option key={asset.url} value={asset.url}>
                  {asset.label} ({asset.url})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContentForm({ section, page = "home", blocks }: { section: string; page?: string; blocks: Block[] }) {
  const [status, formAction, isPending] = useActionState(submitSection.bind(null, section, page), null);

  return (
    <form action={formAction} style={{ marginTop: "1.5rem" }}>
      <div className="a-card">
        {blocks.map((block) => {
          const meta = formatFieldLabel(block.fieldKey);
          return (
            <div key={block.fieldKey} className="a-card-row">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="a-label" style={{ fontWeight: 600, color: meta.isImage ? "var(--a-accent-text)" : "var(--a-text)" }}>
                  {meta.title}
                </span>
                <span className="a-eyebrow" style={{ opacity: 0.5 }}>{block.fieldKey}</span>
              </div>
              <div style={{ marginTop: "0.625rem", display: "grid", gap: "1rem", gridTemplateColumns: meta.isImage ? "1fr" : "repeat(auto-fit, minmax(240px, 1fr))" }}>
                {meta.isImage ? (
                  <ImageFieldInput fieldKey={block.fieldKey} initialValue={block.valueNl} />
                ) : (
                  <>
                    <label className="a-field">
                      <span className="a-label">Nederlands (NL)</span>
                      <textarea
                        name={`${block.fieldKey}__nl`}
                        defaultValue={block.valueNl}
                        rows={2}
                        className="a-textarea"
                      />
                    </label>
                    <label className="a-field">
                      <span className="a-label">Engels (EN)</span>
                      <textarea
                        name={`${block.fieldKey}__en`}
                        defaultValue={block.valueEn}
                        rows={2}
                        className="a-textarea"
                      />
                    </label>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <button type="submit" disabled={isPending} className="a-btn a-btn--primary">
          {isPending ? "Bezig met opslaan…" : "Opslaan"}
        </button>
        {status ? <span className="a-badge a-badge--success">✓ {status}</span> : null}
      </div>

      {status ? (
        <div
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            zIndex: 999,
            background: "#1c1917",
            color: "#f5f5f4",
            border: "1px solid var(--a-accent, #cda757)",
            borderRadius: "8px",
            padding: "0.875rem 1.25rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          <span>✨ Wijzigingen succesvol opgeslagen & direct live op de site!</span>
        </div>
      ) : null}
    </form>
  );
}
