// lib/db/content.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { contentBlocks, users } from "@/lib/db/schema";
import { createUser } from "./users";
import { getBlocksForSection, upsertBlock, getAllSections } from "./content";

// A dedicated, obviously-fake page value keeps this suite's writes isolated
// from any real "home" rows a developer might already have seeded locally.
const TEST_PAGE = "__test_home__";

async function cleanTables() {
  await db.delete(contentBlocks).where(eq(contentBlocks.page, TEST_PAGE));
  await db.delete(users).where(eq(users.email, "content-editor@chateau.amsterdam"));
}

beforeEach(cleanTables);
afterEach(cleanTables);

describe("upsertBlock + getBlocksForSection", () => {
  it("inserts a new block when none exists yet", async () => {
    await upsertBlock(TEST_PAGE, "hero", "heading", "Nederlandse tekst", "English text");

    const rows = await getBlocksForSection(TEST_PAGE, "hero");

    expect(rows).toEqual([{ fieldKey: "heading", valueNl: "Nederlandse tekst", valueEn: "English text" }]);
  });

  it("updates the existing row instead of inserting a duplicate on a repeat call for the same field", async () => {
    await upsertBlock(TEST_PAGE, "hero", "heading", "Eerste versie", "First version");
    await upsertBlock(TEST_PAGE, "hero", "heading", "Tweede versie", "Second version");

    const rows = await getBlocksForSection(TEST_PAGE, "hero");

    expect(rows).toEqual([{ fieldKey: "heading", valueNl: "Tweede versie", valueEn: "Second version" }]);
  });

  it("only returns rows scoped to the given page and section", async () => {
    await upsertBlock(TEST_PAGE, "hero", "heading", "Hero NL", "Hero EN");
    await upsertBlock(TEST_PAGE, "manifest", "heading", "Manifest NL", "Manifest EN");

    const rows = await getBlocksForSection(TEST_PAGE, "hero");

    expect(rows).toEqual([{ fieldKey: "heading", valueNl: "Hero NL", valueEn: "Hero EN" }]);
  });

  it("records updatedBy when provided", async () => {
    const editor = await createUser("content-editor@chateau.amsterdam", "hashed-password");
    await upsertBlock(TEST_PAGE, "hero", "heading", "NL", "EN", editor.id);

    const [row] = await db
      .select({ updatedBy: contentBlocks.updatedBy })
      .from(contentBlocks)
      .where(eq(contentBlocks.page, TEST_PAGE));

    expect(row.updatedBy).toBe(editor.id);
  });
});

describe("getAllSections", () => {
  it("returns the distinct sections that have at least one block for a page", async () => {
    await upsertBlock(TEST_PAGE, "hero", "heading", "Hero NL", "Hero EN");
    await upsertBlock(TEST_PAGE, "hero", "sub", "Hero sub NL", "Hero sub EN");
    await upsertBlock(TEST_PAGE, "manifest", "heading", "Manifest NL", "Manifest EN");

    const sections = await getAllSections(TEST_PAGE);

    expect(sections.sort()).toEqual(["hero", "manifest"]);
  });

  it("returns an empty array when the page has no blocks at all", async () => {
    const sections = await getAllSections(TEST_PAGE);
    expect(sections).toEqual([]);
  });
});
