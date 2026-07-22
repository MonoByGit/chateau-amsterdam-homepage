// components/manifest.tsx
"use client";

import { useLanguage } from "@/lib/language";
import { useReveal } from "@/lib/use-reveal";
import { Counter } from "./counter";
import type { ManifestContent } from "@/lib/content/defaults";

const STAT_META: Array<{
  valueKey: keyof ManifestContent;
  descKey: keyof ManifestContent;
  format?: "dots";
  suffix?: string;
  delay: number;
}> = [
  { valueKey: "stat_1_value", descKey: "stat_1_desc", delay: 0 },
  { valueKey: "stat_2_value", descKey: "stat_2_desc", format: "dots", suffix: " m²", delay: 0.1 },
  { valueKey: "stat_3_value", descKey: "stat_3_desc", delay: 0.2 },
  { valueKey: "stat_4_value", descKey: "stat_4_desc", format: "dots", suffix: "+", delay: 0.3 },
];

function Stat({
  meta,
  content,
  lang,
}: {
  meta: (typeof STAT_META)[number];
  content: ManifestContent;
  lang: "nl" | "en";
}) {
  const reveal = useReveal(meta.delay);
  const target = Number(content[meta.valueKey].nl);
  const desc = lang === "nl" ? content[meta.descKey].nl : content[meta.descKey].en;

  return (
    <div ref={reveal.ref as React.RefObject<HTMLDivElement>} className={`stat rv${reveal.isVisible ? " in" : ""}`}>
      <div className="num">
        <Counter target={target} format={meta.format} />
        {meta.suffix ? <sub>{meta.suffix}</sub> : null}
      </div>
      <div className="desc">{desc}</div>
    </div>
  );
}

export function Manifest({ content }: { content: ManifestContent }) {
  const { lang, t } = useLanguage();
  const label = useReveal();
  const title1 = useReveal();
  const title2 = useReveal(0.15);
  const body = useReveal();

  return (
    <section className="manifest on-dark" id="verhaal">
      <div ref={label.ref as React.RefObject<HTMLDivElement>} className={`label rv${label.isVisible ? " in" : ""}`}>
        {content.label.nl} <span className="en">· {content.label.en === "The story" ? "no vineyard, still wine" : content.label.en}</span>
      </div>
      <h2 className="manifest-title">
        <span ref={title1.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${title1.isVisible ? " in" : ""}`}>
          <span>{t(content.heading_line1.nl, content.heading_line1.en)}</span>
        </span>
        <span ref={title2.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${title2.isVisible ? " in" : ""}`}>
          <span className="alt">{t(content.heading_line2.nl, content.heading_line2.en)}</span>
        </span>
      </h2>
      <div className="manifest-body">
        <div></div>
        <div className="rule">
          <p ref={body.ref as React.RefObject<HTMLParagraphElement>} className={`rv${body.isVisible ? " in" : ""}`}>
            {lang === "nl" ? content.body_lead.nl : content.body_lead.en}
            <strong>{lang === "nl" ? content.body_strong.nl : content.body_strong.en}</strong>
            {lang === "nl" ? content.body_tail.nl : content.body_tail.en}
          </p>
        </div>
      </div>
      <div className="stats">
        {STAT_META.map((meta) => (
          <Stat key={meta.valueKey} meta={meta} content={content} lang={lang} />
        ))}
      </div>
    </section>
  );
}
