// components/wijn-detail.tsx
"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language";
import { WineCard, type WineCardData } from "@/components/wine-card";

export type WijnDetailWine = {
  name: string;
  metaNl: string;
  metaEn: string;
  tagNl: string;
  tagEn: string;
  descriptionNl: string | null;
  descriptionEn: string | null;
  vintage: string | null;
  grapes: string | null;
  abv: number | null;
  wineTypeNl: string | null;
  wineTypeEn: string | null;
  regionNl: string | null;
  regionEn: string | null;
  farmingMethodNl: string | null;
  farmingMethodEn: string | null;
  vinificationNl: string | null;
  vinificationEn: string | null;
  foodPairingNl: string | null;
  foodPairingEn: string | null;
  shopifyHandle: string;
};

export type WijnDetailRelated = Omit<WineCardData, "meta" | "alt"> & {
  metaNl: string;
  metaEn: string;
  altNl: string;
  altEn: string;
};

export function WijnDetail({
  wine,
  imageUrl,
  related,
}: {
  wine: WijnDetailWine;
  imageUrl: string;
  related: WijnDetailRelated[];
}) {
  const { lang, t } = useLanguage();

  const description = lang === "nl" ? wine.descriptionNl : wine.descriptionEn || wine.descriptionNl;
  const foodPairing = lang === "nl" ? wine.foodPairingNl : wine.foodPairingEn || wine.foodPairingNl;
  const wineType = lang === "nl" ? wine.wineTypeNl : wine.wineTypeEn || wine.wineTypeNl;
  const region = lang === "nl" ? wine.regionNl : wine.regionEn || wine.regionNl;
  const farmingMethod = lang === "nl" ? wine.farmingMethodNl : wine.farmingMethodEn || wine.farmingMethodNl;
  const vinification = lang === "nl" ? wine.vinificationNl : wine.vinificationEn || wine.vinificationNl;

  const hasFacts = wine.vintage || wine.grapes || wine.abv !== null;
  const hasDetails = wineType || region || farmingMethod || vinification;

  return (
    <>
      <nav className="wijnen-breadcrumb">
        <Link href="/">{t("Home", "Home")}</Link>
        <span className="sep">/</span>
        <Link href="/wijnen">{t("Wijnen", "Wines")}</Link>
        <span className="sep">/</span>
        <span className="current">{wine.name}</span>
      </nav>

      <div className="wijn-detail">
        <div className="wijn-detail-photo">
          <div className="frame">
            <img
              src={imageUrl}
              alt={wine.name}
              fetchPriority="high"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/assets/wine-1.png";
              }}
            />
          </div>
          {foodPairing ? (
            <div className="wijn-pairing">
              <span className="wijn-pairing-label">{t("Wijn-spijs suggestie", "Food pairing suggestion")}</span>
              <p>{foodPairing}</p>
            </div>
          ) : null}
        </div>

        <div className="wijn-detail-info">
          <span className="meta">{lang === "nl" ? wine.metaNl : wine.metaEn}</span>
          <h1>{wine.name}</h1>
          <span className="tag">{lang === "nl" ? wine.tagNl : wine.tagEn}</span>

          {description
            ? (() => {
                const [lede, ...more] = description.split("\n\n").filter(Boolean);
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
              <div className="wijn-profile-title">{t("Wijnprofiel", "Wine profile")}</div>
              <div className="wijn-profile-body">
                {hasFacts ? (
                  <div className="wijn-profile-facts">
                    {wine.vintage ? (
                      <div className="wijn-profile-item">
                        <span className="k">{t("Jaargang", "Vintage")}</span>
                        <span className="v">{wine.vintage}</span>
                      </div>
                    ) : null}
                    {wine.grapes ? (
                      <div className="wijn-profile-item">
                        <span className="k">{t("Druif", "Grape")}</span>
                        <span className="v">{wine.grapes}</span>
                      </div>
                    ) : null}
                    {wine.abv !== null ? (
                      <div className="wijn-profile-item">
                        <span className="k">{t("Alcoholpercentage", "ABV")}</span>
                        <span className="v">{wine.abv}% vol</span>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {hasDetails ? (
                  <div className="wijn-profile-details">
                    {wineType ? (
                      <div className="wijn-profile-item">
                        <span className="k">{t("Type", "Type")}</span>
                        <span className="v">{wineType}</span>
                      </div>
                    ) : null}
                    {region ? (
                      <div className="wijn-profile-item">
                        <span className="k">{t("Regio", "Region")}</span>
                        <span className="v">{region}</span>
                      </div>
                    ) : null}
                    {farmingMethod ? (
                      <div className="wijn-profile-item">
                        <span className="k">{t("Landbouwtechniek", "Farming method")}</span>
                        <span className="v">{farmingMethod}</span>
                      </div>
                    ) : null}
                    {vinification ? (
                      <div className="wijn-profile-item">
                        <span className="k">{t("Vinificatie", "Vinification")}</span>
                        <span className="v">{vinification}</span>
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
            {t("Bestel deze fles", "Order this bottle")} <span className="arr">→</span>
          </a>
        </div>
      </div>

      {related.length > 0 ? (
        <div className="wijn-related">
          <h2>
            {t("Misschien vind je dit", "You might")} <em>{t("ook leuk", "also like this")}</em>
          </h2>
          <div className="wijn-related-row">
            {related.map((r) => (
              <WineCard
                key={r.slug}
                wine={{ ...r, meta: lang === "nl" ? r.metaNl : r.metaEn, alt: lang === "nl" ? r.altNl : r.altEn }}
                lang={lang}
              />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
