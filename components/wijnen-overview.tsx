// components/wijnen-overview.tsx
"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language";
import { WineCard, type WineCardData } from "@/components/wine-card";
import { WIJNEN_PAGE_DEFAULTS, type WijnenPageContent } from "@/lib/content/defaults";

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

export function WijnenOverview({ wines, content = WIJNEN_PAGE_DEFAULTS }: { wines: WijnenOverviewWine[]; content?: WijnenPageContent }) {
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
          <span>{t(content.label.nl, content.label.en)}</span>
        </div>
        <h1>
          {t(content.heading_lead.nl, content.heading_lead.en)} <em>{t(content.heading_em.nl, content.heading_em.en)}</em>
        </h1>
        <p>
          {`${wines.length} ${t(content.sub_text.nl, content.sub_text.en)}`}
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
