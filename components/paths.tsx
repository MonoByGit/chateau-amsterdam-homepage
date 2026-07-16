"use client";

import { useLanguage } from "@/lib/language";
import { useReveal } from "@/lib/use-reveal";
import { useMagnetic } from "@/lib/use-magnetic";

const PATHS: Array<{
  idx: string;
  word: string;
  href: string;
  nlTitle: string;
  enTitle: string;
  nlBody: string;
  enBody: string;
  img: string;
  alt: string;
  ariaLabel: string;
}> = [
  {
    idx: "01",
    word: "Taste",
    href: "#paden",
    nlTitle: "Tours & tastings",
    enTitle: "Tours & tastings",
    nlBody: "Proef 7 wijnen tussen de tanks, met verhaal en bites. Voor bezoekers van de stad, vriendengroepen en iedereen die wil weten hoe stadswijn smaakt.",
    enBody: "Taste 7 wines between the tanks, complete with stories and bites. For city visitors, groups of friends, and anyone who wants to know how urban wine tastes.",
    img: "/assets/path-taste.png",
    alt: "Wine tasting flight with four glasses of different wines on a barrel",
    ariaLabel: "Boek een tasting",
  },
  {
    idx: "02",
    word: "Pour",
    href: "#bedrijven",
    nlTitle: "Voor bedrijven & horeca",
    enTitle: "For businesses & hospitality",
    nlBody: "Grote afname, private label, relatiegeschenken en events in de winery. Eén aanspreekpunt, scherpe staffels, geproduceerd op 10 minuten van CS.",
    enBody: "Bulk orders, private label, corporate gifts, and events in the winery. A single point of contact, volume discounts, produced 10 minutes from Central Station.",
    img: "/assets/path-pour.png",
    alt: "Beautifully decorated long event table inside the industrial winery hall",
    ariaLabel: "Plan een gesprek",
  },
  {
    idx: "03",
    word: "Drink",
    href: "#wijnen",
    nlTitle: "De webshop",
    enTitle: "The webshop",
    nlBody: "De volledige collectie, thuisbezorgd. Van klassieke monocépages tot blends die alleen in Noord kunnen bestaan.",
    enBody: "The complete collection, delivered to your door. From classic single-varietals to blends that could only exist in North.",
    img: "/assets/path-drink.png",
    alt: "Hand pulling a red wine bottle out of a stylish cardboard box",
    ariaLabel: "Naar de webshop",
  },
];

function PathRow({ path, lang }: { path: (typeof PATHS)[number]; lang: "nl" | "en" }) {
  const reveal = useReveal();
  const goMagnetic = useMagnetic();

  function handleRowClick(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("a")) return;
    const target = document.querySelector(path.href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <div
      ref={reveal.ref as React.RefObject<HTMLDivElement>}
      className={`path rv${reveal.isVisible ? " in" : ""}`}
      id={path.href === "#bedrijven" ? "bedrijven" : undefined}
      onClick={handleRowClick}
    >
      <div className="idx">{path.idx}</div>
      <div className="word">{path.word}</div>
      <div className="info">
        <h3>{lang === "nl" ? path.nlTitle : path.enTitle}</h3>
        <p>{lang === "nl" ? path.nlBody : path.enBody}</p>
      </div>
      <div className="thumb">
        <img src={path.img} alt={path.alt} className="path-thumb-img" />
      </div>
      <a className="go" ref={goMagnetic as React.RefObject<HTMLAnchorElement>} href={path.href} aria-label={path.ariaLabel}>
        →
      </a>
    </div>
  );
}

export function Paths() {
  const { lang, t } = useLanguage();
  const introHeading1 = useReveal();
  const introHeading2 = useReveal(0.12);
  const introBody = useReveal(0.2);

  return (
    <section className="paths" id="paden">
      <div className="label rv in">
        {t("Kies je glas", "Choose your glass")} <span className="en">· choose your glass</span>
      </div>
      <div className="paths-intro">
        <h2>
          <span ref={introHeading1.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${introHeading1.isVisible ? " in" : ""}`}>
            <span>{t("Voor proevers, schenkers", "For tasters, pourers")}</span>
          </span>
          <span ref={introHeading2.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${introHeading2.isVisible ? " in" : ""}`}>
            <span>
              &amp; <em>{t("thuisdrinkers.", "home drinkers.")}</em>
            </span>
          </span>
        </h2>
        <p ref={introBody.ref as React.RefObject<HTMLParagraphElement>} className={`rv${introBody.isVisible ? " in" : ""}`}>
          {t(
            "Toerist, inkoper of liefhebber: iedereen drinkt hier dezelfde wijn. Alleen de weg ernaartoe verschilt.",
            "Tourist, buyer, or wine lover: everyone here drinks the same wine. Only the path there differs."
          )}
        </p>
      </div>
      {PATHS.map((path) => (
        <PathRow key={path.idx} path={path} lang={lang} />
      ))}
    </section>
  );
}
