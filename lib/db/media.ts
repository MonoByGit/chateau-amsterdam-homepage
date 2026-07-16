import { desc, eq } from "drizzle-orm";
import { db } from "./client";
import { media } from "./schema";

export type Media = typeof media.$inferSelect;

export type MediaInput = {
  storageKey: string;
  filename: string;
  altTextNl: string | null;
  altTextEn: string | null;
  uploadedBy: string | null;
};

export async function createMedia(input: MediaInput): Promise<Media> {
  const [row] = await db
    .insert(media)
    .values({
      storageKey: input.storageKey,
      filename: input.filename,
      altTextNl: input.altTextNl ?? "",
      altTextEn: input.altTextEn ?? "",
      uploadedBy: input.uploadedBy,
    })
    .returning();
  return row;
}

export async function listMedia(): Promise<Media[]> {
  return db.select().from(media).orderBy(desc(media.createdAt));
}

export async function deleteMedia(id: string): Promise<void> {
  await db.delete(media).where(eq(media.id, id));
}

export async function updateMedia(id: string, input: { altTextNl: string; altTextEn: string }): Promise<void> {
  await db.update(media).set(input).where(eq(media.id, id));
}
