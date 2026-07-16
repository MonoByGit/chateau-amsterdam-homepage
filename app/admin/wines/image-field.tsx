// app/admin/wines/image-field.tsx
"use client";

import { useState } from "react";
import { ImagePicker, type PickerMediaItem } from "@/components/admin/image-picker";

export function ImageField({
  media,
  initialValue,
}: {
  media: PickerMediaItem[];
  initialValue: string | null;
}) {
  const [selected, setSelected] = useState<string | null>(initialValue);

  return (
    <div>
      <input type="hidden" name="imageId" value={selected ?? ""} />
      <ImagePicker media={media} value={selected} onChange={setSelected} />
    </div>
  );
}
