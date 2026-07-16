"use client";

import { useLanguage } from "@/lib/language";
import { useReveal } from "@/lib/use-reveal";
import { useParallax } from "@/lib/use-parallax";

export function Place() {
  const { t } = useLanguage();
  const parallaxRef = useParallax(0.12);
  const label = useReveal();
  const heading1 = useReveal();
  const heading2 = useReveal(0.12);
  const address = useReveal();
  const hours = useReveal(0.1);
  const route = useReveal(0.2);
  const cta = useReveal(0.3);

  return (
    <section className="place on-dark" id="bezoek">
      <div ref={parallaxRef as React.RefObject<HTMLDivElement>} className="place-media">
        <img
          src="/assets/place-hal.png"
          alt="Chateau Amsterdam Winery exterior at waterfront in Amsterdam-Noord during evening blue hour"
        />
      </div>
      <div className="place-inner">
        <div ref={label.ref as React.RefObject<HTMLDivElement>} className={`label rv${label.isVisible ? " in" : ""}`}>
          {t("De plek", "The venue")} <span className="en">· visit us</span>
        </div>
        <h2>
          <span ref={heading1.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${heading1.isVisible ? " in" : ""}`}>
            <span>{t("Een machinefabriek", "A machine factory")}</span>
          </span>
          <span ref={heading2.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${heading2.isVisible ? " in" : ""}`}>
            <span>
              <em>{t("aan het IJ.", "on the IJ.")}</em>
            </span>
          </span>
        </h2>
        <div className="place-grid">
          <div ref={address.ref as React.RefObject<HTMLDivElement>} className={`rv${address.isVisible ? " in" : ""}`}>
            <h4>{t("Adres", "Address")}</h4>
            <p>
              Johan van Hasseltweg
              <br />
              Amsterdam-Noord
            </p>
          </div>
          <div ref={hours.ref as React.RefObject<HTMLDivElement>} className={`rv${hours.isVisible ? " in" : ""}`}>
            <h4>{t("Open", "Hours")}</h4>
            <p>
              {t("Wo t/m zo", "Wed thru Sun")}
              <br />
              {t("12.00 tot 18.30", "12:00 to 18:30")}
            </p>
          </div>
          <div ref={route.ref as React.RefObject<HTMLDivElement>} className={`rv${route.isVisible ? " in" : ""}`}>
            <h4>Route</h4>
            <p>
              {t("Pont vanaf CS, 10 min fietsen", "Ferry from Central Station, 10 min bike")}
              <br />
              {t("of metro 52 → Noorderpark", "or metro 52 → Noorderpark")}
            </p>
          </div>
          <div ref={cta.ref as React.RefObject<HTMLDivElement>} className={`rv${cta.isVisible ? " in" : ""}`}>
            <a className="btn btn--light" href="#bezoek">
              {t("Plan je bezoek", "Plan your visit")} <span className="arr">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
