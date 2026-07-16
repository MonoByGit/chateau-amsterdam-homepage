// app/admin/wines/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  createWine,
  deleteWine as deleteWineRow,
  reorderWines as reorderWinesRow,
  updateWine,
} from "@/lib/db/wines";
import { getObjectUrl } from "@/lib/storage/s3";
import { uploadMediaFile } from "@/lib/storage/upload-media";
import { validateWineInput, type WineFormInput } from "@/lib/validation/wine-input";
import { computeReorderedIds } from "@/lib/wines/reorder";
import type { PickerMediaItem } from "@/components/admin/image-picker";

function readWineForm(formData: FormData): WineFormInput {
  return {
    name: String(formData.get("name") ?? ""),
    metaNl: String(formData.get("metaNl") ?? ""),
    metaEn: String(formData.get("metaEn") ?? ""),
    tagNl: String(formData.get("tagNl") ?? ""),
    tagEn: String(formData.get("tagEn") ?? ""),
    imageId: (formData.get("imageId") as string) || null,
    shopifyHandle: String(formData.get("shopifyHandle") ?? ""),
    isActive: formData.get("isActive") === "on",
  };
}

export async function saveWine(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string) || null;
  const input = readWineForm(formData);

  const validationError = validateWineInput(input);
  if (validationError) {
    const target = id ? `/admin/wines/${id}` : "/admin/wines/new";
    redirect(`${target}?error=${encodeURIComponent(validationError)}`);
  }

  if (id) {
    await updateWine(id, input);
  } else {
    await createWine(input);
  }

  revalidatePath("/admin/wines");
  revalidatePath("/");
  redirect("/admin/wines");
}

export async function uploadWineImage(
  altText: string,
  formData: FormData
): Promise<{ error: string } | PickerMediaItem> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Geen bestand geselecteerd." };
  }

  const user = await getCurrentUser();
  const result = await uploadMediaFile(file, {
    altTextNl: altText || null,
    altTextEn: altText || null,
    uploadedBy: user?.id ?? null,
  });
  if ("error" in result) {
    return result;
  }

  revalidatePath("/admin/media");
  return {
    id: result.media.id,
    url: await getObjectUrl(result.media.storageKey),
    filename: result.media.filename,
    altText: result.media.altTextNl || result.media.filename,
  };
}

export async function deleteWine(formData: FormData): Promise<void> {
  const id = String(formData.get("id"));
  await deleteWineRow(id);
  revalidatePath("/admin/wines");
  revalidatePath("/");
}

export async function reorderWines(
  orderedIds: string[],
  id: string,
  direction: "up" | "down"
): Promise<void> {
  const next = computeReorderedIds(orderedIds, id, direction);
  if (!next) {
    return;
  }
  await reorderWinesRow(next);
  revalidatePath("/admin/wines");
  revalidatePath("/");
}
