import { Hero } from "@/components/hero";
import { Manifest } from "@/components/manifest";
import { Process } from "@/components/process";
import { Paths } from "@/components/paths";
import { Place } from "@/components/place";
import { WinesPreview, type WineCardData } from "@/components/wines-preview";
import { getContent } from "@/lib/content/get-content";
import {
  HERO_DEFAULTS,
  MARQUEE_DEFAULTS,
  MANIFEST_DEFAULTS,
  PROCESS_DEFAULTS,
  PATHS_DEFAULTS,
  PLACE_DEFAULTS,
  WINES_DEFAULTS,
} from "@/lib/content/defaults";
import { getFeaturedWines, wineTypeLabel } from "@/lib/wines/catalog";

// Forces this route to render per-request instead of being statically
// prerendered at build time. Without this, `next build` tries to execute
// getContent()/getFeaturedWines() during the build step to produce
// static HTML — but Railway's build environment can't reach the private
// `postgres.railway.internal` hostname (only the deployed runtime can),
// so the build fails. Per-request rendering also means CMS content edits
// show up immediately without needing a redeploy.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const heroContent = await getContent("home", "hero", HERO_DEFAULTS);
  const marqueeContent = await getContent("home", "marquee", MARQUEE_DEFAULTS);
  const manifestContent = await getContent("home", "manifest", MANIFEST_DEFAULTS);
  const processContent = await getContent("home", "process", PROCESS_DEFAULTS);
  const pathsContent = await getContent("home", "paths", PATHS_DEFAULTS);
  const placeContent = await getContent("home", "place", PLACE_DEFAULTS);
  const winesContent = await getContent("home", "wines", WINES_DEFAULTS);

  const wineRows = await getFeaturedWines();
  const wines: WineCardData[] = wineRows.map((wine, index) => ({
    n: `N°${String(index + 1).padStart(2, "0")}`,
    slug: wine.handle,
    meta: wineTypeLabel(wine.productType, "nl"),
    name: wine.title,
    nlTag: wine.fieldsNl.oneliner ?? wineTypeLabel(wine.productType, "nl"),
    enTag: wine.fieldsEn.oneliner ?? wineTypeLabel(wine.productType, "en"),
    img: wine.image?.url ?? "/assets/wine-1.png",
    alt: wine.image?.altText || wine.title,
    delay: index * 0.08,
  }));

  return (
    <>
      <Hero content={heroContent} marquee={marqueeContent} />
      <Manifest content={manifestContent} />
      <Process content={processContent} />
      <Paths content={pathsContent} />
      <WinesPreview content={winesContent} wines={wines} />
      <Place content={placeContent} />
    </>
  );
}
