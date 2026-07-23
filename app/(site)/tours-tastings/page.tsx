// app/(site)/tours-tastings/page.tsx
import type { Metadata } from "next";
import { ToursTastingsContent } from "@/components/tours-tastings-content";
import { getContent } from "@/lib/content/get-content";
import { TOURS_TASTINGS_PAGE_DEFAULTS } from "@/lib/content/defaults";

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

import { listBlocksForMonth } from "@/lib/db/availability";

export default async function ToursTastingsPage({
  searchParams,
}: {
  searchParams: Promise<{ verzonden?: string; fout?: string }>;
}) {
  const { verzonden, fout } = await searchParams;
  const content = await getContent("tours-tastings", "main", TOURS_TASTINGS_PAGE_DEFAULTS);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const monthBlocksPromises = [0, 1, 2, 3].map((offset) => {
    const total = year * 12 + (month - 1) + offset;
    const y = Math.floor(total / 12);
    const m = (total % 12) + 1;
    return listBlocksForMonth(y, m);
  });

  const monthBlocksResults = await Promise.all(monthBlocksPromises);
  const allBlocks = monthBlocksResults.flat();

  const blockedFullDays = allBlocks.filter((b) => b.isFullDay).map((b) => b.date);
  const blockedSlotsByDate: Record<string, string[]> = {};
  for (const b of allBlocks) {
    if (!b.isFullDay && b.label) {
      if (!blockedSlotsByDate[b.date]) blockedSlotsByDate[b.date] = [];
      blockedSlotsByDate[b.date].push(b.label);
    }
  }

  return (
    <ToursTastingsContent
      verzonden={verzonden}
      fout={fout}
      content={content}
      blockedFullDays={blockedFullDays}
      blockedSlotsByDate={blockedSlotsByDate}
    />
  );
}
