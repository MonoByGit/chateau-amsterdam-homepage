// app/admin/content/page.tsx
import Link from "next/link";
import { getAllSections } from "@/lib/db/content";

// Ordered top-to-bottom as the sections actually appear on the homepage,
// not database/insertion order — so "which one do I need" matches what
// you'd scroll past on the live site.
const SECTION_ORDER = ["header", "hero", "marquee", "manifest", "process", "paths", "wines", "place", "footer"];

const SECTION_META: Record<string, { label: string; anchor: string }> = {
  header: { label: "Header (navigatiebalk)", anchor: "/#header" },
  hero: { label: "Hero (openingsbeeld)", anchor: "/#top" },
  marquee: { label: "Lopende tekst", anchor: "/#top" },
  manifest: { label: "Manifest (verhaal)", anchor: "/#verhaal" },
  process: { label: "Proces", anchor: "/#proces" },
  paths: { label: "Routes (drie paden)", anchor: "/#paden" },
  wines: { label: "Wijnen (introductietekst)", anchor: "/#wijnen" },
  place: { label: "Bezoek ons (locatie)", anchor: "/#bezoek" },
  footer: { label: "Footer", anchor: "/#footer" },
};

export default async function ContentPage() {
  const sections = await getAllSections("home");
  const ordered = [...sections].sort((a, b) => SECTION_ORDER.indexOf(a) - SECTION_ORDER.indexOf(b));

  return (
    <div>
      <h1 className="a-h1">Content</h1>
      <p className="a-subtitle">Kies een sectie van de homepage om de NL/EN tekst te bewerken.</p>
      <div className="a-card" style={{ marginTop: "1.5rem" }}>
        {ordered.map((section) => {
          const meta = SECTION_META[section] ?? { label: section, anchor: "" };
          return (
            <div key={section} className="a-card-row" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <Link href={`/admin/content/${section}`} style={{ flex: 1, minWidth: 0, textDecoration: "none" }}>
                <span className="a-label" style={{ color: "var(--a-text)" }}>
                  {meta.label}
                </span>
                <div className="a-row-meta">{section}</div>
              </Link>
              {meta.anchor ? (
                <a href={meta.anchor} target="_blank" rel="noreferrer" className="a-preview-link">
                  Bekijk op site
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M9 7h8v8" />
                  </svg>
                </a>
              ) : null}
              <Link href={`/admin/content/${section}`} style={{ color: "var(--a-text-3)", display: "flex" }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
