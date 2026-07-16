// lib/db/availability.test.ts
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db/client";
import { availabilityBlocks } from "@/lib/db/schema";
import { listBlocksForMonth, toggleBlock } from "./availability";

describe("availability repository", () => {
  beforeEach(async () => {
    await db.delete(availabilityBlocks);
  });

  describe("listBlocksForMonth", () => {
    it("returns only blocks within the given month", async () => {
      await db.insert(availabilityBlocks).values([
        { date: "2026-07-31", daypart: "avond", reason: "Voor de maand" },
        { date: "2026-08-01", daypart: "ochtend", reason: "Eerste dag" },
        { date: "2026-08-15", daypart: "middag", reason: "Midden" },
        { date: "2026-08-31", daypart: "hele_dag", reason: "Laatste dag" },
        { date: "2026-09-01", daypart: "ochtend", reason: "Na de maand" },
      ]);

      const blocks = await listBlocksForMonth(2026, 8);
      const dates = blocks.map((b) => b.date).sort();

      expect(dates).toEqual(["2026-08-01", "2026-08-15", "2026-08-31"]);
    });

    it("returns an empty array when there are no blocks in the month", async () => {
      const blocks = await listBlocksForMonth(2026, 8);
      expect(blocks).toEqual([]);
    });
  });

  describe("toggleBlock", () => {
    it("creates a block when none exists for that date and daypart", async () => {
      const result = await toggleBlock("2026-08-10", "avond", "Personeelsfeest");
      expect(result).toEqual({ blocked: true });

      const blocks = await listBlocksForMonth(2026, 8);
      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toMatchObject({ date: "2026-08-10", daypart: "avond" });
    });

    it("removes the block when toggled again for the same date and daypart", async () => {
      const first = await toggleBlock("2026-08-10", "avond");
      expect(first).toEqual({ blocked: true });

      const second = await toggleBlock("2026-08-10", "avond");
      expect(second).toEqual({ blocked: false });

      const blocks = await listBlocksForMonth(2026, 8);
      expect(blocks).toEqual([]);
    });

    it("keeps dayparts independent for the same date", async () => {
      await toggleBlock("2026-08-10", "ochtend");
      await toggleBlock("2026-08-10", "avond");

      const blocks = await listBlocksForMonth(2026, 8);
      const dayparts = blocks.map((b) => b.daypart).sort();

      expect(dayparts).toEqual(["avond", "ochtend"]);
    });
  });
});
