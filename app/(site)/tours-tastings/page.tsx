// app/(site)/tours-tastings/page.tsx
import type { Metadata } from "next";
import { ToursTastingsContent } from "@/components/tours-tastings-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tour & Tasting · Chateau Amsterdam",
  description:
    "70 minuten tussen de tanks. Zes wijnen op tafel. Boek een tour & tasting bij de urban winery van Amsterdam-Noord.",
  openGraph: {
    title: "Tour & Tasting · Chateau Amsterdam",
    description: "70 minuten tussen de tanks. Zes wijnen op tafel. Een middag die je proeft in plaats van leest.",
    images: ["/assets/hero-winery.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tour & Tasting · Chateau Amsterdam",
    description: "70 minuten tussen de tanks. Zes wijnen op tafel.",
    images: ["/assets/hero-winery.jpg"],
  },
};

import { getContent } from "@/lib/content/get-content";
import { TOURS_TASTINGS_PAGE_DEFAULTS } from "@/lib/content/defaults";

export default async function ToursTastingsPage({
  searchParams,
}: {
  searchParams: Promise<{ verzonden?: string; fout?: string }>;
}) {
  const { verzonden, fout } = await searchParams;
  const content = await getContent("tours-tastings", "main", TOURS_TASTINGS_PAGE_DEFAULTS);

  return <ToursTastingsContent verzonden={verzonden} fout={fout} content={content} />;
}
