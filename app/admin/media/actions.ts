// app/admin/media/actions.ts
"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createMedia } from "@/lib/db/media";
import { uploadObject } from "@/lib/storage/s3";
import { validateUpload } from "@/lib/storage/validate-upload";

function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-");
}

export async function uploadMedia(formData: FormData): Promise<void> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect(`/admin/media?error=${encodeURIComponent("Geen bestand geselecteerd.")}`);
  }

  const validationError = validateUpload({ type: file.type, size: file.size });
  if (validationError) {
    redirect(`/admin/media?error=${encodeURIComponent(validationError)}`);
  }

  const altTextNl = (formData.get("altTextNl") as string) || null;
  const altTextEn = (formData.get("altTextEn") as string) || null;

  const buffer = Buffer.from(await file.arrayBuffer());
  const storageKey = `media/${crypto.randomUUID()}-${sanitizeFilename(file.name)}`;

  await uploadObject(storageKey, buffer, file.type);

  const user = await getCurrentUser();
  await createMedia({
    storageKey,
    filename: file.name,
    altTextNl,
    altTextEn,
    uploadedBy: user?.id ?? null,
  });

  redirect("/admin/media");
}
