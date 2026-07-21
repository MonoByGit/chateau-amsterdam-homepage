// lib/wines/wine-type-labels.test.ts
import { describe, expect, it } from "vitest";
import { wineTypeLabel } from "./wine-type-labels";

describe("wineTypeLabel", () => {
  it("translates the six known Shopify productType values", () => {
    expect(wineTypeLabel("Red wine", "nl")).toBe("Rood");
    expect(wineTypeLabel("Red wine", "en")).toBe("Red");
    expect(wineTypeLabel("White wine", "nl")).toBe("Wit");
    expect(wineTypeLabel("Orange wine", "nl")).toBe("Oranje");
    expect(wineTypeLabel("Rose wine", "nl")).toBe("Rosé");
    expect(wineTypeLabel("Pet nat", "en")).toBe("Pét-Nat");
    expect(wineTypeLabel("Piquette", "nl")).toBe("Piquette");
  });

  it("falls back to the raw value for an unknown type", () => {
    expect(wineTypeLabel("Dessert wine", "nl")).toBe("Dessert wine");
  });
});
