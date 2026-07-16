import { Hero } from "@/components/hero";
import { Manifest } from "@/components/manifest";
import { Process } from "@/components/process";
import { Paths } from "@/components/paths";
import { WinesPreview } from "@/components/wines-preview";
import { Place } from "@/components/place";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Manifest />
      <Process />
      <Paths />
      <WinesPreview />
      <Place />
    </>
  );
}
