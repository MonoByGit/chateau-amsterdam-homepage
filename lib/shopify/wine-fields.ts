// lib/shopify/wine-fields.ts
// The fixed set of already-populated Shopify metafields this site reads for
// wine editorial content (see docs/superpowers/plans/2026-07-21-shopify-wine-catalog-mirror.md
// for which fields exist in Shopify and why these were picked). Namespace is
// NOT uniform — checked one by one in the Shopify admin (Instellingen >
// Metavelden en metaobjecten > Product): most live under `custom`, but the
// region/grape/country trio live under `specs`, and "Country of origin"'s
// actual key is just `country`, not `country_of_origin` as its label
// suggests. Don't "clean this up" to be consistent — it'd break the fetch.
export const WINE_METAFIELD_IDENTIFIERS = [
  { namespace: "custom", key: "oneliner" },
  { namespace: "custom", key: "wine_profile" },
  { namespace: "custom", key: "flavor" },
  { namespace: "specs", key: "region_of_origin" },
  { namespace: "specs", key: "grape_variety" },
  { namespace: "specs", key: "country" },
  { namespace: "custom", key: "tasting_notes" },
  { namespace: "custom", key: "pairing" },
  { namespace: "custom", key: "story" },
  { namespace: "custom", key: "origin" },
] as const;

export type WineMetafieldKey = (typeof WINE_METAFIELD_IDENTIFIERS)[number]["key"];

export type WineFields = Partial<Record<WineMetafieldKey, string>>;

type RawMetafield = { key: string; value: string } | null;

// Shopify returns one entry per requested identifier, `null` if the store
// never set that field on this product, and empty-string values happen too
// (a field that was filled in and then cleared) — both collapse to "not
// present" so callers can do simple `fields.story ? ... : null` checks.
export function metafieldsToRecord(metafields: RawMetafield[]): WineFields {
  const record: WineFields = {};
  for (const field of metafields) {
    if (field && field.value) {
      record[field.key as WineMetafieldKey] = field.value;
    }
  }
  return record;
}
