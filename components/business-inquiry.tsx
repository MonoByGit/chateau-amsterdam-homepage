// components/business-inquiry.tsx
"use client";

import { useRef, useState } from "react";
import { submitBusinessInquiry } from "@/app/(site)/voor-bedrijven/actions";

const SERVICES = [
  {
    n: "N°01",
    option: "Zakelijke tasting of borrel",
    img: "/assets/hero-winery.png",
    alt: "Borrel tussen de tanks",
    title: "Tastings & borrels",
    body: "Zet je team tussen de tanks. Van 10 tot 60 personen, met of zonder bites erbij.",
  },
  {
    n: "N°02",
    option: "Private label / relatiegeschenk",
    img: "/assets/step-druif.png",
    alt: "Druiven voor private label",
    title: "Private label & relatiegeschenken",
    body: "Jullie naam op de fles. Wij vinifiëren, jij bepaalt het etiket en het verhaal erachter.",
  },
  {
    n: "N°03",
    option: "Event of locatieverhuur",
    img: "/assets/step-makerij.png",
    alt: "Event in de winery-hal",
    title: "Events & locatieverhuur",
    body: "De winery als decor. 20 tot 150 gasten, inclusief bar, geluid en sfeer.",
  },
  {
    n: "N°04",
    option: "Groothandel voor horeca",
    img: "/assets/step-fles.png",
    alt: "Groothandel levering",
    title: "Groothandel voor horeca",
    body: "Vaste plek op de kaart. Staffelkorting vanaf de eerste doos, altijd op voorraad.",
  },
] as const;

const OCCASIONS = [
  "Zakelijke tasting of borrel",
  "Private label / relatiegeschenk",
  "Event of locatieverhuur",
  "Groothandel voor horeca",
  "Iets anders",
];

export function BusinessInquiry({ verzonden, fout }: { verzonden?: string; fout?: string }) {
  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [pulse, setPulse] = useState(false);
  const formCardRef = useRef<HTMLDivElement>(null);

  function handleServiceClick(option: string) {
    setOccasion(option);
    formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setPulse(true);
    setTimeout(() => setPulse(false), 900);
  }

  return (
    <div className="bd-body-grid">
      <div className="bd-index">
        <div className="bd-label bd-index-label">Vier manieren, één aanspreekpunt</div>
        {SERVICES.map((service) => (
          <div
            key={service.n}
            className="bd-service"
            role="button"
            tabIndex={0}
            onClick={() => handleServiceClick(service.option)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleServiceClick(service.option);
            }}
          >
            <div className="thumb">
              <img src={service.img} alt={service.alt} />
            </div>
            <div className="info">
              <div className="num">{service.n}</div>
              <h3>{service.title}</h3>
              <p>{service.body}</p>
            </div>
            <div className="go" aria-hidden="true">
              →
            </div>
          </div>
        ))}
      </div>

      <div className="bd-sticky">
        <div className={`bd-form-card${pulse ? " is-pulsing" : ""}`} ref={formCardRef}>
          <div className="bd-label">Aanvraag</div>
          <h2>Vertel ons waar je aan denkt.</h2>
          {verzonden ? (
            <p className="bd-form-success">Bedankt. We nemen zo snel mogelijk contact op.</p>
          ) : (
            <>
              <p>Eén formulier, rechtstreeks bij het team.</p>
              <form action={submitBusinessInquiry}>
                {fout ? <p className="bd-form-error">{fout}</p> : null}
                <div className="bd-field">
                  <label htmlFor="occasion">Onderwerp</label>
                  <select
                    id="occasion"
                    name="occasion"
                    className="bd-input"
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                  >
                    {OCCASIONS.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div className="bd-form-row">
                  <div className="bd-field">
                    <label htmlFor="name">Naam</label>
                    <input required id="name" type="text" name="name" placeholder="Voor- en achternaam" className="bd-input" />
                  </div>
                  <div className="bd-field">
                    <label htmlFor="companyName">Bedrijf</label>
                    <input id="companyName" type="text" name="companyName" placeholder="Bedrijfsnaam" className="bd-input" />
                  </div>
                </div>
                <div className="bd-field">
                  <label htmlFor="email">E-mail</label>
                  <input required id="email" type="email" name="email" placeholder="naam@bedrijf.nl" className="bd-input" />
                </div>
                <div className="bd-field">
                  <label htmlFor="phone">Telefoon (optioneel)</label>
                  <input id="phone" type="tel" name="phone" placeholder="06 12345678" className="bd-input" />
                </div>
                <div className="bd-field">
                  <label htmlFor="notes">Vertel iets over je aanvraag</label>
                  <textarea id="notes" name="notes" rows={2} placeholder="Waar denk je aan?" className="bd-input" />
                </div>
                <button type="submit" className="bd-submit">
                  Versturen →
                </button>
              </form>
              <p className="bd-form-note">We reageren binnen 1 werkdag.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
