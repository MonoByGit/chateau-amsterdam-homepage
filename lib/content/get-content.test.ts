// lib/content/get-content.test.ts
import { describe, it, expect, afterEach } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { contentBlocks } from "@/lib/db/schema";
import { upsertBlock } from "@/lib/db/content";
import { getContent } from "./get-content";

describe("getContent (fake repository — pure merge/fallback logic)", () => {
  it("uses the DB value when a row exists for a field", async () => {
    const fakeFetch = async () => [{ fieldKey: "heading", valueNl: "Van de DB", valueEn: "From the DB" }];

    const result = await getContent(
      "home",
      "test-section",
      { heading: { nl: "Default NL", en: "Default EN" } },
      fakeFetch
    );

    expect(result.heading).toEqual({ nl: "Van de DB", en: "From the DB" });
  });

  it("falls back to the hardcoded default when no DB row exists for a field", async () => {
    const fakeFetch = async () => [];

    const result = await getContent(
      "home",
      "test-section",
      { heading: { nl: "Default NL", en: "Default EN" } },
      fakeFetch
    );

    expect(result.heading).toEqual({ nl: "Default NL", en: "Default EN" });
  });

  it("falls back per-field when only some fields have DB rows (partial override, never blank)", async () => {
    const fakeFetch = async () => [{ fieldKey: "heading", valueNl: "Van de DB", valueEn: "From the DB" }];

    const result = await getContent(
      "home",
      "test-section",
      {
        heading: { nl: "Default heading NL", en: "Default heading EN" },
        sub: { nl: "Default sub NL", en: "Default sub EN" },
      },
      fakeFetch
    );

    expect(result.heading).toEqual({ nl: "Van de DB", en: "From the DB" });
    expect(result.sub).toEqual({ nl: "Default sub NL", en: "Default sub EN" });
  });
});

describe("getContent (real repository, real local Postgres)", () => {
  const TEST_PAGE = "__test_home__";

  afterEach(async () => {
    await db.delete(contentBlocks).where(eq(contentBlocks.page, TEST_PAGE));
  });

  it("merges a seeded DB row with an untouched default via the real getBlocksForSection wiring", async () => {
    await upsertBlock(TEST_PAGE, "get-content-integration", "heading", "Echte NL", "Real EN");

    // No fetchBlocks arg here — this exercises the real default (getBlocksForSection).
    const result = await getContent(TEST_PAGE, "get-content-integration", {
      heading: { nl: "Default heading NL", en: "Default heading EN" },
      sub: { nl: "Default sub NL", en: "Default sub EN" },
    });

    expect(result.heading).toEqual({ nl: "Echte NL", en: "Real EN" });
    expect(result.sub).toEqual({ nl: "Default sub NL", en: "Default sub EN" });
  });
});
