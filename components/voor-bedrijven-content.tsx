// components/voor-bedrijven-content.tsx
"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language";
import { parseImageSrc } from "@/lib/content/defaults";
import { BusinessInquiry } from "@/components/business-inquiry";
import { VOOR_BEDRIJVEN_COPY as C } from "@/lib/content/voor-bedrijven";

import { VOOR_BEDRIJVEN_PAGE_DEFAULTS, type VoorBedrijvenPageContent } from "@/lib/content/defaults";

export function VoorBedrijvenContent({
  verzonden,
  fout,
  content = VOOR_BEDRIJVEN_PAGE_DEFAULTS,
}: {
  verzonden?: string;
  fout?: string;
  content?: VoorBedrijvenPageContent;
}) {
  const { t } = useLanguage();

  const rawUrl = content.intro_photo_url ? t(content.intro_photo_url.nl, content.intro_photo_url.en) : "/assets/b2b-hero.jpg";
  const parsed = parseImageSrc(rawUrl);

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
            <div className="bd-label">{t(content.intro_label.nl, content.intro_label.en)}</div>
            <h1>
              {t(content.intro_heading_lead.nl, content.intro_heading_lead.en)} <em>{t(content.intro_heading_em.nl, content.intro_heading_em.en)}</em>
            </h1>
            <p>{t(content.intro_body.nl, content.intro_body.en)}</p>
          </div>
          <div className="bd-intro-photo">
            <img
              src={parsed.src}
              alt={t(C.introPhotoAlt.nl, C.introPhotoAlt.en)}
              fetchPriority="high"
              style={{ objectPosition: parsed.objectPosition || "center" }}
            />
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
            <div className="d">{t(content.strip_contact_label.nl, content.strip_contact_label.en)}</div>
          </div>
          <div className="bd-strip-item">
            <div className="n">{t(content.strip_distance.nl, content.strip_distance.en)}</div>
            <div className="d">{t(content.strip_distance_label.nl, content.strip_distance_label.en)}</div>
          </div>
          <div className="bd-strip-item">
            <div className="n">100%</div>
            <div className="d">{t(content.strip_produced_label.nl, content.strip_produced_label.en)}</div>
          </div>
        </div>
      </section>
    </>
  );
}
