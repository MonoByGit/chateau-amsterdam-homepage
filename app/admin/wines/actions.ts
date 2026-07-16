// app/admin/wines/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createWine,
  deleteWine as deleteWineRow,
  reorderWines as reorderWinesRow,
  updateWine,
} from "@/lib/db/wines";
import { validateWineInput, type WineFormInput } from "@/lib/validation/wine-input";
import { computeReorderedIds } from "@/lib/wines/reorder";

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
