import type { Metadata } from "next";
import { WijnenOverview } from "@/components/wijnen-overview";
import { getWinesForHomepage } from "@/lib/db/wines";
import { resolveWineImageUrl } from "@/lib/wines/image";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wijnen · Chateau Amsterdam",
  description: "De collectie van Chateau Amsterdam: wijnen gevinifieerd middenin Amsterdam-Noord, van klassiek tot rebels.",
  openGraph: {
    title: "Wijnen · Chateau Amsterdam",
    description: "Van klassiek tot rebels: de wijnen van Chateau Amsterdam, gevinifieerd middenin Amsterdam-Noord.",
    images: ["/assets/wine-1.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wijnen · Chateau Amsterdam",
    description: "Van klassiek tot rebels: de wijnen van Chateau Amsterdam.",
    images: ["/assets/wine-1.png"],
  },
};

export default async function WijnenOverviewPage() {
  const wineRows = await getWinesForHomepage();
  const wines = await Promise.all(
    wineRows.map(async (wine, index) => ({
      n: `N°${String(index + 1).padStart(2, "0")}`,
      // See app/(site)/page.tsx's identical assertion: slug is nullable in
      // the DB only for migration-safety reasons, never actually empty.
      slug: wine.slug!,
      metaNl: wine.metaNl,
      metaEn: wine.metaEn,
      name: wine.name,
      nlTag: wine.tagNl,
      enTag: wine.tagEn,
      img: await resolveWineImageUrl(wine),
      altNl: wine.imageAltNl || wine.name,
      altEn: wine.imageAltEn || wine.name,
    }))
  );

  return <WijnenOverview wines={wines} />;
}
