// components/hero.tsx
"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language";
import { useReveal } from "@/lib/use-reveal";
import { useParallax } from "@/lib/use-parallax";
import { useMagnetic } from "@/lib/use-magnetic";
import type { HeroContent, MarqueeContent } from "@/lib/content/defaults";
import { parseImageSrc } from "@/lib/content/defaults";

const MARQUEE_KEYS: Array<keyof MarqueeContent> = [
  "marquee_1",
  "marquee_2",
  "marquee_3",
  "marquee_4",
  "marquee_5",
];

function MarqueeTrack({ lang, marquee }: { lang: "nl" | "en"; marquee: MarqueeContent }) {
  return (
    <>
      {MARQUEE_KEYS.map((key) => (
        <span key={key}>{lang === "nl" ? marquee[key].nl : marquee[key].en}</span>
      ))}
    </>
  );
}

export function Hero({ content, marquee }: { content: HeroContent; marquee: MarqueeContent }) {
  const { lang, t } = useLanguage();
  const [loaded, setLoaded] = useState(false);
  const parallaxRef = useParallax(0.08);
  const introReveal = useReveal(0.55);
  const ctaReveal = useReveal(0.7);
  const mediaReveal = useReveal(0.45);
  const primaryCtaMagnetic = useMagnetic();
  const secondaryCtaMagnetic = useMagnetic();

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
          <span>{t(content.eyebrow_3.nl, content.eyebrow_3.en)}</span>
        </span>
      </div>

      <h1 className="hero-title">
        <span className="row rv-line in">
          <span>Chateau</span>
        </span>
        <span className="row rv-line in">
          <span>Amsterdam</span>
        </span>
        <span className="hero-script">{t(content.script_tagline.nl, content.script_tagline.en)}</span>
      </h1>

      <div className="hero-deck">
        <div className="hero-intro">
          <p ref={introReveal.ref as React.RefObject<HTMLParagraphElement>} className={`rv${introReveal.isVisible ? " in" : ""}`}>
            {lang === "nl" ? content.intro_lead.nl : content.intro_lead.en}
            <em>{lang === "nl" ? content.intro_em.nl : content.intro_em.en}</em>
          </p>
          <div ref={ctaReveal.ref as React.RefObject<HTMLDivElement>} className={`hero-ctas rv${ctaReveal.isVisible ? " in" : ""}`}>
            <a className="btn btn--primary" ref={primaryCtaMagnetic as React.RefObject<HTMLAnchorElement>} href="/tours-tastings#reserveren">
              {t(content.cta_primary.nl, content.cta_primary.en)} <span className="arr">→</span>
            </a>
            <a className="btn" ref={secondaryCtaMagnetic as React.RefObject<HTMLAnchorElement>} href="/voor-bedrijven">
              {t(content.cta_secondary.nl, content.cta_secondary.en)} <span className="arr">→</span>
            </a>
          </div>
        </div>
        <figure ref={mediaReveal.ref as React.RefObject<HTMLElement>} className={`hero-media rv${mediaReveal.isVisible ? " in" : ""}`}>
          <div className="media-clip">
            <div ref={parallaxRef as React.RefObject<HTMLDivElement>} className="pwrap">
              {(() => {
                const rawUrl = content.hero_image_url ? t(content.hero_image_url.nl, content.hero_image_url.en) : "/assets/hero-winery.jpg";
                const parsed = parseImageSrc(rawUrl);
                return (
                  <img
                    src={parsed.src}
                    alt="Chateau Amsterdam Winery Interior Hall with stainless steel tanks and oak barrels"
                    style={{ objectPosition: parsed.objectPosition || "center" }}
                  />
                );
              })()}
            </div>
          </div>
          <figcaption>{t(content.media_caption.nl, content.media_caption.en)}</figcaption>
        </figure>
      </div>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          <MarqueeTrack lang={lang} marquee={marquee} />
          <MarqueeTrack lang={lang} marquee={marquee} />
        </div>
      </div>
    </section>
  );
}
