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
    <form action={saveWine} style={{ maxWidth: "40rem" }}>
      {wine ? <input type="hidden" name="id" value={wine.id} /> : null}
      {error ? <p className="a-alert a-alert--danger" style={{ marginBottom: "1.25rem" }}>{error}</p> : null}

      <div className="a-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <label className="a-field">
          <span className="a-label">
            Naam
          </span>
          <input required type="text" id="name" name="name" defaultValue={wine?.name} className="a-input" placeholder="Riesling" />
        </label>

        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          <label className="a-field">
            <span className="a-label">Type &amp; regio (NL)</span>
            <span className="a-hint">Korte typering — verschijnt naast het flesnummer op de site, geen volledige beschrijving.</span>
            <input type="text" id="metaNl" name="metaNl" defaultValue={wine?.metaNl} placeholder="Wit · Pfalz, DE" className="a-input" />
          </label>
          <label className="a-field">
            <span className="a-label">Type &amp; region (EN)</span>
            <span className="a-hint">Short label — same spot on the site, not a full description.</span>
            <input type="text" id="metaEn" name="metaEn" defaultValue={wine?.metaEn} placeholder="White · Pfalz, DE" className="a-input" />
          </label>
        </div>

        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          <label className="a-field">
            <span className="a-label">Tagline (NL)</span>
            <span className="a-hint">Korte, pakkende zin onder de wijnnaam.</span>
            <input type="text" id="tagNl" name="tagNl" defaultValue={wine?.tagNl} placeholder="de klassieker" className="a-input" />
          </label>
          <label className="a-field">
            <span className="a-label">Tagline (EN)</span>
            <span className="a-hint">Short, punchy line under the wine name.</span>
            <input type="text" id="tagEn" name="tagEn" defaultValue={wine?.tagEn} placeholder="the classic" className="a-input" />
          </label>
        </div>

        <div className="a-field">
          <span className="a-label">Afbeelding</span>
          <span className="a-hint">Kies een bestaande foto, of upload er direct een nieuwe.</span>
          <ImageField media={media} initialValue={wine?.imageId ?? null} />
        </div>

        <label className="a-field">
          <span className="a-label">
            Shopify handle
          </span>
          <input required type="text" id="shopifyHandle" name="shopifyHandle" defaultValue={wine?.shopifyHandle} className="a-input" />
        </label>

        <label className="a-checkbox-row">
          <input type="checkbox" id="isActive" name="isActive" defaultChecked={wine?.isActive ?? true} className="a-checkbox" />
          <span className="a-label" style={{ fontWeight: 500 }}>
            Actief op de website
          </span>
        </label>
      </div>

      <div style={{ marginTop: "1.25rem" }}>
        <button type="submit" className="a-btn a-btn--primary">
          Opslaan
        </button>
      </div>
    </form>
  );
}
