// app/admin/availability/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { saveDayBlocks } from "@/lib/db/availability";

export async function saveDayAvailability(date: string, formData: FormData): Promise<void> {
  const isFullDay = formData.get("isFullDay") === "on";
  const slots = [
    String(formData.get("slot1") ?? ""),
    String(formData.get("slot2") ?? ""),
    String(formData.get("slot3") ?? ""),
    String(formData.get("slot4") ?? ""),
  ];

  await saveDayBlocks(date, { isFullDay, slots });
  revalidatePath("/admin/availability");
  revalidatePath("/admin");
}
