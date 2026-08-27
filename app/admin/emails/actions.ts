// app/admin/emails/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { upsertBlock } from "@/lib/db/content";

export async function saveEmailTemplateAction(
  templateKey: string,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  try {
    const fields = ["subject", "heading", "intro", "details_label", "footer_note"];

    for (const field of fields) {
      const nl = String(formData.get(`${field}_nl`) ?? "").trim();
      const en = String(formData.get(`${field}_en`) ?? "").trim();
      if (nl || en) {
        await upsertBlock("emails", templateKey, field, nl, en);
      }
    }

    revalidatePath("/admin/emails");
    revalidatePath("/api/emails/preview");
    return { success: true, message: "Wijzigingen succesvol opgeslagen!" };
  } catch (err: any) {
    return { success: false, message: `Opslaan mislukt: ${err?.message || "onbekende fout"}` };
  }
}
