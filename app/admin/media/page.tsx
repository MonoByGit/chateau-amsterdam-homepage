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
    <div>
      <h1 className="a-h1">Media</h1>
      <p className="a-subtitle" style={{ marginBottom: "1.5rem" }}>
        Upload afbeeldingen voor gebruik bij wijnen.
      </p>

      {error ? <p className="a-alert a-alert--danger" style={{ marginBottom: "1.25rem" }}>{error}</p> : null}

      <form
        action={uploadMedia}
        encType="multipart/form-data"
        className="a-card"
        style={{ padding: "1.25rem", display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "1rem" }}
      >
        <label className="a-field" style={{ flex: "1 1 12rem" }}>
          <span className="a-label">
            Afbeelding
          </span>
          <input required type="file" id="file" name="file" accept="image/jpeg,image/png,image/webp" style={{ fontSize: "0.8125rem", color: "var(--a-text-2)" }} />
        </label>
        <label className="a-field" style={{ flex: "1 1 10rem" }}>
          <span className="a-label">
            Alt-tekst (NL)
          </span>
          <input type="text" id="altTextNl" name="altTextNl" className="a-input" />
        </label>
        <label className="a-field" style={{ flex: "1 1 10rem" }}>
          <span className="a-label">
            Alt-tekst (EN)
          </span>
          <input type="text" id="altTextEn" name="altTextEn" className="a-input" />
        </label>
        <button type="submit" className="a-btn a-btn--primary">
          Uploaden
        </button>
      </form>

      <div style={{ marginTop: "1.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "1rem" }}>
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
