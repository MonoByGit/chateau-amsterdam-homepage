// lib/db/wines.test.ts
import { afterEach, describe, expect, it } from "vitest";
import { db } from "./client";
import { media, wines } from "./schema";
import { createMedia } from "./media";
import {
  countHomepageWines,
  createWine,
  deleteWine,
  getFeaturedWines,
  getRelatedWines,
  getWine,
  getWineBySlug,
  listActiveWines,
  listWines,
  reorderWines,
  updateWine,
  type WineInput,
} from "./wines";

function wineInput(overrides: Partial<WineInput> = {}): WineInput {
  return {
    name: "Testwijn",
    metaNl: "Wit · Test, NL",
    metaEn: "White · Test, NL",
    tagNl: "de testfles",
    tagEn: "the test bottle",
    imageId: null,
    shopifyHandle: `test-handle-${Math.random().toString(36).slice(2)}`,
    isActive: true,
    showOnHomepage: true,
    ...overrides,
  };
}

describe("wines repository", () => {
  afterEach(async () => {
    await db.delete(wines);
  });

  it("createWine inserts a row and assigns the next sortOrder", async () => {
    const first = await createWine(wineInput({ name: "Eerste" }));
    const second = await createWine(wineInput({ name: "Tweede" }));

    expect(first.sortOrder).toBe(0);
    expect(second.sortOrder).toBe(1);
  });

  it("getWine returns the matching row, or null when not found", async () => {
    const created = await createWine(wineInput());
    expect((await getWine(created.id))?.name).toBe("Testwijn");
    expect(await getWine("00000000-0000-0000-0000-000000000000")).toBeNull();
  });

  it("listWines orders by sortOrder", async () => {
    const a = await createWine(wineInput({ name: "A" }));
    const b = await createWine(wineInput({ name: "B" }));
    const c = await createWine(wineInput({ name: "C" }));

    const rows = await listWines({});
    expect(rows.map((w) => w.id)).toEqual([a.id, b.id, c.id]);
  });

  it("listWines({ activeOnly: true }) filters out inactive wines", async () => {
    const active = await createWine(wineInput({ name: "Actief", isActive: true }));
    await createWine(wineInput({ name: "Inactief", isActive: false }));

    const rows = await listWines({ activeOnly: true });
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe(active.id);
  });

  it("updateWine changes the given fields", async () => {
    const created = await createWine(wineInput());
    await updateWine(created.id, { name: "Nieuwe naam" });
    expect((await getWine(created.id))?.name).toBe("Nieuwe naam");
  });

  it("deleteWine removes the row", async () => {
    const created = await createWine(wineInput());
    await deleteWine(created.id);
    expect(await getWine(created.id)).toBeNull();
  });

  it("reorderWines updates sortOrder to match the given array position", async () => {
    const a = await createWine(wineInput({ name: "A" }));
    const b = await createWine(wineInput({ name: "B" }));
    const c = await createWine(wineInput({ name: "C" }));

    await reorderWines([c.id, a.id, b.id]);

    const rows = await listWines({});
    expect(rows.map((w) => w.id)).toEqual([c.id, a.id, b.id]);
    expect(rows.map((w) => w.sortOrder)).toEqual([0, 1, 2]);
  });
});

describe("createWine slug generation", () => {
  afterEach(async () => {
    await db.delete(wines);
  });

  it("generates a slug from the name", async () => {
    const wine = await createWine(wineInput({ name: "Pinot Noir" }));
    expect(wine.slug).toBe("pinot-noir");
  });

  it("appends a numeric suffix when the slug is already taken", async () => {
    await createWine(wineInput({ name: "Pinot Noir" }));
    const second = await createWine(wineInput({ name: "Pinot Noir" }));
    expect(second.slug).toBe("pinot-noir-2");
  });

  it("does not change the slug when the wine is later renamed", async () => {
    const wine = await createWine(wineInput({ name: "Pinot Noir" }));
    await updateWine(wine.id, { name: "Pinot Noir Reserve" });
    expect((await getWine(wine.id))?.slug).toBe("pinot-noir");
  });
});

describe("getWineBySlug", () => {
  afterEach(async () => {
    await db.delete(wines);
  });

  it("returns the matching row, or null when not found", async () => {
    const created = await createWine(wineInput({ name: "Pinot Noir" }));
    expect((await getWineBySlug("pinot-noir"))?.id).toBe(created.id);
    expect(await getWineBySlug("does-not-exist")).toBeNull();
  });
});

describe("getRelatedWines", () => {
  afterEach(async () => {
    await db.delete(wines);
  });

  it("returns other active wines, excluding the given id", async () => {
    const a = await createWine(wineInput({ name: "A" }));
    const b = await createWine(wineInput({ name: "B" }));
    const c = await createWine(wineInput({ name: "C", isActive: false }));

    const related = await getRelatedWines(a.id);
    expect(related.map((w) => w.id)).toEqual([b.id]);
    expect(related.map((w) => w.id)).not.toContain(a.id);
    expect(related.map((w) => w.id)).not.toContain(c.id);
  });

  it("caps the result at 4 wines", async () => {
    const created = await Promise.all(
      Array.from({ length: 6 }, (_, i) => createWine(wineInput({ name: `Wine ${i}` })))
    );
    const related = await getRelatedWines(created[0].id);
    expect(related.length).toBeLessThanOrEqual(4);
  });
});

describe("listActiveWines", () => {
  afterEach(async () => {
    await db.delete(wines);
    await db.delete(media);
  });

  it("joins the linked media row and excludes inactive wines", async () => {
    const image = await createMedia({
      storageKey: "media/riesling.jpg",
      filename: "riesling.jpg",
      altTextNl: "Riesling fles",
      altTextEn: "Riesling bottle",
      uploadedBy: null,
    });
    const active = await createWine(wineInput({ name: "Actief", imageId: image.id, isActive: true }));
    await createWine(wineInput({ name: "Inactief", isActive: false }));

    const rows = await listActiveWines();

    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe(active.id);
    expect(rows[0].imageStorageKey).toBe("media/riesling.jpg");
    expect(rows[0].imageAltNl).toBe("Riesling fles");
  });

  it("includes wines regardless of showOnHomepage", async () => {
    await createWine(wineInput({ name: "Niet op homepage", showOnHomepage: false }));
    expect(await listActiveWines()).toHaveLength(1);
  });

  it("returns an empty array when there are no active wines", async () => {
    await createWine(wineInput({ isActive: false }));
    expect(await listActiveWines()).toEqual([]);
  });
});

describe("getFeaturedWines", () => {
  afterEach(async () => {
    await db.delete(wines);
    await db.delete(media);
  });

  it("only returns active wines with showOnHomepage set", async () => {
    const featured = await createWine(wineInput({ name: "Uitgelicht", showOnHomepage: true }));
    await createWine(wineInput({ name: "Niet uitgelicht", showOnHomepage: false }));
    await createWine(wineInput({ name: "Inactief", isActive: false, showOnHomepage: true }));

    const rows = await getFeaturedWines();
    expect(rows.map((w) => w.id)).toEqual([featured.id]);
  });
});

describe("countHomepageWines", () => {
  afterEach(async () => {
    await db.delete(wines);
  });

  it("counts only wines with showOnHomepage set", async () => {
    await createWine(wineInput({ showOnHomepage: true }));
    await createWine(wineInput({ showOnHomepage: true }));
    await createWine(wineInput({ showOnHomepage: false }));

    expect(await countHomepageWines()).toBe(2);
  });

  it("excludes the given id, so a wine doesn't count against its own cap check", async () => {
    const a = await createWine(wineInput({ showOnHomepage: true }));
    await createWine(wineInput({ showOnHomepage: true }));

    expect(await countHomepageWines(a.id)).toBe(1);
  });
});
