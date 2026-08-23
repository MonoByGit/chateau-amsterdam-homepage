import { and, desc, eq, notInArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { contentBlocks, contentVersions } from "@/lib/db/schema";

export type ContentBlockRow = {
  fieldKey: string;
  valueNl: string;
  valueEn: string;
};

export type ContentVersionRow = {
  id: string;
  page: string;
  section: string;
  snapshot: Record<string, { valueNl: string; valueEn: string }>;
  note: string | null;
  updatedBy: string | null;
  createdAt: Date;
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

/**
 * Creates a version snapshot for a page section, retaining only the 5 most recent snapshots.
 */
export async function createVersionSnapshot(
  page: string,
  section: string,
  snapshot: Record<string, { valueNl: string; valueEn: string }>,
  note?: string,
  updatedBy?: string
): Promise<void> {
  await db.insert(contentVersions).values({
    page,
    section,
    snapshot,
    note: note || "Opgeslagen via CMS",
    updatedBy,
    createdAt: new Date(),
  });

  const latestVersions = await db
    .select({ id: contentVersions.id })
    .from(contentVersions)
    .where(and(eq(contentVersions.page, page), eq(contentVersions.section, section)))
    .orderBy(desc(contentVersions.createdAt))
    .limit(5);

  const keepIds = latestVersions.map((v) => v.id);
  if (keepIds.length > 0) {
    await db
      .delete(contentVersions)
      .where(
        and(
          eq(contentVersions.page, page),
          eq(contentVersions.section, section),
          notInArray(contentVersions.id, keepIds)
        )
      );
  }
}

/**
 * Retrieves the 5 most recent snapshots for a page section.
 */
export async function getVersionsForSection(page: string, section: string): Promise<ContentVersionRow[]> {
  try {
    return await db
      .select()
      .from(contentVersions)
      .where(and(eq(contentVersions.page, page), eq(contentVersions.section, section)))
      .orderBy(desc(contentVersions.createdAt))
      .limit(5);
  } catch {
    return [];
  }
}

/**
 * Restores content blocks from a specific snapshot and records a new rollback snapshot.
 */
export async function restoreVersionSnapshot(versionId: string): Promise<{ page: string; section: string } | null> {
  const [version] = await db
    .select()
    .from(contentVersions)
    .where(eq(contentVersions.id, versionId))
    .limit(1);

  if (!version) return null;

  const { page, section, snapshot, createdAt } = version;

  for (const [fieldKey, val] of Object.entries(snapshot)) {
    await upsertBlock(page, section, fieldKey, val.valueNl, val.valueEn);
  }

  const dateFormatted = new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(createdAt);

  await createVersionSnapshot(
    page,
    section,
    snapshot,
    `Hersteld naar momentopname van ${dateFormatted}`
  );

  return { page, section };
}

