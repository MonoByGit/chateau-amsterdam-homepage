// lib/db/wines.test.ts
import { afterEach, describe, expect, it } from "vitest";
import { db } from "./client";
import { wines } from "./schema";
import { createWine, deleteWine, getWine, listWines, reorderWines, updateWine, type WineInput } from "./wines";

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
