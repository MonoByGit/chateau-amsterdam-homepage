// app/admin/availability/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { toggleBlock, type Daypart } from "@/lib/db/availability";

export async function toggleAvailability(date: string, daypart: Daypart, reason?: string): Promise<void> {
  await toggleBlock(date, daypart, reason);
  revalidatePath("/admin/availability");
}
