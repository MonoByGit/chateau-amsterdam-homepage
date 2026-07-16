// app/admin/media/page.tsx
import { listMedia } from "@/lib/db/media";
import { getObjectUrl } from "@/lib/storage/s3";
import { uploadMedia } from "./actions";

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const items = await listMedia();
  const itemsWithUrls = await Promise.all(
    items.map(async (item) => ({ ...item, url: await getObjectUrl(item.storageKey) }))
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Media</h1>
        <p className="text-sm text-neutral-500">Upload afbeeldingen voor gebruik bij wijnen.</p>
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <form
        action={uploadMedia}
        encType="multipart/form-data"
        className="flex flex-wrap items-end gap-4 rounded-lg border border-neutral-200 bg-white p-4"
      >
        <div>
          <label className="block text-sm font-medium text-neutral-700" htmlFor="file">
            Afbeelding
          </label>
          <input
            required
            type="file"
            id="file"
            name="file"
            accept="image/jpeg,image/png,image/webp"
            className="mt-1 block text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700" htmlFor="altTextNl">
            Alt-tekst (NL)
          </label>
          <input
            type="text"
            id="altTextNl"
            name="altTextNl"
            className="mt-1 rounded-md border border-neutral-300 px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700" htmlFor="altTextEn">
            Alt-tekst (EN)
          </label>
          <input
            type="text"
            id="altTextEn"
            name="altTextEn"
            className="mt-1 rounded-md border border-neutral-300 px-2 py-1 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Uploaden
        </button>
      </form>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {itemsWithUrls.map((item) => (
          <figure key={item.id} className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <img
              src={item.url}
              alt={item.altTextNl || item.filename}
              className="aspect-square w-full object-cover"
            />
            <figcaption className="truncate px-2 py-1 text-xs text-neutral-500">{item.filename}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
