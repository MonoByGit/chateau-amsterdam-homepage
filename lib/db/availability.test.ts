// lib/db/availability.test.ts
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db/client";
import { availabilityBlocks } from "@/lib/db/schema";
import { getDayBlocks, listBlocksForMonth, saveDayBlocks } from "./availability";

describe("availability repository", () => {
  beforeEach(async () => {
    await db.delete(availabilityBlocks);
  });

  describe("listBlocksForMonth", () => {
    it("returns only blocks within the given month", async () => {
      await db.insert(availabilityBlocks).values([
        { date: "2026-07-31", isFullDay: false, label: "Avond dicht" },
        { date: "2026-08-01", isFullDay: false, label: "Ochtend levering" },
        { date: "2026-08-15", isFullDay: false, label: "14:00-17:00 besloten feest" },
        { date: "2026-08-31", isFullDay: true },
        { date: "2026-09-01", isFullDay: false, label: "Na de maand" },
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

  describe("saveDayBlocks", () => {
    it("creates a full-day block and clears any prior slots", async () => {
      await saveDayBlocks("2026-08-10", { isFullDay: false, slots: ["09:00-12:00"] });
      await saveDayBlocks("2026-08-10", { isFullDay: true, slots: [] });

      const blocks = await getDayBlocks("2026-08-10");
      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toMatchObject({ isFullDay: true, label: null });
    });

    it("creates one row per non-empty slot, ignoring blanks", async () => {
      await saveDayBlocks("2026-08-10", {
        isFullDay: false,
        slots: ["09:00-11:00 levering", "", "  ", "16:00-18:00 besloten"],
      });

      const blocks = await getDayBlocks("2026-08-10");
      const labels = blocks.map((b) => b.label).sort();
      expect(labels).toEqual(["09:00-11:00 levering", "16:00-18:00 besloten"]);
      expect(blocks.every((b) => b.isFullDay === false)).toBe(true);
    });

    it("caps slots at 4 even if more are passed", async () => {
      await saveDayBlocks("2026-08-10", {
        isFullDay: false,
        slots: ["slot 1", "slot 2", "slot 3", "slot 4", "slot 5"],
      });

      const blocks = await getDayBlocks("2026-08-10");
      expect(blocks).toHaveLength(4);
    });

    it("clears the date entirely when saved with nothing set", async () => {
      await saveDayBlocks("2026-08-10", { isFullDay: false, slots: ["09:00-12:00"] });
      await saveDayBlocks("2026-08-10", { isFullDay: false, slots: [] });

      const blocks = await getDayBlocks("2026-08-10");
      expect(blocks).toEqual([]);
    });

    it("replaces existing slots rather than appending to them", async () => {
      await saveDayBlocks("2026-08-10", { isFullDay: false, slots: ["09:00-12:00"] });
      await saveDayBlocks("2026-08-10", { isFullDay: false, slots: ["14:00-17:00"] });

      const blocks = await getDayBlocks("2026-08-10");
      expect(blocks).toHaveLength(1);
      expect(blocks[0].label).toEqual("14:00-17:00");
    });

    it("keeps other dates untouched", async () => {
      await saveDayBlocks("2026-08-10", { isFullDay: true, slots: [] });
      await saveDayBlocks("2026-08-11", { isFullDay: false, slots: ["09:00-12:00"] });

      const blocks = await listBlocksForMonth(2026, 8);
      const dates = blocks.map((b) => b.date).sort();
      expect(dates).toEqual(["2026-08-10", "2026-08-11"]);
    });
  });
});
