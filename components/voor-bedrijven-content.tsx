// components/voor-bedrijven-content.tsx
"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language";
import { BusinessInquiry } from "@/components/business-inquiry";
import { VOOR_BEDRIJVEN_COPY as C } from "@/lib/content/voor-bedrijven";

export function VoorBedrijvenContent({ verzonden, fout }: { verzonden?: string; fout?: string }) {
  const { t } = useLanguage();

  return (
    <>
      <section className="bd-intro">
        <nav className="bd-breadcrumb">
          <Link href="/">{t(C.breadcrumbHome.nl, C.breadcrumbHome.en)}</Link>
          <span className="sep">/</span>
          <span className="current">{t(C.breadcrumbCurrent.nl, C.breadcrumbCurrent.en)}</span>
        </nav>
        <div className="bd-intro-grid">
          <div className="bd-intro-text">
            <div className="bd-label">{t(C.introLabel.nl, C.introLabel.en)}</div>
            <h1>
              {t(C.introHeadingLead.nl, C.introHeadingLead.en)} <em>{t(C.introHeadingEm.nl, C.introHeadingEm.en)}</em>{" "}
              {t(C.introHeadingTail.nl, C.introHeadingTail.en)}
            </h1>
            <p>{t(C.introBody.nl, C.introBody.en)}</p>
          </div>
          <div className="bd-intro-photo">
            <img src="/assets/path-pour.jpg" alt={t(C.introPhotoAlt.nl, C.introPhotoAlt.en)} fetchPriority="high" />
          </div>
        </div>
      </section>

      <section className="bd-body" id="aanvraag">
        <BusinessInquiry verzonden={verzonden} fout={fout} />
      </section>

      <section className="bd-strip">
        <div className="bd-strip-inner">
          <div className="bd-strip-item">
            <div className="n">1</div>
            <div className="d">{t(C.stripContactLabel.nl, C.stripContactLabel.en)}</div>
          </div>
          <div className="bd-strip-item">
            <div className="n">{t(C.stripDistance.nl, C.stripDistance.en)}</div>
            <div className="d">{t(C.stripDistanceLabel.nl, C.stripDistanceLabel.en)}</div>
          </div>
          <div className="bd-strip-item">
            <div className="n">100%</div>
            <div className="d">{t(C.stripProducedLabel.nl, C.stripProducedLabel.en)}</div>
          </div>
        </div>
      </section>
    </>
  );
}
