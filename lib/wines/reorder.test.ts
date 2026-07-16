// lib/wines/reorder.test.ts
import { describe, expect, it } from "vitest";
import { computeReorderedIds } from "./reorder";

describe("computeReorderedIds", () => {
  it("swaps a wine with the previous one when moving up", () => {
    expect(computeReorderedIds(["a", "b", "c"], "b", "up")).toEqual(["b", "a", "c"]);
  });

  it("swaps a wine with the next one when moving down", () => {
    expect(computeReorderedIds(["a", "b", "c"], "b", "down")).toEqual(["a", "c", "b"]);
  });

  it("returns null when moving the first item up", () => {
    expect(computeReorderedIds(["a", "b", "c"], "a", "up")).toBeNull();
  });

  it("returns null when moving the last item down", () => {
    expect(computeReorderedIds(["a", "b", "c"], "c", "down")).toBeNull();
  });

  it("returns null for an id not present in the list", () => {
    expect(computeReorderedIds(["a", "b", "c"], "z", "up")).toBeNull();
  });
});
