import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WijnDetail, type WijnDetailRelated } from "@/components/wijn-detail";
import { getRelatedWines, getWineBySlug } from "@/lib/db/wines";
import { getObjectUrl } from "@/lib/storage/s3";
import { listMedia } from "@/lib/db/media";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const wine = await getWineBySlug(slug);
  if (!wine || !wine.isActive) {
    return { title: "Wijnen · Chateau Amsterdam" };
  }

  const description = (wine.descriptionNl ?? "").split("\n\n")[0] || `${wine.name} · ${wine.tagNl}`;
  const media = await listMedia();
  const image = media.find((m) => m.id === wine.imageId);
  const imageUrl = image ? await getObjectUrl(image.storageKey) : "https://chateau.amsterdam/assets/wine-1.png";

  return {
    title: `${wine.name} · Chateau Amsterdam`,
    description,
    openGraph: { title: `${wine.name} · Chateau Amsterdam`, description, images: [imageUrl] },
    twitter: { card: "summary_large_image", title: `${wine.name} · Chateau Amsterdam`, description, images: [imageUrl] },
  };
}

export default async function WijnDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const wine = await getWineBySlug(slug);
  if (!wine || !wine.isActive) {
    notFound();
  }

  const [media, relatedRows] = await Promise.all([listMedia(), getRelatedWines(wine.id)]);
  const image = media.find((m) => m.id === wine.imageId);
  const imageUrl = image ? await getObjectUrl(image.storageKey) : "/assets/wine-1.png";

  const related: WijnDetailRelated[] = await Promise.all(
    relatedRows.map(async (r, index) => {
      const relatedImage = media.find((m) => m.id === r.imageId);
      return {
        n: `N°${String(index + 1).padStart(2, "0")}`,
        // Same nullable-in-the-DB-only assertion as the other two pages.
        slug: r.slug!,
        metaNl: r.metaNl,
        metaEn: r.metaEn,
        name: r.name,
        nlTag: r.tagNl,
        enTag: r.tagEn,
        img: relatedImage ? await getObjectUrl(relatedImage.storageKey) : "/assets/wine-1.png",
        altNl: relatedImage?.altTextNl || r.name,
        altEn: relatedImage?.altTextEn || r.name,
        delay: 0,
      };
    })
  );

  return <WijnDetail wine={wine} imageUrl={imageUrl} related={related} />;
}
