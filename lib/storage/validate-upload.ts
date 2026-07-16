const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE_BYTES = 8 * 1024 * 1024;

export function validateUpload(file: { type: string; size: number }): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return `Bestandstype "${file.type}" wordt niet ondersteund. Gebruik JPEG, PNG of WebP.`;
  }
  if (file.size > MAX_SIZE_BYTES) {
    return "Bestand is te groot. Maximaal 8MB toegestaan.";
  }
  return null;
}
