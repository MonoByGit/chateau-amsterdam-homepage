// lib/db/availability.ts
import { and, eq, gte, lt } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { availabilityBlocks } from "@/lib/db/schema";

export type AvailabilityBlock = InferSelectModel<typeof availabilityBlocks>;

export const MAX_SLOTS_PER_DAY = 4;

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export async function listBlocksForMonth(year: number, month: number): Promise<AvailabilityBlock[]> {
  const start = `${year}-${pad(month)}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = `${nextYear}-${pad(nextMonth)}-01`;

  return db
    .select()
    .from(availabilityBlocks)
    .where(and(gte(availabilityBlocks.date, start), lt(availabilityBlocks.date, end)));
}

export async function getDayBlocks(date: string): Promise<AvailabilityBlock[]> {
  return db.select().from(availabilityBlocks).where(eq(availabilityBlocks.date, date));
}

// Replaces the full set of blocks for a date in one go, mirroring the day
// editor form: a full-day toggle plus up to MAX_SLOTS_PER_DAY free-text time
// slots. Passing isFullDay clears any slots; slots with isFullDay false
// clear any full-day block. Saving with nothing set clears the date
// entirely (day fully open again).
export async function saveDayBlocks(date: string, input: { isFullDay: boolean; slots: string[] }): Promise<void> {
  await db.delete(availabilityBlocks).where(eq(availabilityBlocks.date, date));

  if (input.isFullDay) {
    await db.insert(availabilityBlocks).values({ date, isFullDay: true, label: null });
    return;
  }

  const cleanSlots = input.slots
    .map((slot) => slot.trim())
    .filter(Boolean)
    .slice(0, MAX_SLOTS_PER_DAY);

  if (cleanSlots.length === 0) return;

  await db.insert(availabilityBlocks).values(cleanSlots.map((label) => ({ date, isFullDay: false, label })));
}
