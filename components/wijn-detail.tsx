// components/wijn-detail.tsx
"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language";
import { WineCard, type WineCardData } from "@/components/wine-card";
import { AddToCartButton } from "@/components/add-to-cart-button";
import type { ShopifyMoney } from "@/lib/shopify/types";

export type WijnDetailWine = {
  name: string;
  metaNl: string;
  metaEn: string;
  tagNl: string | null;
  tagEn: string | null;
  descriptionNl: string | null;
  descriptionEn: string | null;
  grapesNl: string | null;
  grapesEn: string | null;
  abvNl: string | null;
  abvEn: string | null;
  wineTypeNl: string | null;
  wineTypeEn: string | null;
  regionNl: string | null;
  regionEn: string | null;
  foodPairingNl: string | null;
  foodPairingEn: string | null;
  price: ShopifyMoney | null;
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
  const grapes = lang === "nl" ? wine.grapesNl : wine.grapesEn || wine.grapesNl;
  const abv = lang === "nl" ? wine.abvNl : wine.abvEn || wine.abvNl;
  const tag = lang === "nl" ? wine.tagNl : wine.tagEn || wine.tagNl;

  const hasFacts = Boolean(grapes || abv);
  const hasDetails = Boolean(wineType || region);

  const formattedPrice = wine.price
    ? lang === "nl"
      ? `€ ${wine.price.amount.replace(".", ",")}`
      : `€ ${wine.price.amount}`
    : null;

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
          {tag ? <span className="tag">{tag}</span> : null}

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
                    {grapes ? (
                      <div className="wijn-profile-item">
                        <span className="k">{t("Druif", "Grape variety")}</span>
                        <span className="v">{grapes}</span>
                      </div>
                    ) : null}
                    {abv ? (
                      <div className="wijn-profile-item">
                        <span className="k">{t("Alcoholpercentage", "Alcohol percentage")}</span>
                        <span className="v">{abv}</span>
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
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="wijn-purchase-row">
            {formattedPrice ? (
              <div className="wijn-price">
                <span className="wijn-price-amount">{formattedPrice}</span>
                <span className="wijn-price-vat">{t("incl. btw", "incl. VAT")}</span>
              </div>
            ) : null}
            <div className="wijn-buy-action">
              <AddToCartButton shopifyHandle={wine.shopifyHandle} />
            </div>
          </div>
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
