// components/place.tsx
"use client";

import { useLanguage } from "@/lib/language";
import { useReveal } from "@/lib/use-reveal";
import { useParallax } from "@/lib/use-parallax";
import { useMagnetic } from "@/lib/use-magnetic";
import type { PlaceContent } from "@/lib/content/defaults";

import { parseImageSrc } from "@/lib/content/defaults";

export function Place({ content }: { content: PlaceContent }) {
  const { t } = useLanguage();
  const parallaxRef = useParallax(0.18);
  const label = useReveal();
  const heading1 = useReveal();
  const heading2 = useReveal(0.12);
  const address = useReveal();
  const hours = useReveal(0.1);
  const route = useReveal(0.2);
  const cta = useReveal(0.3);
  const ctaMagnetic = useMagnetic();

  const rawUrl = content.place_image_url ? t(content.place_image_url.nl, content.place_image_url.en) : "/assets/place-map.jpg";
  const parsed = parseImageSrc(rawUrl);

  return (
    <section className="place on-dark" id="bezoek">
      <div ref={parallaxRef as React.RefObject<HTMLDivElement>} className="place-media">
        <img
          src={parsed.src}
          alt="Chateau Amsterdam Winery exterior at waterfront in Amsterdam-Noord during evening blue hour"
          style={{ objectPosition: parsed.objectPosition || "center" }}
        />
      </div>
      <div className="place-inner">
        <div ref={label.ref as React.RefObject<HTMLDivElement>} className={`label rv${label.isVisible ? " in" : ""}`}>
          {content.label.nl} <span className="en">· {content.label.en === "The venue" ? "visit us" : content.label.en}</span>
        </div>
        <h2>
          <span ref={heading1.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${heading1.isVisible ? " in" : ""}`}>
            <span>{t(content.heading_line1.nl, content.heading_line1.en)}</span>
          </span>
          <span ref={heading2.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${heading2.isVisible ? " in" : ""}`}>
            <span>
              <em>{t(content.heading_line2.nl, content.heading_line2.en)}</em>
            </span>
          </span>
        </h2>
        <div className="place-grid">
          <div ref={address.ref as React.RefObject<HTMLDivElement>} className={`rv${address.isVisible ? " in" : ""}`}>
            <h4>{t(content.address_heading.nl, content.address_heading.en)}</h4>
            <p>
              {t(content.address_line1.nl, content.address_line1.en)}
              <br />
              {t(content.address_line2.nl, content.address_line2.en)}
            </p>
          </div>
          <div ref={hours.ref as React.RefObject<HTMLDivElement>} className={`rv${hours.isVisible ? " in" : ""}`}>
            <h4>{t(content.hours_heading.nl, content.hours_heading.en)}</h4>
            <p>
              {t(content.hours_line1.nl, content.hours_line1.en)}
              <br />
              {t(content.hours_line2.nl, content.hours_line2.en)}
            </p>
          </div>
          <div ref={route.ref as React.RefObject<HTMLDivElement>} className={`rv${route.isVisible ? " in" : ""}`}>
            <h4>Route</h4>
            <p>
              {t(content.route_line1.nl, content.route_line1.en)}
              <br />
              {t(content.route_line2.nl, content.route_line2.en)}
            </p>
          </div>
          <div ref={cta.ref as React.RefObject<HTMLDivElement>} className={`rv${cta.isVisible ? " in" : ""}`}>
            <a className="btn btn--light" ref={ctaMagnetic as React.RefObject<HTMLAnchorElement>} href="#bezoek">
              {t(content.cta_label.nl, content.cta_label.en)} <span className="arr">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
