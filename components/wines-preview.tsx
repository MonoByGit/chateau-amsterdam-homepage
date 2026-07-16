// components/wines-preview.tsx
"use client";

import { useCallback } from "react";
import { useLanguage } from "@/lib/language";
import { useReveal } from "@/lib/use-reveal";
import { useMagnetic } from "@/lib/use-magnetic";
import type { WinesContent } from "@/lib/content/defaults";

export type WineCardData = {
  n: string;
  meta: string;
  name: string;
  nlTag: string;
  enTag: string;
  price: string;
  img: string;
  alt: string;
  delay: number;
};

function WineCard({ wine, lang }: { wine: WineCardData; lang: "nl" | "en" }) {
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

export function WinesPreview({ content, wines }: { content: WinesContent; wines: WineCardData[] }) {
  const { lang, t } = useLanguage();
  const heading1 = useReveal();
  const heading2 = useReveal(0.12);
  const cta = useReveal(0.2);
  const ctaMagnetic = useMagnetic();
  // The "Shop alle wijnen" link already carries the useReveal ref directly
  // (unlike the other magnetic targets, whose reveal refs sit on a
  // surrounding container). Compose both refs on the same node instead of
  // dropping either effect.
  const setCtaRef = useCallback(
    (node: HTMLAnchorElement | null) => {
      cta.ref.current = node;
      ctaMagnetic.current = node;
    },
    [cta.ref, ctaMagnetic]
  );

  return (
    <section className="wines" id="wijnen">
      <div className="wines-head">
        <div>
          <div className="label rv in">
            {t(content.label.nl, content.label.en)} <span className="en">· made in Noord</span>
          </div>
          <h2>
            <span ref={heading1.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${heading1.isVisible ? " in" : ""}`}>
              <span>{t(content.heading_line1.nl, content.heading_line1.en)}</span>
            </span>
            <span ref={heading2.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${heading2.isVisible ? " in" : ""}`}>
              <span>
                {t(content.heading_line2_lead.nl, content.heading_line2_lead.en)}
                <em>{t(content.heading_line2_em.nl, content.heading_line2_em.en)}</em>
              </span>
            </span>
          </h2>
        </div>
        <a ref={setCtaRef} className={`btn rv${cta.isVisible ? " in" : ""}`} href="#wijnen">
          {t(content.cta_label.nl, content.cta_label.en)} <span className="arr">→</span>
        </a>
      </div>
      <div className="wine-row">
        {wines.map((wine) => (
          <WineCard key={wine.n} wine={wine} lang={lang} />
        ))}
      </div>
    </section>
  );
}
