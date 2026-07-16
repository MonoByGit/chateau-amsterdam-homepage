"use client";

import { useLanguage } from "@/lib/language";
import { useReveal } from "@/lib/use-reveal";

const STEPS: Array<{ idx: string; nlTitle: string; enTitle: string; nlBody: string; enBody: string; img: string; alt: string }> = [
  {
    idx: "01",
    nlTitle: "De druif",
    enTitle: "The grape",
    nlBody: "Geselecteerde boeren en families in Frankrijk, Duitsland, Italië, Spanje en Nederland. Biologisch geteeld, op het juiste moment met de hand geplukt.",
    enBody: "Selected farmers and families in France, Germany, Italy, Spain, and the Netherlands. Organically grown, hand-picked at the perfect moment.",
    img: "/assets/step-druif.png",
    alt: "Close-up of hands picking organic red wine grapes into a rustic wooden box",
  },
  {
    idx: "02",
    nlTitle: "De reis",
    enTitle: "The journey",
    nlBody: "Gekoeld transport naar Noord. Onderweg weken de schillen al. De eerste meters van de wijn worden op de snelweg gemaakt.",
    enBody: "Chilled transport to North. The skins are already macerating along the way. The wine's first meters are made on the highway.",
    img: "/assets/step-reis.png",
    alt: "Crates of fresh grapes inside a cold storage delivery truck with condensation",
  },
  {
    idx: "03",
    nlTitle: "De makerij",
    enTitle: "The winery",
    nlBody: "Staal, beton, amfora of eik: er is weinig dat hier niet kan. Ons eigen lab waakt over elke liter, van most tot botteling.",
    enBody: "Steel, concrete, amphora, or oak: there is little that isn't possible here. Our own lab watches over every liter, from must to bottling.",
    img: "/assets/step-makerij.png",
    alt: "Winemaker measuring wine levels near large stainless steel fermentation tanks",
  },
  {
    idx: "04",
    nlTitle: "De fles",
    enTitle: "The bottle",
    nlBody: "Gebotteld aan het IJ. En zero waste: schillen en pitten worden bier, grappa en onze eigen Piquette d'Amsterdam.",
    enBody: "Bottled on the IJ. And zero waste: skins and seeds become beer, grappa, and our own Piquette d'Amsterdam.",
    img: "/assets/step-fles.png",
    alt: "Automated bottling and labeling machine with wine bottles in a row",
  },
];

function Step({ step, lang }: { step: (typeof STEPS)[number]; lang: "nl" | "en" }) {
  const reveal = useReveal();
  return (
    <article ref={reveal.ref as React.RefObject<HTMLElement>} className={`step rv${reveal.isVisible ? " in" : ""}`}>
      <div className="idx">{step.idx}</div>
      <div>
        <h3>
          {lang === "nl" ? step.nlTitle : step.enTitle} <small>{lang === "nl" ? step.enTitle : step.nlTitle}</small>
        </h3>
        <p>{lang === "nl" ? step.nlBody : step.enBody}</p>
      </div>
      <div className="slotwrap">
        <img src={step.img} alt={step.alt} className="step-img" />
      </div>
    </article>
  );
}

export function Process() {
  const { lang, t } = useLanguage();
  const heading = useReveal();
  const sub = useReveal(0.15);

  return (
    <section className="process" id="proces">
      <div className="label rv in">
        Het proces <span className="en">· grape to glass</span>
      </div>
      <div className="process-grid">
        <div className="process-sticky">
          <h2 ref={heading.ref as React.RefObject<HTMLHeadingElement>} className={`rv${heading.isVisible ? " in" : ""}`}>
            {lang === "nl" ? (
              <>Van boer tot fles, <em>dwars door de stad.</em></>
            ) : (
              <>From farmer to bottle, <em>straight through the city.</em></>
            )}
          </h2>
          <p ref={sub.ref as React.RefObject<HTMLParagraphElement>} className={`sub rv${sub.isVisible ? " in" : ""}`}>
            {t(
              "Wij verplaatsen de druif, niet de wijn. Daardoor zie je hier van dichtbij hoe wijn écht gemaakt wordt.",
              "We move the grape, not the wine. This lets you experience close-up how wine is truly made."
            )}
          </p>
        </div>
        <div className="process-steps">
          {STEPS.map((step) => (
            <Step key={step.idx} step={step} lang={lang} />
          ))}
        </div>
      </div>
    </section>
  );
}
