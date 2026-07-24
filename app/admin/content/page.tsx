// app/admin/content/page.tsx
import Link from "next/link";
import { getBlocksForSection } from "@/lib/db/content";
import {
  HEADER_DEFAULTS,
  HERO_DEFAULTS,
  MARQUEE_DEFAULTS,
  MANIFEST_DEFAULTS,
  PROCESS_DEFAULTS,
  PATHS_DEFAULTS,
  WINES_DEFAULTS,
  PLACE_DEFAULTS,
  FOOTER_DEFAULTS,
  WIJNEN_PAGE_DEFAULTS,
  TOURS_TASTINGS_PAGE_DEFAULTS,
  VOOR_BEDRIJVEN_PAGE_DEFAULTS,
} from "@/lib/content/defaults";
import { ContentForm } from "./[section]/content-form";

type PageTab = "home" | "wijnen" | "tours-tastings" | "voor-bedrijven";

const PAGES: Array<{ id: PageTab; label: string }> = [
  { id: "home", label: "Homepage" },
  { id: "wijnen", label: "Wijnen Overzicht" },
  { id: "tours-tastings", label: "Tour & Tasting" },
  { id: "voor-bedrijven", label: "Voor Bedrijven" },
];

const HOME_SECTIONS = [
  { key: "header", label: "Header (navigatiebalk)", defaults: HEADER_DEFAULTS },
  { key: "hero", label: "Hero (openingsbeeld)", defaults: HERO_DEFAULTS },
  { key: "marquee", label: "Lopende tekst", defaults: MARQUEE_DEFAULTS },
  { key: "manifest", label: "Manifest (verhaal)", defaults: MANIFEST_DEFAULTS },
  { key: "process", label: "Proces", defaults: PROCESS_DEFAULTS },
  { key: "paths", label: "Routes (drie paden)", defaults: PATHS_DEFAULTS },
  { key: "wines", label: "Wijnen (introductietekst)", defaults: WINES_DEFAULTS },
  { key: "place", label: "Bezoek ons (locatie)", defaults: PLACE_DEFAULTS },
  { key: "footer", label: "Footer", defaults: FOOTER_DEFAULTS },
];

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; section?: string }>;
}) {
  const params = await searchParams;
  const activePage: PageTab = (params.page as PageTab) || "home";

  if (activePage === "wijnen") {
    const rawBlocks = await getBlocksForSection("wijnen", "overview");
    const blockMap = new Map(rawBlocks.map((b) => [b.fieldKey, b]));
    const blocks = Object.entries(WIJNEN_PAGE_DEFAULTS).map(([fieldKey, pair]) => ({
      fieldKey,
      valueNl: blockMap.get(fieldKey)?.valueNl ?? pair.nl,
      valueEn: blockMap.get(fieldKey)?.valueEn ?? pair.en,
    }));

    return (
      <div>
        <h1 className="a-h1">Content CMS</h1>
        <p className="a-subtitle">Beheer alle teksten voor de website per pagina.</p>
        <NavTabs activePage={activePage} />
        <ContentForm section="overview" page="wijnen" blocks={blocks} />
      </div>
    );
  }

  if (activePage === "tours-tastings") {
    const rawBlocks = await getBlocksForSection("tours-tastings", "main");
    const blockMap = new Map(rawBlocks.map((b) => [b.fieldKey, b]));
    const blocks = Object.entries(TOURS_TASTINGS_PAGE_DEFAULTS).map(([fieldKey, pair]) => ({
      fieldKey,
      valueNl: blockMap.get(fieldKey)?.valueNl ?? pair.nl,
      valueEn: blockMap.get(fieldKey)?.valueEn ?? pair.en,
    }));

    return (
      <div>
        <h1 className="a-h1">Content CMS</h1>
        <p className="a-subtitle">Beheer alle teksten voor de Tour & Tasting pagina.</p>
        <NavTabs activePage={activePage} />
        <ContentForm section="main" page="tours-tastings" blocks={blocks} />
      </div>
    );
  }

  if (activePage === "voor-bedrijven") {
    const rawBlocks = await getBlocksForSection("voor-bedrijven", "main");
    const blockMap = new Map(rawBlocks.map((b) => [b.fieldKey, b]));
    const blocks = Object.entries(VOOR_BEDRIJVEN_PAGE_DEFAULTS).map(([fieldKey, pair]) => ({
      fieldKey,
      valueNl: blockMap.get(fieldKey)?.valueNl ?? pair.nl,
      valueEn: blockMap.get(fieldKey)?.valueEn ?? pair.en,
    }));

    return (
      <div>
        <h1 className="a-h1">Content CMS</h1>
        <p className="a-subtitle">Beheer alle teksten voor de Voor Bedrijven pagina.</p>
        <NavTabs activePage={activePage} />
        <ContentForm section="main" page="voor-bedrijven" blocks={blocks} />
      </div>
    );
  }

  // Default: Home page section navigation
  const activeSection = params.section || "hero";
  const sectionMeta = HOME_SECTIONS.find((s) => s.key === activeSection) || HOME_SECTIONS[1];

  const rawBlocks = await getBlocksForSection("home", sectionMeta.key);
  const blockMap = new Map(rawBlocks.map((b) => [b.fieldKey, b]));
  const blocks = Object.entries(sectionMeta.defaults).map(([fieldKey, pair]) => ({
    fieldKey,
    valueNl: blockMap.get(fieldKey)?.valueNl ?? pair.nl,
    valueEn: blockMap.get(fieldKey)?.valueEn ?? pair.en,
  }));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="a-h1">Content CMS</h1>
          <p className="a-subtitle" style={{ margin: 0 }}>Beheer alle teksten en sfeerafbeeldingen voor de website per pagina.</p>
        </div>
        <a
          href={activePage === "home" ? (activeSection === "place" ? "/#bezoek" : "/") : `/${activePage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="a-btn a-btn--secondary"
          style={{ fontSize: "0.8125rem", textDecoration: "none" }}
        >
          👁️ Bekijk pagina op site ↗
        </a>
      </div>
      <NavTabs activePage={activePage} />

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
        {HOME_SECTIONS.map((sec) => (
          <Link
            key={sec.key}
            href={`/admin/content?page=home&section=${sec.key}`}
            className={`a-btn ${activeSection === sec.key ? "a-btn--primary" : "a-btn--secondary"}`}
            style={{ fontSize: "0.75rem", padding: "0.375rem 0.75rem" }}
          >
            {sec.label}
          </Link>
        ))}
      </div>

      <div style={{ marginTop: "1rem" }}>
        <h2 className="a-h1" style={{ fontSize: "1.25rem" }}>
          {sectionMeta.label}
        </h2>
        <ContentForm section={sectionMeta.key} page="home" blocks={blocks} />
      </div>
    </div>
  );
}

function NavTabs({ activePage }: { activePage: PageTab }) {
  return (
    <div style={{ display: "flex", gap: "0.75rem", borderBottom: "1px solid var(--a-border)", marginTop: "1.25rem", paddingBottom: "0.5rem" }}>
      {PAGES.map((p) => (
        <Link
          key={p.id}
          href={`/admin/content?page=${p.id}`}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "var(--a-r-sharp)",
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: activePage === p.id ? "600" : "normal",
            background: activePage === p.id ? "var(--a-surface-2)" : "transparent",
            color: activePage === p.id ? "var(--a-accent-text)" : "var(--a-text)",
            border: activePage === p.id ? "1px solid var(--a-border)" : "1px solid transparent",
          }}
        >
          {p.label}
        </Link>
      ))}
    </div>
  );
}
