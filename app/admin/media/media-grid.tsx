// app/admin/media/media-grid.tsx
"use client";

import { useState } from "react";
import { Modal } from "@/components/admin/modal";
import { LightboxImage } from "@/components/admin/lightbox";
import { deleteMediaAction, updateMediaAction } from "./actions";

export type MediaItem = {
  id: string;
  url: string;
  filename: string;
  altTextNl: string;
  altTextEn: string;
};

export function MediaGrid({ items }: { items: MediaItem[] }) {
  const [editing, setEditing] = useState<MediaItem | null>(null);

  if (items.length === 0) {
    return (
      <div className="a-card">
        <p className="a-card-row" style={{ color: "var(--a-text-2)", fontSize: "0.875rem" }}>
          Nog geen media geüpload. Klik op &ldquo;Media toevoegen&rdquo; om te beginnen.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="a-media-grid">
        {items.map((item) => (
          <figure key={item.id} className="a-card" style={{ overflow: "hidden", margin: 0 }}>
            <LightboxImage
              src={item.url}
              alt={item.altTextNl || item.filename}
              style={{ aspectRatio: "1 / 1", width: "100%", objectFit: "cover", display: "block" }}
            />
            <figcaption style={{ padding: "0.5rem 0.625rem" }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--a-text-2)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  marginBottom: "0.25rem",
                }}
              >
                {item.filename}
              </div>
              <div style={{ display: "flex", gap: "0.125rem" }}>
                <button
                  type="button"
                  className="a-icon-btn"
                  aria-label={`${item.filename} bewerken`}
                  title="Alt-tekst bewerken"
                  onClick={() => setEditing(item)}
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </button>
                <form action={deleteMediaAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className="a-icon-btn a-icon-btn--danger" aria-label={`${item.filename} verwijderen`} title="Verwijderen">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12" />
                    </svg>
                  </button>
                </form>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Alt-tekst bewerken">
        {editing ? (
          <form
            action={async (formData: FormData) => {
              await updateMediaAction(editing.id, formData);
              setEditing(null);
            }}
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            <label className="a-field">
              <span className="a-label">Alt-tekst (NL)</span>
              <input type="text" name="altTextNl" defaultValue={editing.altTextNl} className="a-input" />
            </label>
            <label className="a-field">
              <span className="a-label">Alt-tekst (EN)</span>
              <input type="text" name="altTextEn" defaultValue={editing.altTextEn} className="a-input" />
            </label>
            <button type="submit" className="a-btn a-btn--primary">
              Opslaan
            </button>
          </form>
        ) : null}
      </Modal>
    </>
  );
}
