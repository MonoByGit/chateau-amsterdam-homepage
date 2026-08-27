// app/admin/popups/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { upsertBlock } from "@/lib/db/content";

export async function savePopupConfigAction(
  popupKey: string,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  try {
    const fields = Array.from(formData.keys())
      .map((k) => k.replace(/_(nl|en)$/, ""))
      .filter((v, i, a) => a.indexOf(v) === i && v !== "$ACTION_ID");

    for (const field of fields) {
      const nl = String(formData.get(`${field}_nl`) ?? "").trim();
      const en = String(formData.get(`${field}_en`) ?? "").trim();
      if (nl || en) {
        await upsertBlock("popups", popupKey, field, nl, en);
      }
    }

    revalidatePath("/admin/popups");
    revalidatePath("/popups");
    revalidatePath("/");
    revalidatePath("/tours-tastings");
    revalidatePath("/voor-bedrijven");
    revalidatePath("/wijnen");

    return { success: true, message: "Pop-up configuratie succesvol opgeslagen!" };
  } catch (err: any) {
    return { success: false, message: `Opslaan mislukt: ${err?.message || "onbekende fout"}` };
  }
}
