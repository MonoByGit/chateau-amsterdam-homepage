// components/paths.tsx
"use client";

import { useLanguage } from "@/lib/language";
import { useReveal } from "@/lib/use-reveal";
import { useMagnetic } from "@/lib/use-magnetic";
import type { PathsContent } from "@/lib/content/defaults";

const PATH_META: Array<{
  idx: string;
  word: string;
  href: string;
  titleKey: keyof PathsContent;
  bodyKey: keyof PathsContent;
  img: string;
  alt: string;
  ariaLabel: string;
}> = [
  {
    idx: "01",
    word: "Taste",
    href: "/tours-tastings",
    titleKey: "path_1_title",
    bodyKey: "path_1_body",
    img: "/assets/path-taste.jpg",
    alt: "Wine tasting flight with four glasses of different wines on a barrel",
    ariaLabel: "Boek een tasting",
  },
  {
    idx: "02",
    word: "Pour",
    href: "/voor-bedrijven",
    titleKey: "path_2_title",
    bodyKey: "path_2_body",
    img: "/assets/path-pour.jpg",
    alt: "Beautifully decorated long event table inside the industrial winery hall",
    ariaLabel: "Plan een gesprek",
  },
  {
    idx: "03",
    word: "Drink",
    href: "#wijnen",
    titleKey: "path_3_title",
    bodyKey: "path_3_body",
    img: "/assets/path-drink.png",
    alt: "Hand pulling a red wine bottle out of a stylish cardboard box",
    ariaLabel: "Naar de webshop",
  },
];

function PathRow({
  meta,
  content,
  lang,
}: {
  meta: (typeof PATH_META)[number];
  content: PathsContent;
  lang: "nl" | "en";
}) {
  const reveal = useReveal();
  const goMagnetic = useMagnetic();

  function handleRowClick(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("a")) return;
    if (!meta.href.startsWith("#")) {
      window.location.href = meta.href;
      return;
    }
    const target = document.querySelector(meta.href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <div
      ref={reveal.ref as React.RefObject<HTMLDivElement>}
      className={`path rv${reveal.isVisible ? " in" : ""}`}
      onClick={handleRowClick}
    >
      <div className="idx">{meta.idx}</div>
      <div className="word">{meta.word}</div>
      <div className="info">
        <h3>{lang === "nl" ? content[meta.titleKey].nl : content[meta.titleKey].en}</h3>
        <p>{lang === "nl" ? content[meta.bodyKey].nl : content[meta.bodyKey].en}</p>
      </div>
      <div className="thumb">
        <img src={meta.img} alt={meta.alt} className="path-thumb-img" />
      </div>
      <a className="go" ref={goMagnetic as React.RefObject<HTMLAnchorElement>} href={meta.href} aria-label={meta.ariaLabel}>
        →
      </a>
    </div>
  );
}

export function Paths({ content }: { content: PathsContent }) {
  const { lang, t } = useLanguage();
  const introHeading1 = useReveal();
  const introHeading2 = useReveal(0.12);
  const introBody = useReveal(0.2);

  return (
    <section className="paths" id="paden">
      <div className="label rv in">
        {t(content.label.nl, content.label.en)} <span className="en">· choose your glass</span>
      </div>
      <div className="paths-intro">
        <h2>
          <span ref={introHeading1.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${introHeading1.isVisible ? " in" : ""}`}>
            <span>{t(content.heading_line1.nl, content.heading_line1.en)}</span>
          </span>
          <span ref={introHeading2.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${introHeading2.isVisible ? " in" : ""}`}>
            <span>
              &amp; <em>{t(content.heading_line2_em.nl, content.heading_line2_em.en)}</em>
            </span>
          </span>
        </h2>
        <p ref={introBody.ref as React.RefObject<HTMLParagraphElement>} className={`rv${introBody.isVisible ? " in" : ""}`}>
          {t(content.intro_body.nl, content.intro_body.en)}
        </p>
      </div>
      {PATH_META.map((meta) => (
        <PathRow key={meta.idx} meta={meta} content={content} lang={lang} />
      ))}
    </section>
  );
}
