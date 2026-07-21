import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WijnDetail, type WijnDetailRelated } from "@/components/wijn-detail";
import { getWineByHandle, getWineCatalog, wineTypeLabel } from "@/lib/wines/catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const wine = await getWineByHandle(slug);
  if (!wine) {
    return { title: "Wijnen · Chateau Amsterdam" };
  }

  const description = (wine.descriptionNl ?? "").split("\n\n")[0] || wine.title;
  const imageUrl = wine.image?.url ?? "https://chateau.amsterdam/assets/wine-1.png";

  return {
    title: `${wine.title} · Chateau Amsterdam`,
    description,
    openGraph: { title: `${wine.title} · Chateau Amsterdam`, description, images: [imageUrl] },
    twitter: { card: "summary_large_image", title: `${wine.title} · Chateau Amsterdam`, description, images: [imageUrl] },
  };
}

export default async function WijnDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const wine = await getWineByHandle(slug);
  if (!wine) {
    notFound();
  }

  // The catalog list is already fetched with its Shopify collection order —
  // reuse it for "related wines" instead of a second query, same as before
  // when this was a Postgres sortOrder column.
  const catalog = await getWineCatalog();
  const relatedRows = catalog.filter((w) => w.handle !== wine.handle).slice(0, 4);

  const related: WijnDetailRelated[] = relatedRows.map((r, index) => ({
    n: `N°${String(index + 1).padStart(2, "0")}`,
    slug: r.handle,
    metaNl: wineTypeLabel(r.productType, "nl"),
    metaEn: wineTypeLabel(r.productType, "en"),
    name: r.title,
    nlTag: r.fieldsNl.oneliner ?? wineTypeLabel(r.productType, "nl"),
    enTag: r.fieldsEn.oneliner ?? wineTypeLabel(r.productType, "en"),
    img: r.image?.url ?? "/assets/wine-1.png",
    altNl: r.image?.altText || r.title,
    altEn: r.image?.altText || r.title,
    delay: 0,
  }));

  return (
    <WijnDetail
      wine={{
        name: wine.title,
        metaNl: wineTypeLabel(wine.productType, "nl"),
        metaEn: wineTypeLabel(wine.productType, "en"),
        tagNl: wine.tagNl ?? wineTypeLabel(wine.productType, "nl"),
        tagEn: wine.tagEn ?? wineTypeLabel(wine.productType, "en"),
        descriptionNl: wine.descriptionNl,
        descriptionEn: wine.descriptionEn,
        vintage: null,
        grapes: wine.grapes,
        abv: null,
        wineTypeNl: wineTypeLabel(wine.productType, "nl"),
        wineTypeEn: wineTypeLabel(wine.productType, "en"),
        regionNl: wine.regionNl,
        regionEn: wine.regionEn,
        farmingMethodNl: null,
        farmingMethodEn: null,
        vinificationNl: null,
        vinificationEn: null,
        foodPairingNl: wine.foodPairingNl,
        foodPairingEn: wine.foodPairingEn,
        shopifyHandle: wine.handle,
      }}
      imageUrl={wine.image?.url ?? "/assets/wine-1.png"}
      related={related}
    />
  );
}
