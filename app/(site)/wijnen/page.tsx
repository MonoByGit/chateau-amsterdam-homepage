import Link from "next/link";
import { WineCard, type WineCardData } from "@/components/wine-card";
import { getWinesForHomepage } from "@/lib/db/wines";
import { getObjectUrl } from "@/lib/storage/s3";

const WINE_PRICE_PLACEHOLDER = "vanaf shop.chateau.amsterdam";

export const dynamic = "force-dynamic";

export default async function WijnenOverviewPage() {
  const wineRows = await getWinesForHomepage();
  const wines: WineCardData[] = await Promise.all(
    wineRows.map(async (wine, index) => ({
      n: `N°${String(index + 1).padStart(2, "0")}`,
      // See app/(site)/page.tsx's identical assertion: slug is nullable in
      // the DB only for migration-safety reasons, never actually empty.
      slug: wine.slug!,
      meta: wine.metaNl,
      name: wine.name,
      nlTag: wine.tagNl,
      enTag: wine.tagEn,
      price: WINE_PRICE_PLACEHOLDER,
      img: wine.imageStorageKey ? await getObjectUrl(wine.imageStorageKey) : "/assets/wine-1.png",
      alt: wine.imageAltNl || wine.name,
      delay: 0,
    }))
  );

  return (
    <>
      <nav className="wijnen-breadcrumb">
        <Link href="/">Home</Link>
        <span className="sep">/</span>
        <span className="current">Wijnen</span>
      </nav>

      <div className="wijnen-intro">
        <div className="label">
          <span>De collectie</span>
        </div>
        <h1>
          Van klassiek <em>tot rebels</em>
        </h1>
        <p>Vijf wijnen, allemaal gevinifieerd middenin Amsterdam-Noord. Klik op een fles voor het volledige verhaal.</p>
      </div>

      <div className="wijnen-grid">
        {wines.map((wine) => (
          <WineCard key={wine.slug} wine={wine} lang="nl" />
        ))}
      </div>
    </>
  );
}
