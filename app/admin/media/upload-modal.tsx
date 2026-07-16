// app/admin/media/upload-modal.tsx
"use client";

import { useState } from "react";
import { Modal } from "@/components/admin/modal";
import { uploadMedia } from "./actions";
import { UploadDropzone } from "./upload-dropzone";

export function UploadModalTrigger({ error }: { error?: string }) {
  const [open, setOpen] = useState(Boolean(error));

  return (
    <>
      <button type="button" className="a-btn a-btn--primary" onClick={() => setOpen(true)}>
        + Media toevoegen
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Media toevoegen">
        {error ? <p className="a-alert a-alert--danger" style={{ marginBottom: "1.25rem" }}>{error}</p> : null}
        <form action={uploadMedia} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <UploadDropzone />
          <label className="a-field">
            <span className="a-label">Alt-tekst (NL)</span>
            <span className="a-hint">Korte omschrijving voor schermlezers, bijv. &ldquo;Riesling fles&rdquo;.</span>
            <input type="text" id="altTextNl" name="altTextNl" className="a-input" />
          </label>
          <label className="a-field">
            <span className="a-label">Alt-tekst (EN)</span>
            <input type="text" id="altTextEn" name="altTextEn" className="a-input" />
          </label>
          <button type="submit" className="a-btn a-btn--primary">
            Uploaden
          </button>
        </form>
      </Modal>
    </>
  );
}
