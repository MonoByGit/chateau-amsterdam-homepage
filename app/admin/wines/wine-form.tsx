// app/admin/wines/wine-form.tsx
import { listMedia } from "@/lib/db/media";
import type { Wine } from "@/lib/db/wines";
import { getObjectUrl } from "@/lib/storage/s3";
import { saveWine } from "./actions";
import { ImageField } from "./image-field";

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

  return (
    <form action={saveWine} className="max-w-2xl space-y-6">
      {wine ? <input type="hidden" name="id" value={wine.id} /> : null}
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <div>
        <label className="block text-sm font-medium text-neutral-700" htmlFor="name">
          Naam
        </label>
        <input
          required
          type="text"
          id="name"
          name="name"
          defaultValue={wine?.name}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700" htmlFor="metaNl">
            Omschrijving — type/regio (NL)
          </label>
          <input
            type="text"
            id="metaNl"
            name="metaNl"
            defaultValue={wine?.metaNl}
            placeholder="Wit · Pfalz, DE"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700" htmlFor="metaEn">
            Description — type/region (EN)
          </label>
          <input
            type="text"
            id="metaEn"
            name="metaEn"
            defaultValue={wine?.metaEn}
            placeholder="White · Pfalz, DE"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700" htmlFor="tagNl">
            Tagline (NL)
          </label>
          <input
            type="text"
            id="tagNl"
            name="tagNl"
            defaultValue={wine?.tagNl}
            placeholder="de klassieker"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700" htmlFor="tagEn">
            Tagline (EN)
          </label>
          <input
            type="text"
            id="tagEn"
            name="tagEn"
            defaultValue={wine?.tagEn}
            placeholder="the classic"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium text-neutral-700">Afbeelding</span>
        <ImageField media={media} initialValue={wine?.imageId ?? null} />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700" htmlFor="shopifyHandle">
          Shopify handle
        </label>
        <input
          required
          type="text"
          id="shopifyHandle"
          name="shopifyHandle"
          defaultValue={wine?.shopifyHandle}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          defaultChecked={wine?.isActive ?? true}
          className="h-4 w-4"
        />
        <label className="text-sm text-neutral-700" htmlFor="isActive">
          Actief op de website
        </label>
      </div>

      <button
        type="submit"
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
      >
        Opslaan
      </button>
    </form>
  );
}
