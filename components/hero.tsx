"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language";
import { useReveal } from "@/lib/use-reveal";
import { useParallax } from "@/lib/use-parallax";

const MARQUEE_ITEMS: Array<{ nl: string; en: string } | string> = [
  { nl: "Eerste urban winery van Nederland", en: "First urban winery in the Netherlands" },
  { nl: "De grootste van Europa", en: "The largest in Europe" },
  "Druiven uit FR · DE · IT · ES · NL",
  { nl: "Tastings tussen de tanks", en: "Tastings among the tanks" },
  { nl: "Zero waste sinds dag één", en: "Zero waste since day one" },
];

function MarqueeTrack({ lang }: { lang: "nl" | "en" }) {
  return (
    <>
      {MARQUEE_ITEMS.map((item, i) => (
        <span key={i}>{typeof item === "string" ? item : lang === "nl" ? item.nl : item.en}</span>
      ))}
    </>
  );
}

export function Hero() {
  const { lang, t } = useLanguage();
  const [loaded, setLoaded] = useState(false);
  const parallaxRef = useParallax(0.08);
  const introReveal = useReveal(0.55);
  const ctaReveal = useReveal(0.7);
  const mediaReveal = useReveal(0.45);

  useEffect(() => {
    const timeout = setTimeout(() => setLoaded(true), 200);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className={`hero${loaded ? " loaded" : ""}`} id="top">
      <div className="hero-top">
        <span className="rv-line in">
          <span>Est. 2017 · Amsterdam-Noord</span>
        </span>
        <span className="rv-line in">
          <span>52.3914°N&nbsp;&nbsp;4.9131°E · aan het IJ</span>
        </span>
        <span className="rv-line in">
          <span>{t("Wijn uit de stad, voor de stad", "Wine from the city, for the city")}</span>
        </span>
      </div>

      <h1 className="hero-title">
        <span className="row rv-line in">
          <span>Chateau</span>
        </span>
        <span className="row rv-line in">
          <span>Amsterdam</span>
        </span>
        <span className="hero-script">{t("de urban winery", "the urban winery")}</span>
      </h1>

      <div className="hero-deck">
        <div className="hero-intro">
          <p ref={introReveal.ref as React.RefObject<HTMLParagraphElement>} className={`rv${introReveal.isVisible ? " in" : ""}`}>
            {lang === "nl" ? (
              <>
                Druiven uit heel Europa, gekoeld naar een machinefabriek aan het IJ gebracht. Daar maken wij wijn:{" "}
                <em>geen wijngaard, wel wijn.</em>
              </>
            ) : (
              <>
                Grapes from all over Europe, transported chilled to a machine factory on the IJ. That&apos;s where we
                make wine: <em>no vineyard, still wine.</em>
              </>
            )}
          </p>
          <div ref={ctaReveal.ref as React.RefObject<HTMLDivElement>} className={`hero-ctas rv${ctaReveal.isVisible ? " in" : ""}`}>
            <a className="btn btn--primary" href="#paden">
              {t("Boek een tasting", "Book a tasting")} <span className="arr">→</span>
            </a>
            <a className="btn" href="#bedrijven">
              {t("Voor bedrijven", "For businesses")} <span className="arr">→</span>
            </a>
          </div>
        </div>
        <figure ref={mediaReveal.ref as React.RefObject<HTMLElement>} className={`hero-media rv${mediaReveal.isVisible ? " in" : ""}`}>
          <div className="media-clip">
            <div ref={parallaxRef as React.RefObject<HTMLDivElement>} className="pwrap">
              <img
                src="/assets/hero-winery.png"
                alt="Chateau Amsterdam Winery Interior Hall with stainless steel tanks and oak barrels"
              />
            </div>
          </div>
          <figcaption>
            {t("↳ De makerij, Johan van Hasseltweg, Noord", "↳ The winery, Johan van Hasseltweg, Amsterdam-Noord")}
          </figcaption>
        </figure>
      </div>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          <MarqueeTrack lang={lang} />
          <MarqueeTrack lang={lang} />
        </div>
      </div>
    </section>
  );
}
