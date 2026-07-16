import { Hero } from "@/components/hero";
import { Manifest } from "@/components/manifest";
import { Process } from "@/components/process";
import { Paths } from "@/components/paths";
import { WinesPreview } from "@/components/wines-preview";
import { Place } from "@/components/place";
import { getContent } from "@/lib/content/get-content";
import {
  HERO_DEFAULTS,
  MARQUEE_DEFAULTS,
  MANIFEST_DEFAULTS,
  PROCESS_DEFAULTS,
  PATHS_DEFAULTS,
  PLACE_DEFAULTS,
} from "@/lib/content/defaults";

export default async function HomePage() {
  const heroContent = await getContent("home", "hero", HERO_DEFAULTS);
  const marqueeContent = await getContent("home", "marquee", MARQUEE_DEFAULTS);
  const manifestContent = await getContent("home", "manifest", MANIFEST_DEFAULTS);
  const processContent = await getContent("home", "process", PROCESS_DEFAULTS);
  const pathsContent = await getContent("home", "paths", PATHS_DEFAULTS);
  const placeContent = await getContent("home", "place", PLACE_DEFAULTS);

  return (
    <>
      <Hero content={heroContent} marquee={marqueeContent} />
      <Manifest content={manifestContent} />
      <Process content={processContent} />
      <Paths content={pathsContent} />
      <WinesPreview />
      <Place content={placeContent} />
    </>
  );
}
