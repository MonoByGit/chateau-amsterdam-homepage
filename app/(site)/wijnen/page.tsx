import type { Metadata } from "next";
import { WijnenOverview } from "@/components/wijnen-overview";
import { getWineCatalog, wineTypeLabel } from "@/lib/wines/catalog";
import { getContent } from "@/lib/content/get-content";
import { WIJNEN_PAGE_DEFAULTS } from "@/lib/content/defaults";

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
  const content = await getContent("wijnen", "overview", WIJNEN_PAGE_DEFAULTS);
  const wineRows = await getWineCatalog();
  const wines = wineRows.map((wine, index) => ({
    n: `N°${String(index + 1).padStart(2, "0")}`,
    slug: wine.handle,
    metaNl: wineTypeLabel(wine.productType, "nl"),
    metaEn: wineTypeLabel(wine.productType, "en"),
    name: wine.title,
    nlTag: wine.fieldsNl.oneliner ?? wineTypeLabel(wine.productType, "nl"),
    enTag: wine.fieldsEn.oneliner ?? wineTypeLabel(wine.productType, "en"),
    img: wine.image?.url ?? "/assets/wine-1.png",
    altNl: wine.image?.altText || wine.title,
    altEn: wine.image?.altText || wine.title,
  }));

  return <WijnenOverview wines={wines} content={content} />;
}
