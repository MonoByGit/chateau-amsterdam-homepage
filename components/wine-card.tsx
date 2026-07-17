import Link from "next/link";

export type WineCardData = {
  n: string;
  slug: string;
  meta: string;
  name: string;
  nlTag: string;
  enTag: string;
  price: string;
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
        <img src={wine.img} alt={wine.alt} className="wine-packshot" />
      </div>
      <h3>{wine.name}</h3>
      <div className="tag">{lang === "nl" ? wine.nlTag : wine.enTag}</div>
      <div className="price">{wine.price}</div>
    </Link>
  );
}
