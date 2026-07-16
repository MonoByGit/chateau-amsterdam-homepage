import { Hero } from "@/components/hero";
import { Manifest } from "@/components/manifest";
import { Process } from "@/components/process";
import { Paths } from "@/components/paths";
import { WinesPreview } from "@/components/wines-preview";
import { Place } from "@/components/place";
import { getContent } from "@/lib/content/get-content";
import { HERO_DEFAULTS, MARQUEE_DEFAULTS } from "@/lib/content/defaults";

export default async function HomePage() {
  const heroContent = await getContent("home", "hero", HERO_DEFAULTS);
  const marqueeContent = await getContent("home", "marquee", MARQUEE_DEFAULTS);

  return (
    <>
      <Hero content={heroContent} marquee={marqueeContent} />
      <Manifest />
      <Process />
      <Paths />
      <WinesPreview />
      <Place />
    </>
  );
}
