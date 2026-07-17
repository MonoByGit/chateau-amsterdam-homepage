import { describe, it, expect } from "vitest";
import { slugify, uniqueSlug } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Pinot Noir")).toBe("pinot-noir");
  });

  it("strips diacritics and punctuation", () => {
    expect(slugify("Riesling × Moscatel!")).toBe("riesling-moscatel");
  });

  it("collapses repeated separators and trims leading/trailing hyphens", () => {
    expect(slugify("  Amber   Blend -- ")).toBe("amber-blend");
  });
});

describe("uniqueSlug", () => {
  it("returns the plain slug when it does not already exist", async () => {
    const result = await uniqueSlug("Pinot Noir", async () => false);
    expect(result).toBe("pinot-noir");
  });

  it("appends -2, -3, ... until it finds a slug that does not exist", async () => {
    const taken = new Set(["pinot-noir", "pinot-noir-2"]);
    const result = await uniqueSlug("Pinot Noir", async (candidate) => taken.has(candidate));
    expect(result).toBe("pinot-noir-3");
  });
});
