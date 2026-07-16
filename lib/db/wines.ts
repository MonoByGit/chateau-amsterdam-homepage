import { asc, eq, sql } from "drizzle-orm";
import { db } from "./client";
import { media, wines } from "./schema";

export type Wine = typeof wines.$inferSelect;

export type WineInput = {
  name: string;
  metaNl: string;
  metaEn: string;
  tagNl: string;
  tagEn: string;
  imageId: string | null;
  shopifyHandle: string;
  isActive: boolean;
};

export async function listWines({ activeOnly = false }: { activeOnly?: boolean } = {}): Promise<Wine[]> {
  if (activeOnly) {
    return db.select().from(wines).where(eq(wines.isActive, true)).orderBy(asc(wines.sortOrder));
  }
  return db.select().from(wines).orderBy(asc(wines.sortOrder));
}

export async function getWine(id: string): Promise<Wine | null> {
  const [row] = await db.select().from(wines).where(eq(wines.id, id));
  return row ?? null;
}

export async function createWine(input: WineInput): Promise<Wine> {
  const [{ maxSortOrder }] = await db
    .select({ maxSortOrder: sql<number>`coalesce(max(${wines.sortOrder}), -1)` })
    .from(wines);

  const [row] = await db
    .insert(wines)
    .values({ ...input, sortOrder: maxSortOrder + 1 })
    .returning();
  return row;
}

export async function updateWine(id: string, input: Partial<WineInput>): Promise<void> {
  await db
    .update(wines)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(wines.id, id));
}

export async function deleteWine(id: string): Promise<void> {
  await db.delete(wines).where(eq(wines.id, id));
}

export async function reorderWines(orderedIds: string[]): Promise<void> {
  await db.transaction(async (tx) => {
    for (const [index, id] of orderedIds.entries()) {
      await tx.update(wines).set({ sortOrder: index }).where(eq(wines.id, id));
    }
  });
}

export type WineWithImage = Wine & {
  imageStorageKey: string | null;
  imageAltNl: string | null;
  imageAltEn: string | null;
};

export async function getWinesForHomepage(): Promise<WineWithImage[]> {
  return db
    .select({
      id: wines.id,
      name: wines.name,
      metaNl: wines.metaNl,
      metaEn: wines.metaEn,
      tagNl: wines.tagNl,
      tagEn: wines.tagEn,
      imageId: wines.imageId,
      shopifyHandle: wines.shopifyHandle,
      sortOrder: wines.sortOrder,
      isActive: wines.isActive,
      updatedAt: wines.updatedAt,
      imageStorageKey: media.storageKey,
      imageAltNl: media.altTextNl,
      imageAltEn: media.altTextEn,
    })
    .from(wines)
    .leftJoin(media, eq(wines.imageId, media.id))
    .where(eq(wines.isActive, true))
    .orderBy(asc(wines.sortOrder));
}
