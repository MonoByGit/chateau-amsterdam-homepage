// app/admin/content/page.tsx
import Link from "next/link";
import { getAllSections } from "@/lib/db/content";

const SECTION_LABELS: Record<string, string> = {
  header: "Header",
  hero: "Hero",
  marquee: "Marquee",
  manifest: "Manifest",
  process: "Process",
  paths: "Paths",
  wines: "Wijnen (sectietekst)",
  place: "Locatie",
  footer: "Footer",
};

export default async function ContentPage() {
  const sections = await getAllSections("home");

  return (
    <div>
      <h1 className="a-h1">Content</h1>
      <p className="a-subtitle">Kies een sectie van de homepage om de NL/EN tekst te bewerken.</p>
      <div className="a-card" style={{ marginTop: "1.5rem" }}>
        {sections.map((section) => (
          <Link
            key={section}
            href={`/admin/content/${section}`}
            className="a-card-row"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none" }}
          >
            <span className="a-label" style={{ color: "var(--a-text)" }}>
              {SECTION_LABELS[section] ?? section}
            </span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--a-text-3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
