// components/admin/image-picker.tsx
"use client";

export type PickerMediaItem = {
  id: string;
  url: string;
  filename: string;
  altText: string;
};

export function ImagePicker({
  media,
  value,
  onChange,
}: {
  media: PickerMediaItem[];
  value: string | null;
  onChange: (mediaId: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6" role="listbox" aria-label="Kies een afbeelding">
      {media.map((item) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="option"
            aria-selected={selected}
            onClick={() => onChange(item.id)}
            className={`overflow-hidden rounded-md border-2 ${selected ? "border-neutral-900" : "border-transparent"}`}
          >
            <img src={item.url} alt={item.altText} className="aspect-square w-full object-cover" />
          </button>
        );
      })}
    </div>
  );
}
