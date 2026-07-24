// app/admin/availability/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { clearAllBlocks, saveDayBlocks } from "@/lib/db/availability";
import { saveIcalUrl, syncGoogleCalendar } from "@/lib/ical/sync";

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

export async function saveIcalSyncUrl(formData: FormData): Promise<{ success: boolean; message: string }> {
  const url = String(formData.get("icalUrl") ?? "").trim();
  await saveIcalUrl(url);
  revalidatePath("/admin/availability");
  return { success: true, message: "Google Calendar iCal URL opgeslagen." };
}

export async function triggerGoogleCalendarSync(): Promise<{ success: boolean; message: string }> {
  try {
    const result = await syncGoogleCalendar();
    revalidatePath("/admin/availability");
    revalidatePath("/admin");
    return {
      success: true,
      message: `Google Calendar gesynchroniseerd: ${result.syncedEvents} events verwerkt, ${result.datesUpdated} datums bijgewerkt.`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Synchronisatiefout";
    return { success: false, message: `Fout bij synchroniseren: ${msg}` };
  }
}

export async function clearAllAvailabilityBlocks(): Promise<{ success: boolean; message: string }> {
  await clearAllBlocks();
  revalidatePath("/admin/availability");
  revalidatePath("/admin");
  return { success: true, message: "Alle oude beschikbaarheids-blokkades zijn gewist. De kalender is nu schoon." };
}
