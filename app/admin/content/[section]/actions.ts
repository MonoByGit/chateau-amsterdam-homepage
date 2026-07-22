// app/admin/content/[section]/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { upsertBlock } from "@/lib/db/content";

/**
 * Form fields are named `${fieldKey}__nl` / `${fieldKey}__en` by
 * content-form.tsx, grouping by that suffix here recovers the set of
 * field_keys submitted without the page needing a separate hidden field
 * enumerating them.
 */
export async function saveSection(section: string, page: string, formData: FormData): Promise<void> {
  const fieldKeys = new Set<string>();
  for (const key of formData.keys()) {
    if (key.endsWith("__nl") || key.endsWith("__en")) {
      fieldKeys.add(key.slice(0, key.lastIndexOf("__")));
    }
  }

  for (const fieldKey of fieldKeys) {
    const valueNl = String(formData.get(`${fieldKey}__nl`) ?? "");
    const valueEn = String(formData.get(`${fieldKey}__en`) ?? "");
    await upsertBlock(page, section, fieldKey, valueNl, valueEn);
  }

  // Makes edits immediately live on the public site
  revalidatePath("/");
  revalidatePath("/wijnen");
  revalidatePath("/tours-tastings");
  revalidatePath("/voor-bedrijven");
}
