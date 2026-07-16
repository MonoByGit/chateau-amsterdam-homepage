// lib/db/media.test.ts
import { afterEach, describe, expect, it } from "vitest";
import { db } from "./client";
import { media } from "./schema";
import { createMedia, deleteMedia, listMedia } from "./media";

describe("media repository", () => {
  afterEach(async () => {
    await db.delete(media);
  });

  it("createMedia inserts a row and returns it", async () => {
    const row = await createMedia({
      storageKey: "media/test-key.jpg",
      filename: "test-key.jpg",
      altTextNl: "Test afbeelding",
      altTextEn: "Test image",
      uploadedBy: null,
    });

    expect(row.id).toBeDefined();
    expect(row.storageKey).toBe("media/test-key.jpg");
    expect(row.altTextNl).toBe("Test afbeelding");
  });

  it("listMedia returns rows most-recent first", async () => {
    const first = await createMedia({
      storageKey: "media/a.jpg",
      filename: "a.jpg",
      altTextNl: null,
      altTextEn: null,
      uploadedBy: null,
    });
    await new Promise((resolve) => setTimeout(resolve, 10));
    const second = await createMedia({
      storageKey: "media/b.jpg",
      filename: "b.jpg",
      altTextNl: null,
      altTextEn: null,
      uploadedBy: null,
    });

    const rows = await listMedia();
    expect(rows[0].id).toBe(second.id);
    expect(rows[1].id).toBe(first.id);
  });

  it("deleteMedia removes the row", async () => {
    const row = await createMedia({
      storageKey: "media/c.jpg",
      filename: "c.jpg",
      altTextNl: null,
      altTextEn: null,
      uploadedBy: null,
    });

    await deleteMedia(row.id);

    const rows = await listMedia();
    expect(rows.find((r) => r.id === row.id)).toBeUndefined();
  });
});
