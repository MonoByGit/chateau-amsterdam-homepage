// app/admin/wines/wine-form.tsx
import { listMedia } from "@/lib/db/media";
import type { Wine } from "@/lib/db/wines";
import { getObjectUrl } from "@/lib/storage/s3";
import { WineFormWizard } from "./wine-form-wizard";

export async function WineForm({ wine, error }: { wine: Wine | null; error?: string }) {
  const mediaRows = await listMedia();
  const media = await Promise.all(
    mediaRows.map(async (row) => ({
      id: row.id,
      url: await getObjectUrl(row.storageKey),
      filename: row.filename,
      altText: row.altTextNl || row.filename,
    }))
  );

  return <WineFormWizard wine={wine} error={error} media={media} />;
}
