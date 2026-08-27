// components/tours-tastings-content.tsx
"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language";
import { submitTastingInquiry } from "@/app/(site)/tours-tastings/actions";
import { getPreferredPeriodsForDate, OCCASIONS, PREFERRED_PERIODS, TOUR_LANGUAGES, TASTING_ERROR_MESSAGES, TOURS_TASTINGS_COPY as C } from "@/lib/content/tours-tastings";
import { PartySizeField } from "@/components/tastings-party-size-field";
import { DateField } from "@/components/tastings-date-field";

import { TOURS_TASTINGS_PAGE_DEFAULTS, type ToursTastingsPageContent } from "@/lib/content/defaults";

import { useState } from "react";

import { parseImageSrc } from "@/lib/content/defaults";

export function ToursTastingsContent({
  verzonden,
  fout,
  content = TOURS_TASTINGS_PAGE_DEFAULTS,
  blockedFullDays = [],
  blockedSlotsByDate = {},
}: {
  verzonden?: string;
  fout?: string;
  content?: ToursTastingsPageContent;
  blockedFullDays?: string[];
  blockedSlotsByDate?: Record<string, string[]>;
}) {
  const { t, lang } = useLanguage();
  const [selectedDateIso, setSelectedDateIso] = useState<string>("");
  const errorPair = fout ? TASTING_ERROR_MESSAGES[fout] : null;

  const currentBlockedSlots = selectedDateIso ? blockedSlotsByDate[selectedDateIso] ?? [] : [];
  const availablePeriods = getPreferredPeriodsForDate(selectedDateIso);

  const heroParsed = parseImageSrc(content.hero_photo_url ? t(content.hero_photo_url.nl, content.hero_photo_url.en) : "/assets/tasting-hero.jpg");
  const tourMainParsed = parseImageSrc(content.tour_main_photo_url ? t(content.tour_main_photo_url.nl, content.tour_main_photo_url.en) : "/assets/step-makerij.jpg");
  const tourDetailParsed = parseImageSrc(content.tour_detail_photo_url ? t(content.tour_detail_photo_url.nl, content.tour_detail_photo_url.en) : "/assets/step-druif.jpg");
  const tastingMainParsed = parseImageSrc(content.tasting_main_photo_url ? t(content.tasting_main_photo_url.nl, content.tasting_main_photo_url.en) : "/assets/path-taste.jpg");
  const reserveParsed = parseImageSrc(content.reserve_photo_url ? t(content.reserve_photo_url.nl, content.reserve_photo_url.en) : "/assets/place-map.jpg");

  return (
    <>
      <section className="tastings-hero">
        <div className="tastings-hero-media">
          <img
            src={heroParsed.src}
            alt={t(C.heroAlt.nl, C.heroAlt.en)}
            fetchPriority="high"
            style={{ objectPosition: heroParsed.objectPosition || "center" }}
          />
        </div>
        <nav className="tastings-hero-top">
          <div>
            <Link href="/">{t(C.breadcrumbHome.nl, C.breadcrumbHome.en)}</Link>
            <span className="sep">/</span>
            <span className="current">{t(C.breadcrumbCurrent.nl, C.breadcrumbCurrent.en)}</span>
          </div>
          <div>Amsterdam</div>
        </nav>
        <div className="tastings-hero-body">
          <div className="tastings-label">{t(content.hero_label.nl, content.hero_label.en)}</div>
          <h1 className="tastings-hero-title">
            {t(content.hero_title_lead.nl, content.hero_title_lead.en)} <em>{t(content.hero_title_em.nl, content.hero_title_em.en)}</em>
          </h1>
          <p className="tastings-hero-sub">{t(content.hero_sub.nl, content.hero_sub.en)}</p>
        </div>
        <div className="tastings-scroll-cue">
          <span>{t(C.scroll.nl, C.scroll.en)}</span>
          <span className="line" />
        </div>
      </section>

      <section className="tastings-opening">
        <p>{t(content.opening_line1.nl, content.opening_line1.en)} {t(content.opening_line2.nl, content.opening_line2.en)}</p>
      </section>

      <section className="tastings-gang">
        <div className="tastings-gang-grid">
          <div className="tastings-gang-text">
            <div className="num">{t(C.tourNum.nl, C.tourNum.en)}</div>
            <h2>{t(content.tour_heading.nl, content.tour_heading.en)}</h2>
            <p>{t(content.tour_body.nl, content.tour_body.en)}</p>
          </div>
          <div className="tastings-gang-cluster">
            <div className="main">
              <img
                src={tourMainParsed.src}
                alt={t(C.tourMainAlt.nl, C.tourMainAlt.en)}
                loading="lazy"
                decoding="async"
                style={{ objectPosition: tourMainParsed.objectPosition || "center" }}
              />
            </div>
            <div className="detail">
              <img
                src={tourDetailParsed.src}
                alt={t(C.grapesAlt.nl, C.grapesAlt.en)}
                loading="lazy"
                decoding="async"
                style={{ objectPosition: tourDetailParsed.objectPosition || "center" }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="tastings-gang reverse">
        <div className="tastings-gang-grid">
          <div className="tastings-gang-cluster">
            <div className="main">
              <img
                src={tastingMainParsed.src}
                alt={t(C.tastingMainAlt.nl, C.tastingMainAlt.en)}
                loading="lazy"
                decoding="async"
                style={{ objectPosition: tastingMainParsed.objectPosition || "center" }}
              />
            </div>
            <div className="detail">
              <img
                src={tourDetailParsed.src}
                alt={t(C.grapesAlt.nl, C.grapesAlt.en)}
                loading="lazy"
                decoding="async"
                style={{ objectPosition: tourDetailParsed.objectPosition || "center" }}
              />
            </div>
          </div>
          <div className="tastings-gang-text">
            <div className="num">{t(C.tastingNum.nl, C.tastingNum.en)}</div>
            <h2>{t(content.tasting_heading.nl, content.tasting_heading.en)}</h2>
            <p>{t(content.tasting_body.nl, content.tasting_body.en)}</p>
          </div>
        </div>
      </section>

      <section className="tastings-strip">
        <div className="tastings-strip-inner">
          <div className="tastings-strip-item">
            <div className="n">{t(content.strip_duration.nl, content.strip_duration.en)}</div>
            <div className="d">{t(content.strip_duration_label.nl, content.strip_duration_label.en)}</div>
          </div>
          <div className="tastings-strip-item">
            <div className="n">{t(content.strip_wines.nl, content.strip_wines.en)}</div>
            <div className="d">{t(content.strip_wines_label.nl, content.strip_wines_label.en)}</div>
          </div>
          <div className="tastings-strip-item">
            <div className="n">{t(content.strip_discount.nl, content.strip_discount.en)}</div>
            <div className="d">{t(content.strip_discount_label.nl, content.strip_discount_label.en)}</div>
          </div>
          <div className="tastings-strip-item">
            <div className="n">{t(content.strip_price.nl, content.strip_price.en)}</div>
            <div className="d">{t(content.strip_price_label.nl, content.strip_price_label.en)}</div>
          </div>
        </div>
      </section>

      <section className="tastings-reserve" id="reserveren">
        <div className="tastings-reserve-media">
          <img
            src={reserveParsed.src}
            alt={t(C.reserveMediaAlt.nl, C.reserveMediaAlt.en)}
            loading="lazy"
            decoding="async"
            style={{ objectPosition: reserveParsed.objectPosition || "center" }}
          />
        </div>
        <div className="tastings-reserve-inner">
          <div className="tastings-reserve-head">
            <div className="tastings-label">{t(content.reserve_label.nl, content.reserve_label.en)}</div>
            <h2>{t(content.reserve_heading.nl, content.reserve_heading.en)}</h2>
            <p>{t(content.reserve_sub.nl, content.reserve_sub.en)}</p>
          </div>
          <div className="tastings-form-wrap">
            {verzonden ? (
              <div className="tastings-success-card">
                <div className="tastings-label">{t("Aanvraag ontvangen", "Request received")}</div>
                <h3>{t("We gaan ermee aan de slag.", "We're on it.")}</h3>
                <p>
                  {t(
                    "Bedankt voor je aanvraag! We gaan nu proberen je boeking op het gekozen tijdslot in te plannen. Je ontvangt spoedig een definitieve bevestiging van ons salesteam.",
                    "Thank you for your request! We are now scheduling your booking for the selected time slot. You will receive a final confirmation from our sales team shortly."
                  )}
                </p>
                <div className="tastings-success-contact">
                  <span>{t("Vragen of meer informatie?", "Questions or more information?")}</span>
                  <a href="mailto:sales@chateau.amsterdam">sales@chateau.amsterdam</a>
                </div>
              </div>
            ) : (
              <form action={submitTastingInquiry}>
                {errorPair ? <p className="tastings-form-error">{t(errorPair.nl, errorPair.en)}</p> : null}
                <div className="tastings-form-row">
                  <PartySizeField />
                  <DateField blockedFullDays={blockedFullDays} onSelectDate={setSelectedDateIso} />
                </div>
                <div className="tastings-form-row">
                  <div className="tastings-field">
                    <label htmlFor="preferredPeriod">
                      <span className="fn">03</span>
                      <span className="fl">{t(C.fieldPeriod.nl, C.fieldPeriod.en)}</span>
                    </label>
                    <select id="preferredPeriod" name="preferredPeriod" defaultValue={availablePeriods[0]?.nl} className="tastings-input" key={selectedDateIso}>
                      {availablePeriods.map((period) => {
                        const isBlocked = currentBlockedSlots.some((label) =>
                          label.toLowerCase().includes(period.nl.slice(0, 5).toLowerCase())
                        );
                        return (
                          <option key={period.key} value={period.nl} disabled={isBlocked}>
                            {t(period.nl, period.en)}{isBlocked ? ` (${t("Niet beschikbaar", "Not available")})` : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="tastings-field">
                    <label htmlFor="preferredLanguage">
                      <span className="fn">04</span>
                      <span className="fl">{t(C.fieldLanguage.nl, C.fieldLanguage.en)}</span>
                    </label>
                    <select id="preferredLanguage" name="preferredLanguage" defaultValue={lang === "en" ? "Engels" : "Nederlands"} className="tastings-input">
                      {TOUR_LANGUAGES.map((item) => (
                        <option key={item.key} value={item.nl}>
                          {t(item.nl, item.en)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="tastings-form-row">
                  <div className="tastings-field">
                    <label htmlFor="name">
                      <span className="fn">05</span>
                      <span className="fl">{t(C.fieldName.nl, C.fieldName.en)}</span>
                    </label>
                    <input
                      required
                      id="name"
                      type="text"
                      name="name"
                      maxLength={200}
                      placeholder={t(C.fieldNamePlaceholder.nl, C.fieldNamePlaceholder.en)}
                      className="tastings-input"
                    />
                  </div>
                  <div className="tastings-field">
                    <label htmlFor="email">
                      <span className="fn">06</span>
                      <span className="fl">{t(C.fieldEmail.nl, C.fieldEmail.en)}</span>
                    </label>
                    <input
                      required
                      id="email"
                      type="email"
                      name="email"
                      maxLength={200}
                      placeholder={t(C.fieldEmailPlaceholder.nl, C.fieldEmailPlaceholder.en)}
                      className="tastings-input"
                    />
                  </div>
                </div>
                <div className="tastings-form-row">
                  <div className="tastings-field">
                    <label htmlFor="phone">
                      <span className="fn">07</span>
                      <span className="fl">{t(C.fieldPhone.nl, C.fieldPhone.en)}</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      maxLength={40}
                      placeholder={t(C.fieldPhonePlaceholder.nl, C.fieldPhonePlaceholder.en)}
                      className="tastings-input"
                    />
                  </div>
                  <div className="tastings-field">
                    <label htmlFor="occasion">
                      <span className="fn">08</span>
                      <span className="fl">{t(C.fieldOccasion.nl, C.fieldOccasion.en)}</span>
                    </label>
                    <select id="occasion" name="occasion" defaultValue={OCCASIONS[0].nl} className="tastings-input">
                      {OCCASIONS.map((occasion) => (
                        <option key={occasion.key} value={occasion.nl}>
                          {t(occasion.nl, occasion.en)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="tastings-field">
                  <label htmlFor="notes">
                    <span className="fn">09</span>
                    <span className="fl">{t(C.fieldNotes.nl, C.fieldNotes.en)}</span>
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={2}
                    maxLength={2000}
                    placeholder={t(C.fieldNotesPlaceholder.nl, C.fieldNotesPlaceholder.en)}
                    className="tastings-input"
                  />
                </div>
                <button type="submit" className="tastings-submit">
                  {t(C.submit.nl, C.submit.en)}
                </button>
              </form>
            )}
            <p className="tastings-note">
              {lang === "nl" ? (
                <>
                  Met een groep groter dan 20 personen, neem dan contact op met{" "}
                  <a href="mailto:sales@chateau.amsterdam" style={{ textDecoration: "underline", color: "inherit", fontWeight: 500 }}>
                    Sales
                  </a>{" "}
                  voor een groepsaanbod.
                </>
              ) : (
                <>
                  For groups larger than 20 guests, please contact{" "}
                  <a href="mailto:sales@chateau.amsterdam" style={{ textDecoration: "underline", color: "inherit", fontWeight: 500 }}>
                    Sales
                  </a>{" "}
                  for a custom group offer.
                </>
              )}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
