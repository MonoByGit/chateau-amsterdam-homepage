// components/tours-tastings-content.tsx
"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language";
import { submitTastingInquiry } from "@/app/(site)/tours-tastings/actions";
import { OCCASIONS, PREFERRED_PERIODS, TASTING_ERROR_MESSAGES, TOURS_TASTINGS_COPY as C } from "@/lib/content/tours-tastings";
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
              <div
                style={{
                  background: "#1c1917",
                  border: "1px solid var(--a-accent, #cda757)",
                  borderRadius: "12px",
                  padding: "2rem",
                  color: "#f7f5f0",
                  boxShadow: "0 15px 35px rgba(0,0,0,0.4)",
                }}
              >
                <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>🍷</div>
                <h3 style={{ color: "var(--a-accent, #cda757)", margin: "0 0 0.75rem 0", fontSize: "1.25rem", fontWeight: 600 }}>
                  {t("Bedankt! Je reserveringsaanvraag is ontvangen.", "Thank you! Your booking request has been received.")}
                </h3>
                <p style={{ margin: "0 0 1.25rem 0", fontSize: "0.9375rem", color: "#d6d3d1", lineHeight: 1.6 }}>
                  {t(
                    "We hebben je aanvraag in goede orde ontvangen. Er is zojuist een automatische ontvangstbevestiging per e-mail naar je gestuurd. Ons salesteam bekijkt je gekozen datum en tijdslot, en stuurt je zo snel mogelijk de definitieve bevestiging!",
                    "We have received your request. An automatic confirmation receipt has been sent to your email. Our sales team is reviewing your requested date and slot, and will send you the final confirmation shortly!"
                  )}
                </p>
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "8px", padding: "1rem 1.25rem", borderLeft: "3px solid var(--a-accent, #cda757)" }}>
                  <div style={{ fontSize: "0.8125rem", color: "#a8a29e", marginBottom: "0.375rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t("Status van je aanvraag", "Status of your request")}
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#f7f5f0", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <span>✓ {t("Ontvangstbevestiging gemaild", "Receipt email dispatched")}</span>
                    <span>⏳ {t("In behandeling bij salesteam", "Under review by sales team")}</span>
                    <span>📧 {t("Definitieve bevestiging volgt", "Final confirmation to follow")}</span>
                  </div>
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
                    <select id="preferredPeriod" name="preferredPeriod" defaultValue={PREFERRED_PERIODS[0].nl} className="tastings-input">
                      {PREFERRED_PERIODS.map((period) => {
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
                    <label htmlFor="occasion">
                      <span className="fn">04</span>
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
                  <label htmlFor="notes">
                    <span className="fn">08</span>
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
            <p className="tastings-note">{t(C.note.nl, C.note.en)}</p>
          </div>
        </div>
      </section>
    </>
  );
}
