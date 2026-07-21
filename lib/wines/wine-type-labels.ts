// lib/wines/wine-type-labels.ts
// The closed set of productType values used by Shopify's "all-wines" smart
// collection filter (confirmed live 2026-07-21). Falls back to the raw
// Shopify value for anything outside this set instead of hiding it, so a
// new wine type the client adds in Shopify never disappears from the site
// — it just shows the English Shopify label until this map is extended.
const WINE_TYPE_LABELS: Record<string, { nl: string; en: string }> = {
  "Red wine": { nl: "Rood", en: "Red" },
  "White wine": { nl: "Wit", en: "White" },
  "Rose wine": { nl: "Rosé", en: "Rosé" },
  "Orange wine": { nl: "Oranje", en: "Orange" },
  "Pet nat": { nl: "Pét-Nat", en: "Pét-Nat" },
  Piquette: { nl: "Piquette", en: "Piquette" },
};

export function wineTypeLabel(productType: string, lang: "nl" | "en"): string {
  return WINE_TYPE_LABELS[productType]?.[lang] ?? productType;
}
