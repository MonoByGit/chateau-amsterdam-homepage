// components/wijnen-overview.tsx
"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language";
import { WineCard, type WineCardData } from "@/components/wine-card";

export type WijnenOverviewWine = {
  n: string;
  slug: string;
  metaNl: string;
  metaEn: string;
  name: string;
  nlTag: string;
  enTag: string;
  img: string;
  altNl: string;
  altEn: string;
};

export function WijnenOverview({ wines }: { wines: WijnenOverviewWine[] }) {
  const { lang, t } = useLanguage();

  const cards: WineCardData[] = wines.map((wine) => ({
    n: wine.n,
    slug: wine.slug,
    meta: lang === "nl" ? wine.metaNl : wine.metaEn,
    name: wine.name,
    nlTag: wine.nlTag,
    enTag: wine.enTag,
    img: wine.img,
    alt: lang === "nl" ? wine.altNl : wine.altEn,
    delay: 0,
  }));

  return (
    <>
      <nav className="wijnen-breadcrumb">
        <Link href="/">{t("Home", "Home")}</Link>
        <span className="sep">/</span>
        <span className="current">{t("Wijnen", "Wines")}</span>
      </nav>

      <div className="wijnen-intro">
        <div className="label">
          <span>{t("De collectie", "The collection")}</span>
        </div>
        <h1>
          {t("Van klassiek", "From classic")} <em>{t("tot rebels", "to rebellious")}</em>
        </h1>
        <p>
          {t(
            `${wines.length} wijnen, allemaal gevinifieerd middenin Amsterdam-Noord. Klik op een fles voor het volledige verhaal.`,
            `${wines.length} wines, all vinified in the heart of Amsterdam-Noord. Click a bottle for the full story.`
          )}
        </p>
      </div>

      <div className="wijnen-grid">
        {cards.map((wine) => (
          <WineCard key={wine.slug} wine={wine} lang={lang} />
        ))}
      </div>
    </>
  );
}
