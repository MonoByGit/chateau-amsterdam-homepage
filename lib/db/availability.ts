// lib/db/availability.ts
import { and, eq, gte, lt } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { availabilityBlocks } from "@/lib/db/schema";

export type AvailabilityBlock = InferSelectModel<typeof availabilityBlocks>;
export type Daypart = AvailabilityBlock["daypart"];

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

export async function toggleBlock(
  date: string,
  daypart: Daypart,
  reason?: string
): Promise<{ blocked: boolean }> {
  const [existing] = await db
    .select()
    .from(availabilityBlocks)
    .where(and(eq(availabilityBlocks.date, date), eq(availabilityBlocks.daypart, daypart)))
    .limit(1);

  if (existing) {
    await db.delete(availabilityBlocks).where(eq(availabilityBlocks.id, existing.id));
    return { blocked: false };
  }

  await db.insert(availabilityBlocks).values({ date, daypart, reason });
  return { blocked: true };
}
