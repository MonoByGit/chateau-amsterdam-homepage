"use client";

import { useLanguage } from "@/lib/language";
import { useReveal } from "@/lib/use-reveal";

const WINES: Array<{
  n: string;
  meta: string;
  name: string;
  nlTag: string;
  enTag: string;
  price: string;
  img: string;
  alt: string;
  delay: number;
}> = [
  { n: "N°01", meta: "Wit · Pfalz, DE", name: "Riesling", nlTag: "de klassieker", enTag: "the classic", price: "€ 16,50", img: "/assets/wine-1.png", alt: "Riesling White Wine Bottle Packshot", delay: 0 },
  { n: "N°02", meta: "Wit · blend, DE × ES", name: "Riesling × Moscatel", nlTag: "kan alleen in Noord", enTag: "only in North", price: "€ 18,-", img: "/assets/wine-2.png", alt: "Riesling Moscatel Blend White Wine Bottle Packshot", delay: 0.08 },
  { n: "N°03", meta: "Rood · Bourgogne-stijl", name: "Pinot Noir", nlTag: "op eik gerijpt", enTag: "aged in oak", price: "€ 19,50", img: "/assets/wine-3.png", alt: "Pinot Noir Red Wine Bottle Packshot", delay: 0.16 },
  { n: "N°04", meta: "Oranje · skin contact", name: "Amber Blend", nlTag: "voor de avonturiers", enTag: "for the adventurers", price: "€ 17,50", img: "/assets/wine-4.png", alt: "Amber Blend Orange Wine Bottle Packshot", delay: 0.24 },
  { n: "N°05", meta: "Sprankel · zero waste", name: "Piquette d'Amsterdam", nlTag: "tweede leven van de schil", enTag: "second life of the grape skin", price: "€ 12,50", img: "/assets/wine-5.png", alt: "Piquette d'Amsterdam Sparkling Wine Bottle Packshot", delay: 0.32 },
];

function WineCard({ wine, lang }: { wine: (typeof WINES)[number]; lang: "nl" | "en" }) {
  const reveal = useReveal(wine.delay);
  return (
    <article ref={reveal.ref as React.RefObject<HTMLElement>} className={`wine-card rv${reveal.isVisible ? " in" : ""}`}>
      <div className="meta">
        <span>{wine.n}</span>
        <span>{wine.meta}</span>
      </div>
      <div className="wine-img-wrap">
        <img src={wine.img} alt={wine.alt} className="wine-packshot" />
      </div>
      <h3>{wine.name}</h3>
      <div className="tag">{lang === "nl" ? wine.nlTag : wine.enTag}</div>
      <div className="price">{wine.price}</div>
    </article>
  );
}

export function WinesPreview() {
  const { lang, t } = useLanguage();
  const heading1 = useReveal();
  const heading2 = useReveal(0.12);
  const cta = useReveal(0.2);

  return (
    <section className="wines" id="wijnen">
      <div className="wines-head">
        <div>
          <div className="label rv in">
            {t("De collectie", "The collection")} <span className="en">· made in Noord</span>
          </div>
          <h2>
            <span ref={heading1.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${heading1.isVisible ? " in" : ""}`}>
              <span>{t("Van klassiek", "From classic")}</span>
            </span>
            <span ref={heading2.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${heading2.isVisible ? " in" : ""}`}>
              <span>
                {t("tot ", "to ")}
                <em>{t("eigenwijs.", "rebellious.")}</em>
              </span>
            </span>
          </h2>
        </div>
        <a ref={cta.ref as React.RefObject<HTMLAnchorElement>} className={`btn rv${cta.isVisible ? " in" : ""}`} href="#wijnen">
          {t("Shop alle wijnen", "Shop all wines")} <span className="arr">→</span>
        </a>
      </div>
      <div className="wine-row">
        {WINES.map((wine) => (
          <WineCard key={wine.n} wine={wine} lang={lang} />
        ))}
      </div>
    </section>
  );
}
