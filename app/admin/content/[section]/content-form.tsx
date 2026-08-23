// app/admin/content/[section]/content-form.tsx
"use client";

import { useActionState, useState } from "react";
import { restoreSectionVersion, saveSection } from "./actions";
import { parseImageSrc } from "@/lib/content/defaults";
import type { ContentVersionRow } from "@/lib/db/content";

type Block = { fieldKey: string; valueNl: string; valueEn: string };

function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function VersionHistory({
  versions,
  onRestore,
  isRestoring,
}: {
  versions: ContentVersionRow[];
  onRestore: (versionId: string, label: string) => Promise<void>;
  isRestoring: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!versions || versions.length === 0) return null;

  const latest = versions[0];

  return (
    <div
      className="a-card"
      style={{
        marginBottom: "1.5rem",
        padding: 0,
        overflow: "hidden",
        border: "1px solid var(--a-border)",
        background: "var(--a-surface)",
      }}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "0.875rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          userSelect: "none",
          background: "var(--a-surface)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "1.1rem" }}>🕒</span>
          <div>
            <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--a-text)" }}>
              Versiegeschiedenis & Backups
            </span>
            <span style={{ marginLeft: "0.5rem", fontSize: "0.8125rem", color: "var(--a-text-2)" }}>
              Laatst opgeslagen: {formatDate(latest.createdAt)}
            </span>
          </div>
          {latest.note && (
            <span className="a-badge a-badge--info" style={{ fontSize: "0.6875rem" }}>
              {latest.note}
            </span>
          )}
        </div>
        <button
          type="button"
          className="a-btn a-btn--secondary"
          style={{ fontSize: "0.75rem", padding: "0.3125rem 0.75rem" }}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          {isOpen ? "▲ Verberg geschiedenis" : `▼ Bekijk eerdere momentopnames (${versions.length}/5)`}
        </button>
      </div>

      {isOpen && (
        <div
          style={{
            borderTop: "1px solid var(--a-border)",
            padding: "1rem 1.25rem",
            background: "var(--a-surface-2)",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--a-text-2)" }}>
            Het systeem bewaart automatisch de <strong>laatste 5 momentopnames</strong> van deze sectie. Je kunt te allen tijde terugkeren naar een eerdere staat:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.25rem" }}>
            {versions.map((ver, idx) => {
              const isCurrent = idx === 0;
              return (
                <div
                  key={ver.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 1rem",
                    borderRadius: "4px",
                    background: isCurrent ? "var(--a-surface)" : "transparent",
                    border: isCurrent ? "1px solid var(--a-border-strong)" : "1px solid var(--a-border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontSize: "0.875rem" }}>{isCurrent ? "🟢" : "⚪"}</span>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <strong style={{ fontSize: "0.8125rem", color: "var(--a-text)" }}>
                          {formatDate(ver.createdAt)}
                        </strong>
                        {isCurrent && (
                          <span className="a-badge a-badge--success" style={{ fontSize: "0.6875rem" }}>
                            Huidige live versie
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--a-text-2)" }}>
                        {ver.note || "Opgeslagen via CMS"}
                      </span>
                    </div>
                  </div>

                  {!isCurrent && (
                    <button
                      type="button"
                      disabled={isRestoring}
                      className="a-btn a-btn--secondary"
                      style={{ fontSize: "0.75rem", padding: "0.3125rem 0.625rem" }}
                      onClick={() => onRestore(ver.id, formatDate(ver.createdAt))}
                    >
                      {isRestoring ? "Herstellen…" : "⏪ Terugzetten naar dit moment"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function ContentForm({
  section,
  page = "home",
  blocks,
  versions = [],
}: {
  section: string;
  page?: string;
  blocks: Block[];
  versions?: ContentVersionRow[];
}) {
  const [status, formAction, isPending] = useActionState(submitSection.bind(null, section, page), null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  async function handleRestore(versionId: string, label: string) {
    const confirmed = window.confirm(`Weet je zeker dat je alle teksten van deze sectie wilt terugzetten naar de momentopname van ${label}?`);
    if (!confirmed) return;

    try {
      setIsRestoring(true);
      await restoreSectionVersion(versionId);
      setRestoreMessage(`Succesvol teruggezet naar de versie van ${label}`);
      setTimeout(() => {
        window.location.reload();
      }, 600);
    } catch (err) {
      console.error(err);
      alert("Er is een fout opgetreden bij het herstellen van de versie.");
      setIsRestoring(false);
    }
  }

  return (
    <form action={formAction} style={{ marginTop: "1.5rem" }}>
      <VersionHistory versions={versions} onRestore={handleRestore} isRestoring={isRestoring} />

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
        <button type="submit" disabled={isPending || isRestoring} className="a-btn a-btn--primary">
          {isPending ? "Bezig met opslaan…" : "Opslaan"}
        </button>
        {status ? <span className="a-badge a-badge--success">✓ {status}</span> : null}
      </div>

      {(status || restoreMessage) ? (
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
          <span>✨ {restoreMessage || "Wijzigingen succesvol opgeslagen & direct live op de site!"}</span>
        </div>
      ) : null}
    </form>
  );
}


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
  { label: "🍽️ Bedrijven Gedekte Tafel met Kaarsen (B2B)", url: "/assets/b2b-hero.jpg" },
  { label: "🍷 Groothandel Flessen Wand (B2B)", url: "/assets/b2b-wholesale.jpg" },
  { label: "📦 Webshop Fles uit Doos Til", url: "/assets/path-drink.png" },
  { label: "🍾 Bottellijn Glazen Flessen (Proces Stap 4)", url: "/assets/step-fles.jpg" },
  { label: "📍 Gouden 3D Kaart Noord", url: "/assets/place-map.jpg" },
  { label: "🍇 Pluk Verse Druiven", url: "/assets/step-druif.jpg" },
  { label: "🚛 Gekoeld Transport", url: "/assets/step-reis.png" },
  { label: "🏭 Makerij & RVS Vaten", url: "/assets/step-makerij.jpg" },
  { label: "🍷 Proeverij Flight op Vat met Borrelplanken", url: "/assets/path-taste.jpg" },
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
  const [isDragging, setIsDragging] = useState(false);

  const parsed = parseImageSrc(val);

  // Calculate percentage focal point coordinates for visual reticle marker
  let focalX = 50;
  let focalY = 50;

  if (val.includes("#")) {
    const hash = val.split("#")[1];
    if (hash === "top") { focalX = 50; focalY = 0; }
    else if (hash === "bottom") { focalX = 50; focalY = 100; }
    else if (hash === "left") { focalX = 0; focalY = 50; }
    else if (hash === "right") { focalX = 100; focalY = 50; }
    else if (hash === "top-left") { focalX = 0; focalY = 0; }
    else if (hash === "top-right") { focalX = 100; focalY = 0; }
    else if (hash === "bottom-left") { focalX = 0; focalY = 100; }
    else if (hash === "bottom-right") { focalX = 100; focalY = 100; }
    else {
      const pMatch = hash.match(/^(\d+)p(\d+)p$/);
      if (pMatch) {
        focalX = parseInt(pMatch[1], 10);
        focalY = parseInt(pMatch[2], 10);
      }
    }
  }

  function handlePoint(e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const xPct = Math.max(0, Math.min(100, Math.round(((clientX - rect.left) / rect.width) * 100)));
    const yPct = Math.max(0, Math.min(100, Math.round(((clientY - rect.top) / rect.height) * 100)));

    const cleanUrl = val.split("#")[0];
    const updated = (xPct === 50 && yPct === 50) ? cleanUrl : `${cleanUrl}#${xPct}p${yPct}p`;
    setVal(updated);
    setImgError(false);
  }

  function handlePosChange(newPos: string) {
    const cleanUrl = val.split("#")[0];
    const updated = newPos === "center" ? cleanUrl : `${cleanUrl}#${newPos}`;
    setVal(updated);
    setImgError(false);
  }

  const currentSelectVal = val.includes("#") ? (val.split("#")[1].includes("p") ? "custom" : val.split("#")[1]) : "center";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%" }}>
      <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Visual Drag & Click Focal Point Thumbnail Container */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.375rem" }}>
            <span className="a-label" style={{ fontSize: "0.75rem" }}>
              🎯 Sleep / Klik uitsnede:
            </span>
            <span style={{ fontSize: "0.7rem", color: "var(--a-accent, #cda757)", fontWeight: 600 }}>
              {focalX}% {focalY}%
            </span>
          </div>
          <div
            onMouseDown={(e) => { setIsDragging(true); handlePoint(e); }}
            onMouseMove={(e) => { if (isDragging) handlePoint(e); }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onTouchStart={(e) => { setIsDragging(true); handlePoint(e); }}
            onTouchMove={(e) => { if (isDragging) handlePoint(e); }}
            onTouchEnd={() => setIsDragging(false)}
            style={{
              width: "190px",
              height: "120px",
              borderRadius: "8px",
              overflow: "hidden",
              border: "2px solid var(--a-border-strong)",
              background: "var(--a-surface-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              cursor: "crosshair",
              userSelect: "none",
              boxShadow: isDragging ? "0 0 0 3px var(--a-accent-soft)" : "none",
              transition: "box-shadow 0.15s ease",
            }}
            title="Klik of sleep de muis over deze foto om het exacte focuspunt van de uitsnede in te stellen"
          >
            {parsed.src && !imgError ? (
              <>
                <img
                  src={parsed.src}
                  alt="Voorbeeld uitsnede"
                  onError={() => setImgError(true)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: parsed.objectPosition || "50% 50%",
                    pointerEvents: "none",
                  }}
                />

                {/* Golden Target Reticle Crosshair Marker */}
                <div
                  style={{
                    position: "absolute",
                    left: `${focalX}%`,
                    top: `${focalY}%`,
                    transform: "translate(-50%, -50%)",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    border: "2px solid #ffffff",
                    backgroundColor: "rgba(205, 167, 87, 0.85)",
                    boxShadow: "0 0 10px rgba(0,0,0,0.6)",
                    pointerEvents: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#fff" }} />
                </div>

                {/* Subtle Drag Hint Overlay */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "4px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "rgba(0,0,0,0.65)",
                    color: "#fff",
                    fontSize: "0.625rem",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    pointerEvents: "none",
                    whiteSpace: "nowrap",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  🖐️ Sleep om te richten
                </div>
              </>
            ) : (
              <div style={{ fontSize: "0.75rem", color: "var(--a-text-muted)", textAlign: "center", padding: "0.5rem" }}>
                {imgError ? "⚠️ Afbeelding niet gevonden" : "Geen foto ingesteld"}
              </div>
            )}
          </div>
        </div>

        {/* Input Field, Preset Quick Select & Focus Control */}
        <div style={{ flex: 1, minWidth: "260px", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
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

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "180px" }}>
              <span className="a-label" style={{ fontSize: "0.75rem", marginBottom: "0.25rem", display: "block" }}>
                🎯 Preset of Slepen ({focalX}% {focalY}%):
              </span>
              <select
                className="a-input a-select"
                style={{ fontSize: "0.75rem", padding: "0.375rem 2.5rem 0.375rem 0.625rem", height: "auto", cursor: "pointer" }}
                value={currentSelectVal}
                onChange={(e) => handlePosChange(e.target.value)}
              >
                {currentSelectVal === "custom" && (
                  <option value="custom">🎯 Aangepast gesleept ({focalX}% {focalY}%)</option>
                )}
                <option value="center">📍 Midden (50% 50%)</option>
                <option value="top">⬆️ Bovenkant (50% 0%)</option>
                <option value="bottom">⬇️ Onderkant (50% 100%)</option>
                <option value="top-left">↖️ Boven-Links (0% 0%)</option>
                <option value="top-right">↗️ Boven-Rechts (100% 0%)</option>
                <option value="bottom-left">↙️ Onder-Links (0% 100%)</option>
                <option value="bottom-right">↘️ Onder-Rechts (100% 100%)</option>
              </select>
            </div>

            <div style={{ flex: 1, minWidth: "200px" }}>
              <span className="a-label" style={{ fontSize: "0.75rem", marginBottom: "0.25rem", display: "block" }}>
                🖼️ Snel een sfeerafbeelding kiezen:
              </span>
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
    </div>
  );
}
