// app/admin/wines/image-field.tsx
"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePicker, type PickerMediaItem } from "@/components/admin/image-picker";
import { uploadWineImage } from "./actions";

export function ImageField({
  media,
  initialValue,
}: {
  media: PickerMediaItem[];
  initialValue: string | null;
}) {
  const [items, setItems] = useState(media);
  const [selected, setSelected] = useState<string | null>(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set("file", file);
    setError(null);

    startTransition(async () => {
      const result = await uploadWineImage("", formData);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setItems((prev) => [result, ...prev]);
      setSelected(result.id);
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <input type="hidden" name="imageId" value={selected ?? ""} />
      <ImagePicker media={items} value={selected} onChange={setSelected} />
      <div>
        <label className="a-btn a-btn--secondary" style={{ cursor: "pointer", display: "inline-flex" }}>
          {isPending ? "Uploaden…" : "+ Nieuwe foto uploaden"}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={isPending}
            style={{ display: "none" }}
          />
        </label>
        {error ? <p style={{ color: "var(--a-danger)", fontSize: "0.8125rem", marginTop: "0.5rem" }}>{error}</p> : null}
      </div>
    </div>
  );
}
