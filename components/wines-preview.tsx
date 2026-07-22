// components/wines-preview.tsx
"use client";

import { useCallback } from "react";
import { useLanguage } from "@/lib/language";
import { useReveal } from "@/lib/use-reveal";
import { useMagnetic } from "@/lib/use-magnetic";
import type { WinesContent } from "@/lib/content/defaults";
import { WineCard, type WineCardData } from "./wine-card";

export type { WineCardData };

function RevealingWineCard({ wine, lang }: { wine: WineCardData; lang: "nl" | "en" }) {
  const reveal = useReveal(wine.delay);
  return <WineCard wine={wine} lang={lang} reveal={reveal} />;
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
            {content.label.nl} <span className="en">· {content.label.en === "Our wines" ? "made in Noord" : content.label.en}</span>
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
        <a ref={setCtaRef} className={`btn rv${cta.isVisible ? " in" : ""}`} href="/wijnen">
          {t(content.cta_label.nl, content.cta_label.en)} <span className="arr">→</span>
        </a>
      </div>
      <div className="wine-row">
        {wines.map((wine) => (
          <RevealingWineCard key={wine.n} wine={wine} lang={lang} />
        ))}
      </div>
    </section>
  );
}
