import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WijnDetail, type WijnDetailRelated } from "@/components/wijn-detail";
import { getRelatedWines, getWineBySlug } from "@/lib/db/wines";
import { listMedia } from "@/lib/db/media";
import { resolveWineImageUrl } from "@/lib/wines/image";

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
  const resolvedImageUrl = await resolveWineImageUrl({
    shopifyHandle: wine.shopifyHandle,
    imageStorageKey: image?.storageKey ?? null,
  });
  // OG/Twitter images must be absolute URLs; the resolver's placeholder
  // fallback is a relative site path, so make sure it's absolute here.
  const imageUrl = resolvedImageUrl.startsWith("/")
    ? `https://chateau.amsterdam${resolvedImageUrl}`
    : resolvedImageUrl;

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
  const imageUrl = await resolveWineImageUrl({
    shopifyHandle: wine.shopifyHandle,
    imageStorageKey: image?.storageKey ?? null,
  });

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
        img: await resolveWineImageUrl({
          shopifyHandle: r.shopifyHandle,
          imageStorageKey: relatedImage?.storageKey ?? null,
        }),
        altNl: relatedImage?.altTextNl || r.name,
        altEn: relatedImage?.altTextEn || r.name,
        delay: 0,
      };
    })
  );

  return <WijnDetail wine={wine} imageUrl={imageUrl} related={related} />;
}
