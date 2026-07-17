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
import { getWinesForHomepage } from "@/lib/db/wines";
import { getObjectUrl } from "@/lib/storage/s3";

// Forces this route to render per-request instead of being statically
// prerendered at build time. Without this, `next build` tries to execute
// getContent()/getWinesForHomepage() during the build step to produce
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

  const wineRows = await getWinesForHomepage();
  const wines: WineCardData[] = await Promise.all(
    wineRows.map(async (wine, index) => ({
      n: `N°${String(index + 1).padStart(2, "0")}`,
      // slug is nullable in the DB only because Postgres can't add a NOT
      // NULL column to a populated table; createWine always sets one for
      // new wines, and the migration's backfill script sets one for every
      // existing wine, so this is never actually null once code runs.
      slug: wine.slug!,
      meta: wine.metaNl,
      name: wine.name,
      nlTag: wine.tagNl,
      enTag: wine.tagEn,
      img: wine.imageStorageKey ? await getObjectUrl(wine.imageStorageKey) : "/assets/wine-1.png",
      alt: wine.imageAltNl || wine.name,
      delay: index * 0.08,
    }))
  );

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
