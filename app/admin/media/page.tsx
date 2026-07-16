// app/admin/media/page.tsx
import { listMedia } from "@/lib/db/media";
import { getObjectUrl } from "@/lib/storage/s3";
import { uploadMedia } from "./actions";
import { UploadDropzone } from "./upload-dropzone";

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
    <div>
      <h1 className="a-h1">Media</h1>
      <p className="a-subtitle" style={{ marginBottom: "1.5rem" }}>
        Alle geüploade foto&apos;s. Bij een wijn kun je meestal direct uploaden — deze pagina is er voor het
        overzicht, of voor een foto die je nog niet bij een wijn hebt gekozen.
      </p>

      {error ? <p className="a-alert a-alert--danger" style={{ marginBottom: "1.25rem" }}>{error}</p> : null}

      <form action={uploadMedia} encType="multipart/form-data" className="a-card" style={{ padding: "1.5rem", maxWidth: "28rem" }}>
        <UploadDropzone />
        <div style={{ display: "grid", gap: "1rem", marginTop: "1.25rem" }}>
          <label className="a-field">
            <span className="a-label">Alt-tekst (NL)</span>
            <span className="a-hint">Korte omschrijving voor schermlezers, bijv. &ldquo;Riesling fles&rdquo;.</span>
            <input type="text" id="altTextNl" name="altTextNl" className="a-input" />
          </label>
          <label className="a-field">
            <span className="a-label">Alt-tekst (EN)</span>
            <input type="text" id="altTextEn" name="altTextEn" className="a-input" />
          </label>
        </div>
        <button type="submit" className="a-btn a-btn--primary" style={{ marginTop: "1.25rem" }}>
          Uploaden
        </button>
      </form>

      <div style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "1rem" }}>
        {itemsWithUrls.map((item) => (
          <figure key={item.id} className="a-card" style={{ overflow: "hidden", margin: 0 }}>
            <img src={item.url} alt={item.altTextNl || item.filename} style={{ aspectRatio: "1 / 1", width: "100%", objectFit: "cover", display: "block" }} />
            <figcaption style={{ padding: "0.5rem 0.625rem", fontSize: "0.75rem", color: "var(--a-text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.filename}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
