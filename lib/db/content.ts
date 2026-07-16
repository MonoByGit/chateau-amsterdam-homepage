import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { contentBlocks } from "@/lib/db/schema";

export type ContentBlockRow = {
  fieldKey: string;
  valueNl: string;
  valueEn: string;
};

export async function getBlocksForSection(page: string, section: string): Promise<ContentBlockRow[]> {
  return db
    .select({
      fieldKey: contentBlocks.fieldKey,
      valueNl: contentBlocks.valueNl,
      valueEn: contentBlocks.valueEn,
    })
    .from(contentBlocks)
    .where(and(eq(contentBlocks.page, page), eq(contentBlocks.section, section)));
}

export async function upsertBlock(
  page: string,
  section: string,
  fieldKey: string,
  valueNl: string,
  valueEn: string,
  updatedBy?: string
): Promise<void> {
  await db
    .insert(contentBlocks)
    .values({ page, section, fieldKey, valueNl, valueEn, updatedBy, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [contentBlocks.page, contentBlocks.section, contentBlocks.fieldKey],
      set: { valueNl, valueEn, updatedBy, updatedAt: new Date() },
    });
}

export async function getAllSections(page: string): Promise<string[]> {
  const rows = await db
    .selectDistinct({ section: contentBlocks.section })
    .from(contentBlocks)
    .where(eq(contentBlocks.page, page));
  return rows.map((row) => row.section);
}
