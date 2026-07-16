"use client";

import { useLanguage } from "@/lib/language";
import { useReveal } from "@/lib/use-reveal";
import { Counter } from "./counter";

const STATS: Array<{ target: number; format?: "dots"; suffix?: string; nl: string; en: string; delay: number }> = [
  { target: 91, nl: "Decanter-punten voor wijn uit Noord", en: "Decanter points for wine from North", delay: 0 },
  { target: 1500, format: "dots", suffix: " m²", nl: "Machinefabriek aan het IJ", en: "Machine factory on the IJ", delay: 0.1 },
  { target: 5, nl: "Landen waar onze druiven groeien", en: "Countries where our grapes grow", delay: 0.2 },
  { target: 200000, format: "dots", suffix: "+", nl: "Flessen per jaar, gemaakt in Noord", en: "Bottles per year, made in North", delay: 0.3 },
];

function Stat({ stat, lang }: { stat: (typeof STATS)[number]; lang: "nl" | "en" }) {
  const reveal = useReveal(stat.delay);
  return (
    <div ref={reveal.ref as React.RefObject<HTMLDivElement>} className={`stat rv${reveal.isVisible ? " in" : ""}`}>
      <div className="num">
        <Counter target={stat.target} format={stat.format} />
        {stat.suffix ? <sub>{stat.suffix}</sub> : null}
      </div>
      <div className="desc">{lang === "nl" ? stat.nl : stat.en}</div>
    </div>
  );
}

export function Manifest() {
  const { lang, t } = useLanguage();
  const label = useReveal();
  const title1 = useReveal();
  const title2 = useReveal(0.15);
  const body = useReveal();

  return (
    <section className="manifest on-dark" id="verhaal">
      <div ref={label.ref as React.RefObject<HTMLDivElement>} className={`label rv${label.isVisible ? " in" : ""}`}>
        {t("Het verhaal", "Our story")} <span className="en">· no vineyard, still wine</span>
      </div>
      <h2 className="manifest-title">
        <span ref={title1.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${title1.isVisible ? " in" : ""}`}>
          <span>{t("Geen wijngaard.", "No vineyard.")}</span>
        </span>
        <span ref={title2.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${title2.isVisible ? " in" : ""}`}>
          <span className="alt">{t("Wel wijn.", "Still wine.")}</span>
        </span>
      </h2>
      <div className="manifest-body">
        <div></div>
        <div className="rule">
          <p ref={body.ref as React.RefObject<HTMLParagraphElement>} className={`rv${body.isVisible ? " in" : ""}`}>
            {lang === "nl" ? (
              <>
                Sinds 2017 reizen druiven van families en boeren uit heel Europa gekoeld naar Amsterdam-Noord. In een
                oude machinefabriek aan het IJ, tussen <strong>stalen tanks, betonnen eieren, amforen en eikenhouten
                vaten</strong>, worden ze wijn. Omdat we de stad als wijngaard hebben, zijn we vrijer dan elke
                klassieke producent. Riesling die Moscatel ontmoet? Hier kan het.
              </>
            ) : (
              <>
                Since 2017, grapes from families and farmers all over Europe travel chilled to Amsterdam-Noord. In an
                old machine factory on the IJ, between <strong>steel tanks, concrete eggs, amphorae, and oak
                barrels</strong>, they become wine. Because we have the city as our vineyard, we are freer than any
                classic producer. Riesling meeting Moscatel? Here it&apos;s possible.
              </>
            )}
          </p>
        </div>
      </div>
      <div className="stats">
        {STATS.map((stat) => (
          <Stat key={stat.nl} stat={stat} lang={lang} />
        ))}
      </div>
    </section>
  );
}
