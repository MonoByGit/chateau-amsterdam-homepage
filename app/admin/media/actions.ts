// app/admin/media/actions.ts
"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { uploadMediaFile } from "@/lib/storage/upload-media";

export async function uploadMedia(formData: FormData): Promise<void> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect(`/admin/media?error=${encodeURIComponent("Geen bestand geselecteerd.")}`);
  }

  const altTextNl = (formData.get("altTextNl") as string) || null;
  const altTextEn = (formData.get("altTextEn") as string) || null;
  const user = await getCurrentUser();

  const result = await uploadMediaFile(file, { altTextNl, altTextEn, uploadedBy: user?.id ?? null });
  if ("error" in result) {
    redirect(`/admin/media?error=${encodeURIComponent(result.error)}`);
  }

  redirect("/admin/media");
}
