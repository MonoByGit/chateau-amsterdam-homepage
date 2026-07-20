// app/admin/wines/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  countHomepageWines,
  createWine,
  deleteWine as deleteWineRow,
  MAX_HOMEPAGE_WINES,
  reorderWines as reorderWinesRow,
  updateWine,
} from "@/lib/db/wines";
import { getObjectUrl } from "@/lib/storage/s3";
import { uploadMediaFile } from "@/lib/storage/upload-media";
import { validateWineInput, type WineFormInput } from "@/lib/validation/wine-input";
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
    showOnHomepage: formData.get("showOnHomepage") === "on",
    descriptionNl: String(formData.get("descriptionNl") ?? ""),
    descriptionEn: String(formData.get("descriptionEn") ?? ""),
    grapes: String(formData.get("grapes") ?? ""),
    vintage: String(formData.get("vintage") ?? ""),
    wineTypeNl: String(formData.get("wineTypeNl") ?? ""),
    wineTypeEn: String(formData.get("wineTypeEn") ?? ""),
    regionNl: String(formData.get("regionNl") ?? ""),
    regionEn: String(formData.get("regionEn") ?? ""),
    farmingMethodNl: String(formData.get("farmingMethodNl") ?? ""),
    farmingMethodEn: String(formData.get("farmingMethodEn") ?? ""),
    vinificationNl: String(formData.get("vinificationNl") ?? ""),
    vinificationEn: String(formData.get("vinificationEn") ?? ""),
    abv: String(formData.get("abv") ?? ""),
    foodPairingNl: String(formData.get("foodPairingNl") ?? ""),
    foodPairingEn: String(formData.get("foodPairingEn") ?? ""),
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

  if (input.showOnHomepage && (await countHomepageWines(id ?? undefined)) >= MAX_HOMEPAGE_WINES) {
    const target = id ? `/admin/wines/${id}` : "/admin/wines/new";
    redirect(
      `${target}?error=${encodeURIComponent(
        `Er staan al ${MAX_HOMEPAGE_WINES} wijnen op de homepage. Zet eerst een andere wijn uit voordat je deze toevoegt.`
      )}`
    );
  }

  const { abv, ...rest } = input;
  const dbInput = { ...rest, abv: abv.trim() ? Number(abv) : null };

  if (id) {
    await updateWine(id, dbInput);
  } else {
    await createWine(dbInput);
  }

  revalidatePath("/admin/wines");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/wijnen");
  revalidatePath("/wijnen/[slug]", "page");
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
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/wijnen");
  revalidatePath("/wijnen/[slug]", "page");
}

export async function reorderWinesTo(newOrderedIds: string[]): Promise<void> {
  await reorderWinesRow(newOrderedIds);
  revalidatePath("/admin/wines");
  revalidatePath("/");
  revalidatePath("/wijnen");
  revalidatePath("/wijnen/[slug]", "page");
}
