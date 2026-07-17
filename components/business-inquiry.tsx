// components/business-inquiry.tsx
"use client";

import { useRef, useState } from "react";
import { useLanguage } from "@/lib/language";
import { submitBusinessInquiry } from "@/app/(site)/voor-bedrijven/actions";
import { BUSINESS_ERROR_MESSAGES, OCCASIONS, SERVICES, VOOR_BEDRIJVEN_COPY as C } from "@/lib/content/voor-bedrijven";

export function BusinessInquiry({ verzonden, fout }: { verzonden?: string; fout?: string }) {
  const { t } = useLanguage();
  const [occasion, setOccasion] = useState(OCCASIONS[0].nl);
  const [pulse, setPulse] = useState(false);
  const formCardRef = useRef<HTMLDivElement>(null);
  const errorPair = fout ? BUSINESS_ERROR_MESSAGES[fout] : null;

  function handleServiceClick(occasionNl: string) {
    setOccasion(occasionNl);
    formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setPulse(true);
    setTimeout(() => setPulse(false), 900);
  }

  return (
    <div className="bd-body-grid">
      <div className="bd-index">
        <div className="bd-label bd-index-label">{t(C.indexLabel.nl, C.indexLabel.en)}</div>
        {SERVICES.map((service, index) => (
          <div
            key={service.key}
            className="bd-service"
            role="button"
            tabIndex={0}
            aria-label={t(`Kies onderwerp: ${service.title.nl}`, `Choose subject: ${service.title.en}`)}
            onClick={() => handleServiceClick(service.occasion.nl)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleServiceClick(service.occasion.nl);
            }}
          >
            <div className="thumb">
              <img src={service.img} alt={t(service.alt.nl, service.alt.en)} loading="lazy" decoding="async" />
            </div>
            <div className="info">
              <div className="num">N°{String(index + 1).padStart(2, "0")}</div>
              <h3>{t(service.title.nl, service.title.en)}</h3>
              <p>{t(service.body.nl, service.body.en)}</p>
            </div>
            <div className="go" aria-hidden="true">
              →
            </div>
          </div>
        ))}
      </div>

      <div className="bd-sticky">
        <div className={`bd-form-card${pulse ? " is-pulsing" : ""}`} ref={formCardRef}>
          <div className="bd-label">{t(C.formLabel.nl, C.formLabel.en)}</div>
          <h2>{t(C.formHeading.nl, C.formHeading.en)}</h2>
          {verzonden ? (
            <p className="bd-form-success">{t(C.formSuccess.nl, C.formSuccess.en)}</p>
          ) : (
            <>
              <p>{t(C.formIntro.nl, C.formIntro.en)}</p>
              <form action={submitBusinessInquiry}>
                {errorPair ? <p className="bd-form-error">{t(errorPair.nl, errorPair.en)}</p> : null}
                <div className="bd-field">
                  <label htmlFor="occasion">{t(C.fieldOccasion.nl, C.fieldOccasion.en)}</label>
                  <select
                    id="occasion"
                    name="occasion"
                    className="bd-input"
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                  >
                    {OCCASIONS.map((o) => (
                      <option key={o.key} value={o.nl}>
                        {t(o.nl, o.en)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="bd-form-row">
                  <div className="bd-field">
                    <label htmlFor="name">{t(C.fieldName.nl, C.fieldName.en)}</label>
                    <input
                      required
                      id="name"
                      type="text"
                      name="name"
                      maxLength={200}
                      placeholder={t(C.fieldNamePlaceholder.nl, C.fieldNamePlaceholder.en)}
                      className="bd-input"
                    />
                  </div>
                  <div className="bd-field">
                    <label htmlFor="companyName">{t(C.fieldCompany.nl, C.fieldCompany.en)}</label>
                    <input
                      id="companyName"
                      type="text"
                      name="companyName"
                      maxLength={200}
                      placeholder={t(C.fieldCompanyPlaceholder.nl, C.fieldCompanyPlaceholder.en)}
                      className="bd-input"
                    />
                  </div>
                </div>
                <div className="bd-form-row">
                  <div className="bd-field">
                    <label htmlFor="email">{t(C.fieldEmail.nl, C.fieldEmail.en)}</label>
                    <input
                      required
                      id="email"
                      type="email"
                      name="email"
                      maxLength={200}
                      placeholder={t(C.fieldEmailPlaceholder.nl, C.fieldEmailPlaceholder.en)}
                      className="bd-input"
                    />
                  </div>
                  <div className="bd-field">
                    <label htmlFor="phone">{t(C.fieldPhone.nl, C.fieldPhone.en)}</label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      maxLength={40}
                      placeholder={t(C.fieldPhonePlaceholder.nl, C.fieldPhonePlaceholder.en)}
                      className="bd-input"
                    />
                  </div>
                </div>
                <div className="bd-field">
                  <label htmlFor="groupSize">{t(C.fieldGroupSize.nl, C.fieldGroupSize.en)}</label>
                  <input
                    id="groupSize"
                    type="number"
                    name="groupSize"
                    min={1}
                    placeholder={t(C.fieldGroupSizePlaceholder.nl, C.fieldGroupSizePlaceholder.en)}
                    className="bd-input"
                  />
                </div>
                <div className="bd-field">
                  <label htmlFor="notes">{t(C.fieldNotes.nl, C.fieldNotes.en)}</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={2}
                    maxLength={2000}
                    placeholder={t(C.fieldNotesPlaceholder.nl, C.fieldNotesPlaceholder.en)}
                    className="bd-input"
                  />
                </div>
                <button type="submit" className="bd-submit">
                  {t(C.submit.nl, C.submit.en)}
                </button>
              </form>
              <p className="bd-form-note">{t(C.formNote.nl, C.formNote.en)}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
