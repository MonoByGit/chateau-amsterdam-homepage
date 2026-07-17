// components/process.tsx
"use client";

import { useLanguage } from "@/lib/language";
import { useReveal } from "@/lib/use-reveal";
import type { ProcessContent } from "@/lib/content/defaults";

const STEP_META: Array<{
  idx: string;
  titleKey: keyof ProcessContent;
  bodyKey: keyof ProcessContent;
  img: string;
  alt: string;
}> = [
  {
    idx: "01",
    titleKey: "step_1_title",
    bodyKey: "step_1_body",
    img: "/assets/step-druif.jpg",
    alt: "Close-up of hands picking organic red wine grapes into a rustic wooden box",
  },
  {
    idx: "02",
    titleKey: "step_2_title",
    bodyKey: "step_2_body",
    img: "/assets/step-reis.png",
    alt: "Crates of fresh grapes inside a cold storage delivery truck with condensation",
  },
  {
    idx: "03",
    titleKey: "step_3_title",
    bodyKey: "step_3_body",
    img: "/assets/step-makerij.jpg",
    alt: "Winemaker measuring wine levels near large stainless steel fermentation tanks",
  },
  {
    idx: "04",
    titleKey: "step_4_title",
    bodyKey: "step_4_body",
    img: "/assets/step-fles.jpg",
    alt: "Automated bottling and labeling machine with wine bottles in a row",
  },
];

function Step({
  meta,
  content,
  lang,
}: {
  meta: (typeof STEP_META)[number];
  content: ProcessContent;
  lang: "nl" | "en";
}) {
  const reveal = useReveal();
  const title = content[meta.titleKey];

  return (
    <article ref={reveal.ref as React.RefObject<HTMLElement>} className={`step rv${reveal.isVisible ? " in" : ""}`}>
      <div className="idx">{meta.idx}</div>
      <div>
        <h3>
          {title.nl} <small>{title.en}</small>
        </h3>
        <p>{lang === "nl" ? content[meta.bodyKey].nl : content[meta.bodyKey].en}</p>
      </div>
      <div className="slotwrap">
        <img src={meta.img} alt={meta.alt} className="step-img" />
      </div>
    </article>
  );
}

export function Process({ content }: { content: ProcessContent }) {
  const { lang, t } = useLanguage();
  const heading = useReveal();
  const sub = useReveal(0.15);

  return (
    <section className="process" id="proces">
      <div className="label rv in">
        Het proces <span className="en">· grape to glass</span>
      </div>
      <div className="process-grid">
        <div className="process-sticky">
          <h2 ref={heading.ref as React.RefObject<HTMLHeadingElement>} className={`rv${heading.isVisible ? " in" : ""}`}>
            {lang === "nl" ? content.heading_lead.nl : content.heading_lead.en}
            <em>{lang === "nl" ? content.heading_em.nl : content.heading_em.en}</em>
          </h2>
          <p ref={sub.ref as React.RefObject<HTMLParagraphElement>} className={`sub rv${sub.isVisible ? " in" : ""}`}>
            {t(content.sub_text.nl, content.sub_text.en)}
          </p>
        </div>
        <div className="process-steps">
          {STEP_META.map((meta) => (
            <Step key={meta.idx} meta={meta} content={content} lang={lang} />
          ))}
        </div>
      </div>
    </section>
  );
}
