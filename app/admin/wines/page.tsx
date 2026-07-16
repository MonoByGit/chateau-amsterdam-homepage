// app/admin/wines/page.tsx
import Link from "next/link";
import { listWines } from "@/lib/db/wines";
import { listMedia } from "@/lib/db/media";
import { getObjectUrl } from "@/lib/storage/s3";
import { WinesList } from "./wines-list";

export default async function WinesListPage() {
  const [wines, mediaRows] = await Promise.all([listWines({}), listMedia()]);
  const mediaById = new Map(mediaRows.map((m) => [m.id, m]));

  const winesWithImages = await Promise.all(
    wines.map(async (wine) => {
      const image = wine.imageId ? mediaById.get(wine.imageId) : null;
      return {
        ...wine,
        imageUrl: image ? await getObjectUrl(image.storageKey) : null,
        imageAlt: image?.altTextNl || wine.name,
      };
    })
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 className="a-h1">Wijnen</h1>
        <Link href="/admin/wines/new" className="a-btn a-btn--primary">
          + Nieuwe wijn
        </Link>
      </div>
      <p className="a-subtitle">Sleep aan de handgreep om de volgorde op de site aan te passen.</p>

      <div style={{ marginTop: "1.5rem" }}>
        <WinesList wines={winesWithImages} />
      </div>
    </div>
  );
}
