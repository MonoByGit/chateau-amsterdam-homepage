import crypto from "node:crypto";
import { createMedia, type Media } from "@/lib/db/media";
import { uploadObject } from "@/lib/storage/s3";
import { validateUpload } from "@/lib/storage/validate-upload";

function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-");
}

export async function uploadMediaFile(
  file: File,
  opts: { altTextNl?: string | null; altTextEn?: string | null; uploadedBy: string | null }
): Promise<{ error: string } | { media: Media }> {
  const validationError = validateUpload({ type: file.type, size: file.size });
  if (validationError) {
    return { error: validationError };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storageKey = `media/${crypto.randomUUID()}-${sanitizeFilename(file.name)}`;
  await uploadObject(storageKey, buffer, file.type);

  const media = await createMedia({
    storageKey,
    filename: file.name,
    altTextNl: opts.altTextNl ?? null,
    altTextEn: opts.altTextEn ?? null,
    uploadedBy: opts.uploadedBy,
  });

  return { media };
}
