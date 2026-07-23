// lib/ical/sync.ts
import { db } from "@/lib/db/client";
import { availabilityBlocks, contentBlocks } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export type IcalEvent = {
  summary: string;
  startDateIso: string; // YYYY-MM-DD
  startTime?: string;   // HH:mm if time-specific
  isAllDay: boolean;
};

// Pure ICS VEVENT text parser
export function parseIcalFeed(icsText: string): IcalEvent[] {
  const events: IcalEvent[] = [];
  const vevents = icsText.split("BEGIN:VEVENT");

  for (let i = 1; i < vevents.length; i++) {
    const block = vevents[i].split("END:VEVENT")[0];
    if (!block) continue;

    // Unfold multi-line folded headers in ICS (lines starting with space/tab)
    const unfolded = block.replace(/\r?\n[ \t]/g, "");
    const lines = unfolded.split(/\r?\n/);

    let summary = "";
    let dtstartRaw = "";
    let dtendRaw = "";

    for (const line of lines) {
      if (line.startsWith("SUMMARY:")) {
        summary = line.substring("SUMMARY:".length).trim();
      } else if (line.startsWith("DTSTART")) {
        const parts = line.split(":");
        if (parts.length >= 2) dtstartRaw = parts.slice(1).join(":").trim();
      } else if (line.startsWith("DTEND")) {
        const parts = line.split(":");
        if (parts.length >= 2) dtendRaw = parts.slice(1).join(":").trim();
      }
    }

    if (!dtstartRaw) continue;

    // Parse date vs datetime
    // e.g. 20260810 or 20260810T150000Z or 20260810T150000
    const isAllDay = !dtstartRaw.includes("T");
    const datePart = dtstartRaw.replace(/[^0-9]/g, "").slice(0, 8);
    if (datePart.length !== 8) continue;

    const year = datePart.slice(0, 4);
    const month = datePart.slice(4, 6);
    const day = datePart.slice(6, 8);
    const startDateIso = `${year}-${month}-${day}`;

    let startTime: string | undefined = undefined;
    if (!isAllDay && dtstartRaw.includes("T")) {
      const timePart = dtstartRaw.split("T")[1]?.replace(/[^0-9]/g, "").slice(0, 4);
      if (timePart && timePart.length === 4) {
        startTime = `${timePart.slice(0, 2)}:${timePart.slice(2, 4)}`;
      }
    }

    events.push({
      summary,
      startDateIso,
      startTime,
      isAllDay,
    });
  }

  return events;
}

export async function getIcalUrl(): Promise<string> {
  // Check CMS database first
  const blocks = await db
    .select()
    .from(contentBlocks)
    .where(
      and(
        eq(contentBlocks.page, "system"),
        eq(contentBlocks.section, "calendar"),
        eq(contentBlocks.fieldKey, "ical_url")
      )
    );
  
  if (blocks[0]?.valueNl) return blocks[0].valueNl;
  return process.env.GOOGLE_CALENDAR_ICAL_URL ?? "";
}

export async function saveIcalUrl(url: string): Promise<void> {
  const cleanUrl = url.trim();
  await db
    .insert(contentBlocks)
    .values({
      page: "system",
      section: "calendar",
      fieldKey: "ical_url",
      valueNl: cleanUrl,
      valueEn: cleanUrl,
    })
    .onConflictDoUpdate({
      target: [contentBlocks.page, contentBlocks.section, contentBlocks.fieldKey],
      set: { valueNl: cleanUrl, valueEn: cleanUrl, updatedAt: new Date() },
    });
}

export async function syncGoogleCalendar(icalUrl?: string): Promise<{ syncedEvents: number; datesUpdated: number }> {
  const url = icalUrl || (await getIcalUrl());
  if (!url) return { syncedEvents: 0, datesUpdated: 0 };

  const res = await fetch(url, { headers: { "User-Agent": "ChateauAmsterdam/1.0" }, cache: "no-store" });
  if (!res.ok) throw new Error(`Google Calendar ICS response HTTP ${res.status}`);

  const icsText = await res.text();
  const events = parseIcalFeed(icsText);

  // Group events by date
  const eventsByDate = new Map<string, IcalEvent[]>();
  for (const ev of events) {
    const list = eventsByDate.get(ev.startDateIso) ?? [];
    list.push(ev);
    eventsByDate.set(ev.startDateIso, list);
  }

  let datesUpdated = 0;

  for (const [date, dayEvents] of eventsByDate.entries()) {
    const summaryLower = dayEvents.map((e) => e.summary.toLowerCase()).join(" ");
    
    // Check if whole day should be closed
    const hasFullDayClose =
      dayEvents.some((e) => e.isAllDay) ||
      summaryLower.includes("dicht") ||
      summaryLower.includes("gesloten") ||
      summaryLower.includes("sluiting") ||
      summaryLower.includes("volgeboekt");

    if (hasFullDayClose) {
      await db.delete(availabilityBlocks).where(eq(availabilityBlocks.date, date));
      await db.insert(availabilityBlocks).values({ date, isFullDay: true, label: "Google Calendar: Sluiting" });
      datesUpdated++;
      continue;
    }

    // Process slot-specific blocks
    const slotsToBlock: string[] = [];

    for (const ev of dayEvents) {
      const sum = ev.summary.toLowerCase();
      const time = ev.startTime ?? "";

      if (time.startsWith("15") || sum.includes("15:00") || sum.includes("15u") || sum.includes("3:00")) {
        slotsToBlock.push("15:00 uur (70 min. tour & tasting)");
      }
      if (time.startsWith("17") || sum.includes("17:00") || sum.includes("17u") || sum.includes("5:00")) {
        slotsToBlock.push("17:00 uur (70 min. tour & tasting)");
      }
      if (time.startsWith("19") || sum.includes("19:00") || sum.includes("19u") || sum.includes("7:00")) {
        slotsToBlock.push("19:00 uur (70 min. tour & tasting)");
      }

      // Any custom event summary (e.g. "Besloten feest")
      if (!time.startsWith("15") && !time.startsWith("17") && !time.startsWith("19") && ev.summary) {
        slotsToBlock.push(ev.summary);
      }
    }

    const uniqueSlots = Array.from(new Set(slotsToBlock)).slice(0, 4);
    if (uniqueSlots.length > 0) {
      await db.delete(availabilityBlocks).where(eq(availabilityBlocks.date, date));
      await db.insert(availabilityBlocks).values(
        uniqueSlots.map((label) => ({ date, isFullDay: false, label }))
      );
      datesUpdated++;
    }
  }

  return { syncedEvents: events.length, datesUpdated };
}
