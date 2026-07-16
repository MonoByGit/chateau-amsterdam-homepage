// app/admin/media/page.tsx
import { listMedia } from "@/lib/db/media";
import { getObjectUrl } from "@/lib/storage/s3";
import { MediaGrid } from "./media-grid";
import { UploadModalTrigger } from "./upload-modal";

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const items = await listMedia();
  const itemsWithUrls = await Promise.all(
    items.map(async (item) => ({
      id: item.id,
      url: await getObjectUrl(item.storageKey),
      filename: item.filename,
      altTextNl: item.altTextNl,
      altTextEn: item.altTextEn,
    }))
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 className="a-h1">Media</h1>
        <UploadModalTrigger error={error} />
      </div>
      <p className="a-subtitle" style={{ marginBottom: "1.5rem" }}>
        Alle geüploade foto&apos;s. Bij een wijn kun je meestal direct uploaden, deze pagina is voor het
        overzicht, of voor een foto die je nog niet bij een wijn hebt gekozen.
      </p>

      <MediaGrid items={itemsWithUrls} />
    </div>
  );
}
