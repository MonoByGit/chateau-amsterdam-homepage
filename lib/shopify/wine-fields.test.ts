// lib/shopify/wine-fields.test.ts
import { describe, expect, it } from "vitest";
import { WINE_METAFIELD_IDENTIFIERS, metafieldsToRecord } from "./wine-fields";

describe("WINE_METAFIELD_IDENTIFIERS", () => {
  it("only uses the custom and specs namespaces", () => {
    for (const id of WINE_METAFIELD_IDENTIFIERS) {
      expect(["custom", "specs"]).toContain(id.namespace);
    }
  });

  it("has no duplicate keys", () => {
    const keys = WINE_METAFIELD_IDENTIFIERS.map((id) => id.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("metafieldsToRecord", () => {
  it("keeps only fields with a non-empty value", () => {
    const record = metafieldsToRecord([
      { key: "oneliner", value: "Licht en fruitig" },
      { key: "story", value: "" },
      null,
    ]);
    expect(record).toEqual({ oneliner: "Licht en fruitig" });
  });

  it("returns an empty record for an empty list", () => {
    expect(metafieldsToRecord([])).toEqual({});
  });
});
