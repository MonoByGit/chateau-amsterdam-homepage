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
  if (media.length === 0) {
    return (
      <p style={{ fontSize: "0.8125rem", color: "var(--a-text-3, #98989d)" }}>
        Nog geen afbeeldingen. Upload er een via Media.
      </p>
    );
  }

  return (
    <div
      role="listbox"
      aria-label="Kies een afbeelding"
      style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))", gap: "0.625rem" }}
    >
      {media.map((item) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="option"
            aria-selected={selected}
            onClick={() => onChange(item.id)}
            style={{
              overflow: "hidden",
              borderRadius: "var(--a-r-sm, 8px)",
              border: `2px solid ${selected ? "var(--a-accent, #ffcc00)" : "transparent"}`,
              boxShadow: selected ? "0 0 0 3px var(--a-accent-soft, rgba(255,204,0,0.16))" : "none",
              padding: 0,
              lineHeight: 0,
              cursor: "pointer",
              transition: "border-color 0.15s ease, box-shadow 0.15s ease",
            }}
          >
            <img
              src={item.url}
              alt={item.altText}
              style={{ aspectRatio: "1 / 1", width: "100%", objectFit: "cover", display: "block" }}
            />
          </button>
        );
      })}
    </div>
  );
}
