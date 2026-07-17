import Link from "next/link";
import { notFound } from "next/navigation";
import { WineCard, type WineCardData } from "@/components/wine-card";
import { getRelatedWines, getWineBySlug } from "@/lib/db/wines";
import { getObjectUrl } from "@/lib/storage/s3";
import { listMedia } from "@/lib/db/media";

export const dynamic = "force-dynamic";

export default async function WijnDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const wine = await getWineBySlug(slug);
  if (!wine || !wine.isActive) {
    notFound();
  }

  const media = await listMedia();
  const image = media.find((m) => m.id === wine.imageId);
  const imageUrl = image ? await getObjectUrl(image.storageKey) : "/assets/wine-1.png";

  const relatedRows = await getRelatedWines(wine.id);
  const related: WineCardData[] = await Promise.all(
    relatedRows.map(async (r, index) => {
      const relatedImage = media.find((m) => m.id === r.imageId);
      return {
        n: `N°${String(index + 1).padStart(2, "0")}`,
        // Same nullable-in-the-DB-only assertion as the other two pages.
        slug: r.slug!,
        meta: r.metaNl,
        name: r.name,
        nlTag: r.tagNl,
        enTag: r.tagEn,
        price: "vanaf shop.chateau.amsterdam",
        img: relatedImage ? await getObjectUrl(relatedImage.storageKey) : "/assets/wine-1.png",
        alt: relatedImage?.altTextNl || r.name,
        delay: 0,
      };
    })
  );

  const hasFacts = wine.vintage || wine.grapes || wine.abv !== null;
  const hasDetails = wine.wineTypeNl || wine.regionNl || wine.farmingMethodNl || wine.vinificationNl;

  return (
    <>
      <nav className="wijnen-breadcrumb">
        <Link href="/">Home</Link>
        <span className="sep">/</span>
        <Link href="/wijnen">Wijnen</Link>
        <span className="sep">/</span>
        <span className="current">{wine.name}</span>
      </nav>

      <div className="wijn-detail">
        <div className="wijn-detail-photo">
          <div className="frame">
            <img src={imageUrl} alt={wine.name} />
          </div>
          {wine.foodPairingNl ? (
            <div className="wijn-pairing">
              <span className="label">Wijn-spijs suggestie</span>
              <p>{wine.foodPairingNl}</p>
            </div>
          ) : null}
        </div>

        <div className="wijn-detail-info">
          <span className="meta">{wine.metaNl}</span>
          <h1>{wine.name}</h1>
          <span className="tag">{wine.tagNl}</span>

          {wine.descriptionNl
            ? (() => {
                const [lede, ...more] = wine.descriptionNl.split("\n\n").filter(Boolean);
                return (
                  <>
                    <p className="description">{lede}</p>
                    {more.length > 0 ? (
                      <div className="description-more">
                        {more.map((paragraph, i) => (
                          <p key={i}>{paragraph}</p>
                        ))}
                      </div>
                    ) : null}
                  </>
                );
              })()
            : null}

          {hasFacts || hasDetails ? (
            <div className="wijn-profile">
              <div className="wijn-profile-title">Wijnprofiel</div>
              <div className="wijn-profile-body">
                {hasFacts ? (
                  <div className="wijn-profile-facts">
                    {wine.vintage ? (
                      <div className="wijn-profile-item">
                        <span className="k">Jaargang</span>
                        <span className="v">{wine.vintage}</span>
                      </div>
                    ) : null}
                    {wine.grapes ? (
                      <div className="wijn-profile-item">
                        <span className="k">Druif</span>
                        <span className="v">{wine.grapes}</span>
                      </div>
                    ) : null}
                    {wine.abv !== null ? (
                      <div className="wijn-profile-item">
                        <span className="k">Alcoholpercentage</span>
                        <span className="v">{wine.abv}% vol</span>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {hasDetails ? (
                  <div className="wijn-profile-details">
                    {wine.wineTypeNl ? (
                      <div className="wijn-profile-item">
                        <span className="k">Type</span>
                        <span className="v">{wine.wineTypeNl}</span>
                      </div>
                    ) : null}
                    {wine.regionNl ? (
                      <div className="wijn-profile-item">
                        <span className="k">Regio</span>
                        <span className="v">{wine.regionNl}</span>
                      </div>
                    ) : null}
                    {wine.farmingMethodNl ? (
                      <div className="wijn-profile-item">
                        <span className="k">Landbouwtechniek</span>
                        <span className="v">{wine.farmingMethodNl}</span>
                      </div>
                    ) : null}
                    {wine.vinificationNl ? (
                      <div className="wijn-profile-item">
                        <span className="k">Vinificatie</span>
                        <span className="v">{wine.vinificationNl}</span>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {/*
            TEMPORARY BRIDGE: this button links straight to the wine's
            existing Shopify product page. It is not the end state, do
            not extend this pattern elsewhere.

            End state (Shopify Storefront API phase, a later, separate
            plan): this becomes an "In winkelmandje" action that adds
            the item to a Cart (Storefront API Cart object) and opens a
            slide-in drawer. The customer adds/removes wines and stays
            on this site throughout; only the final payment step
            redirects once to Shopify's hosted checkout. Price and
            stock become live at that point via a server-side
            Storefront API call. Replace this direct link wholesale
            when that phase starts, do not build on top of it.
          */}
          <a className="btn btn--primary" href={`https://shop.chateau.amsterdam/products/${wine.shopifyHandle}`}>
            Bestel deze fles <span className="arr">→</span>
          </a>
        </div>
      </div>

      {related.length > 0 ? (
        <div className="wijn-related">
          <h2>
            Misschien vind je dit <em>ook leuk</em>
          </h2>
          <div className="wijn-related-row">
            {related.map((r) => (
              <WineCard key={r.slug} wine={r} lang="nl" />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
