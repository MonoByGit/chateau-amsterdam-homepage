import Link from "next/link";

export type WineCardData = {
  n: string;
  slug: string;
  meta: string;
  name: string;
  nlTag: string;
  enTag: string;
  img: string;
  alt: string;
  delay: number;
};

export function WineCard({
  wine,
  lang,
  reveal,
}: {
  wine: WineCardData;
  lang: "nl" | "en";
  reveal?: { ref: React.RefObject<HTMLElement | null>; isVisible: boolean };
}) {
  return (
    <Link
      href={`/wijnen/${wine.slug}`}
      ref={reveal?.ref as React.RefObject<HTMLAnchorElement>}
      className={`wine-card${reveal ? ` rv${reveal.isVisible ? " in" : ""}` : ""}`}
    >
      <div className="meta">
        <span>{wine.n}</span>
        <span>{wine.meta}</span>
      </div>
      <div className="wine-img-wrap">
        <img
          src={wine.img}
          alt={wine.alt}
          loading="lazy"
          decoding="async"
          className="wine-packshot"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/assets/wine-1.png";
          }}
        />
      </div>
      <h3>{wine.name}</h3>
      <div className="tag">{lang === "nl" ? wine.nlTag : wine.enTag}</div>
      <span className="wine-link-cue">{lang === "nl" ? "Bekijk deze fles →" : "View this bottle →"}</span>
    </Link>
  );
}
