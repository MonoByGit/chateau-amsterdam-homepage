# Shopify Wine Catalog Mirror Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/wijnen` and `/wijnen/[handle]` a live mirror of the Shopify product catalog (all ~20-45 active wines, not just the 5 hand-typed CMS rows), source the 5-wine homepage teaser from a Shopify collection instead of a database flag, and retire the bespoke CMS "Wijnen" admin section so wine content has exactly one home: Shopify.

**Architecture:** Two new Storefront API queries (collection-of-wines, wine-by-handle) pull title/image/price/productType plus a fixed set of already-populated Shopify metafields (`custom.oneliner`, `custom.wine_profile`, `custom.story`, `custom.pairing`, `specs.grape_variety`, `specs.region_of_origin`, `specs.country`, `custom.tasting_notes`, `custom.flavor`, `custom.origin`). A new `lib/wines/catalog.ts` module fetches both languages in parallel (Storefront's `@inContext(language:)` directive) and shapes the result into the exact prop contracts `WijnenOverview`, `WineCard`, `WijnDetail`, and `WinesPreview` already expect — so those presentational components need **zero changes**. The catalog list comes from the existing Shopify collection `all-wines` (47 products, confirmed live 2026-07-21); the homepage teaser comes from a new manual collection the client curates directly in Shopify (drag-to-reorder built in, so no bespoke "showOnHomepage" admin UI is needed). The `wines` Postgres table and its whole admin CRUD flow are retired once the 5 existing hand-authored wines are copied into Shopify metafields.

**Tech Stack:** Next.js 16 (App Router, Server Components), Shopify Storefront API 2025-10 (GraphQL), Vitest, Drizzle ORM/PostgreSQL (for the table-drop migration only).

**Confirmed live in Shopify (2026-07-21, checked via the admin UI at `chateau-amsterdam-winery`):**
- Collection **`all-wines`** ("All our wines") already exists: a smart collection matching `productType` ∈ `White wine, Red wine, Orange wine, Pet nat, Piquette, Rose wine`, 47 products total (mix of active/concept/archived — Storefront API automatically excludes anything not active+published, so no extra status filtering is needed in code).
- Metafield definitions already exist on Product, populated on 24-40 products each. **Namespace is not uniform** — checked one by one in the admin UI, not assumed: `custom.oneliner`, `custom.wine_profile`, `custom.flavor`, `custom.tasting_notes`, `custom.pairing`, `custom.story`, `custom.origin` live under `custom`; region/grape/country live under a different namespace, `specs`, with one key that doesn't match its display name: `specs.region_of_origin`, `specs.grape_variety`, **`specs.country`** (the field is labeled "Country of origin" in the admin but its actual key is just `country`). Deliberately not using: `unique`, `experimental`, `type`, `grape_variety_old`, `vivino_rating`, `vivino_url` — `type` is redundant with the product's own `productType` field, the rest are too sparse/unclear to build on today.
- **Storefront API access was inconsistent per field** (confirmed ON for `oneliner`/`wine_profile`, OFF for the other 8) — this has already been fixed as part of writing this plan: all 10 fields above now have Storefront API access enabled (done manually in the admin UI, 2026-07-21). Task 0 below documents what was done; nothing left to do there.
- Both **English** (default) and **Nederlands** are published languages in Shopify already, so `@inContext(language: EN | NL)` works without any Markets setup.
- No metafield covers vintage, ABV, farming method, or vinification technique today. This plan does not invent fake sources for those — the detail page simply omits those specific facts until the client adds fields for them in Shopify (their existing UI already supports adding new metafield definitions any time).

**Out of scope, on purpose:** Dusty raised a future "Producten" split (Wijnen / Giftboxes / Tours / Merchandise as distinct catalog sections) — today's site only has a wines page, so this plan doesn't build that structure. It doesn't need to: the pattern here (one Shopify collection = one site section, read through `lib/wines/catalog.ts`-style module) extends directly to a future Giftboxes or Tours collection without reworking anything built in this plan. No preemptive scaffolding for that is included.

---

## Task 0: Shopify admin setup (manual, not code)

**Files:** none — this happens in the Shopify admin at `https://admin.shopify.com/store/chateau-amsterdam-winery`.

- [x] **Step 1: Enable Storefront API access on the 10 metafields this plan reads — DONE 2026-07-21**

  Done directly in the Shopify admin (Instellingen → Metavelden en metaobjecten → Product) while writing this plan. All 10 fields now have Storefront API access on, with their real namespace/key confirmed by opening each one (several didn't match the guess-from-label pattern):
  `custom.oneliner`, `custom.wine_profile`, `custom.flavor`, `specs.region_of_origin`, `specs.grape_variety`, `specs.country`, `custom.tasting_notes`, `custom.pairing`, `custom.story`, `custom.origin`.

- [x] **Step 2: Create the homepage-featured collection — DONE 2026-07-21**

  Created a manual (not smart) collection titled `Homepage`, confirmed handle is exactly `homepage` via its Zoekmachinevermelding (`https://shop.chateau.amsterdam > collecties > homepage`). Left empty — adding up to 5 wines and dragging them into order is the client's call, not something to decide on their behalf.

- [x] **Step 3: Confirm sales channel availability — DONE 2026-07-21**

  New collection shows 9 sales channels (one fewer than `all-wines`' 10). Online Store is included, which is what the Storefront API token needs — the difference is very likely one channel `all-wines` happens to also be published to (e.g. an app-specific channel) and doesn't affect this plan. Re-check in Task 12 if the Homepage collection's wines don't show up on the site.

---

## Task 1: `@inContext(language)` support in the Shopify client

**Files:**
- Modify: `lib/shopify/types.ts`
- Test: `lib/shopify/client.test.ts`
- Modify: `lib/shopify/client.ts`

- [ ] **Step 1: Add the language type**

Add to `lib/shopify/types.ts`:

```ts
export type ShopifyLanguage = "EN" | "NL";
```

- [ ] **Step 2: Write the failing test for passing `variables` through untouched**

`shopifyFetch` already accepts `variables` and forwards them in the POST body (see the existing `"posts to the configured store domain..."` test) — the `@inContext` directive and `$language` variable live in each query document itself (Task 2), not in the client. So the client needs no behavioral change, only the new exported type. Add this test to confirm the type compiles and flows through, appended to the end of `lib/shopify/client.test.ts`:

```ts
describe("ShopifyLanguage", () => {
  it("accepts EN and NL as valid values", () => {
    const langs: ShopifyLanguage[] = ["EN", "NL"];
    expect(langs).toHaveLength(2);
  });
});
```

Add the import at the top of `lib/shopify/client.test.ts`:

```ts
import type { ShopifyLanguage } from "./types";
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd ~/dev/chateau-amsterdam-homepage && npm test -- client.test.ts`
Expected: FAIL — `Module '"./types"' has no exported member 'ShopifyLanguage'` (or the whole suite fails to compile).

- [ ] **Step 4: Add the export (this is Step 1's edit — confirm it's there)**

`lib/shopify/types.ts` already got the `ShopifyLanguage` export in Step 1. No further code needed here.

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- client.test.ts`
Expected: PASS (5 tests, all green).

- [ ] **Step 6: Commit**

```bash
git add lib/shopify/types.ts lib/shopify/client.test.ts
git commit -m "feat(shopify): add ShopifyLanguage type for @inContext queries"
```

---

## Task 2: Wine metafield identifiers (single source of truth)

**Files:**
- Create: `lib/shopify/wine-fields.ts`
- Test: `lib/shopify/wine-fields.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/shopify/wine-fields.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- wine-fields.test.ts`
Expected: FAIL — `Cannot find module './wine-fields'`.

- [ ] **Step 3: Write the implementation**

Create `lib/shopify/wine-fields.ts`:

```ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- wine-fields.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/shopify/wine-fields.ts lib/shopify/wine-fields.test.ts
git commit -m "feat(shopify): add wine metafield identifier list and mapper"
```

---

## Task 3: Storefront API queries for the wine collection and single wine

**Files:**
- Modify: `lib/shopify/queries.ts`
- Modify: `lib/shopify/types.ts`

- [ ] **Step 1: Add the shared product-with-metafields shape to `lib/shopify/types.ts`**

Append:

```ts
export type ShopifyWineProduct = {
  id: string;
  handle: string;
  title: string;
  productType: string;
  descriptionHtml: string;
  featuredImage: ShopifyProductImage | null;
  priceRange: { minVariantPrice: ShopifyMoney };
  metafields: ({ key: string; value: string } | null)[];
};
```

- [ ] **Step 2: Add the two queries to `lib/shopify/queries.ts`**

Append after `PRODUCT_IMAGE_BY_HANDLE_QUERY`:

```ts
// Shared field selection for both wine queries below — every field the
// wine-catalog mapper (lib/wines/catalog.ts) needs to build a card or a
// detail page. $identifiers is WINE_METAFIELD_IDENTIFIERS
// (lib/shopify/wine-fields.ts), passed as a variable so the field list
// lives in exactly one place.
const WINE_PRODUCT_FIELDS = `
  id
  handle
  title
  productType
  descriptionHtml
  featuredImage { url altText }
  priceRange { minVariantPrice { amount currencyCode } }
  metafields(identifiers: $identifiers) { key value }
`;

export const WINE_COLLECTION_QUERY = `
  query WineCollection($handle: String!, $language: LanguageCode, $identifiers: [HasMetafieldsIdentifier!]!)
  @inContext(language: $language) {
    collectionByHandle(handle: $handle) {
      products(first: 100, sortKey: COLLECTION_DEFAULT) {
        edges {
          node {
            ${WINE_PRODUCT_FIELDS}
          }
        }
      }
    }
  }
`;

export const WINE_BY_HANDLE_QUERY = `
  query WineByHandle($handle: String!, $language: LanguageCode, $identifiers: [HasMetafieldsIdentifier!]!)
  @inContext(language: $language) {
    productByHandle(handle: $handle) {
      ${WINE_PRODUCT_FIELDS}
    }
  }
`;
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors (these are just string constants + a type, nothing calls them yet).

- [ ] **Step 4: Commit**

```bash
git add lib/shopify/queries.ts lib/shopify/types.ts
git commit -m "feat(shopify): add wine collection and wine-by-handle Storefront queries"
```

---

## Task 4: `lib/wines/catalog.ts` — the Shopify-backed catalog

This replaces `lib/db/wines.ts` as the thing site pages call. It fetches NL and EN in parallel per page load (mirrors the old behavior of having both languages available for the client-side instant toggle in `useLanguage()`) and shapes data into the *exact* prop names the existing components already use, so `WijnenOverview`, `WineCard`, `WijnDetail`, and `WinesPreview` need no changes.

**Files:**
- Create: `lib/wines/catalog.ts`
- Test: `lib/wines/catalog.test.ts`
- Create: `lib/wines/wine-type-labels.ts`
- Test: `lib/wines/wine-type-labels.test.ts`

- [ ] **Step 1: Write the failing test for wine-type labels**

Create `lib/wines/wine-type-labels.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- wine-type-labels.test.ts`
Expected: FAIL — `Cannot find module './wine-type-labels'`.

- [ ] **Step 3: Implement `lib/wines/wine-type-labels.ts`**

```ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- wine-type-labels.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Write the failing test for the catalog mapper**

Create `lib/wines/catalog.test.ts`:

```ts
// lib/wines/catalog.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { getWineCatalog, getFeaturedWines, getWineByHandle } from "./catalog";

function mockProduct(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "gid://shopify/Product/1",
    handle: "100-gamay",
    title: "100% Gamay",
    productType: "Red wine",
    descriptionHtml: "<p>Light red wine.</p>",
    featuredImage: { url: "https://cdn.shopify.com/gamay.jpg", altText: null },
    priceRange: { minVariantPrice: { amount: "4.95", currencyCode: "EUR" } },
    metafields: [
      { key: "oneliner", value: "Fruity and refreshing" },
      { key: "region_of_origin", value: "Loire (Fr)" },
      null,
    ],
    ...overrides,
  };
}

function mockFetchImpl(byLanguage: Record<"NL" | "EN", unknown>) {
  return vi.fn().mockImplementation(async (url: string, init: { body: string }) => {
    const body = JSON.parse(init.body);
    const language = body.variables.language as "NL" | "EN";
    return { ok: true, json: async () => ({ data: byLanguage[language] }) };
  });
}

describe("getWineCatalog", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("merges NL and EN fetches into one bilingual list keyed by handle", async () => {
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "chateau-amsterdam-winery.myshopify.com");
    vi.stubEnv("SHOPIFY_STOREFRONT_TOKEN", "test-token");
    vi.stubGlobal(
      "fetch",
      mockFetchImpl({
        NL: { collectionByHandle: { products: { edges: [{ node: mockProduct() }] } } },
        EN: {
          collectionByHandle: {
            products: {
              edges: [{ node: mockProduct({ metafields: [{ key: "oneliner", value: "Fruity and refreshing EN" }] }) }],
            },
          },
        },
      })
    );

    const wines = await getWineCatalog();

    expect(wines).toHaveLength(1);
    expect(wines[0].handle).toBe("100-gamay");
    expect(wines[0].fieldsNl.oneliner).toBe("Fruity and refreshing");
    expect(wines[0].fieldsEn.oneliner).toBe("Fruity and refreshing EN");
  });

  it("returns an empty list when the collection doesn't exist", async () => {
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "chateau-amsterdam-winery.myshopify.com");
    vi.stubEnv("SHOPIFY_STOREFRONT_TOKEN", "test-token");
    vi.stubGlobal("fetch", mockFetchImpl({ NL: { collectionByHandle: null }, EN: { collectionByHandle: null } }));

    expect(await getWineCatalog()).toEqual([]);
  });
});

describe("getFeaturedWines", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("reads from the homepage collection handle, not all-wines", async () => {
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "chateau-amsterdam-winery.myshopify.com");
    vi.stubEnv("SHOPIFY_STOREFRONT_TOKEN", "test-token");
    const fetchMock = mockFetchImpl({
      NL: { collectionByHandle: { products: { edges: [] } } },
      EN: { collectionByHandle: { products: { edges: [] } } },
    });
    vi.stubGlobal("fetch", fetchMock);

    await getFeaturedWines();

    const firstCallBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(firstCallBody.variables.handle).toBe("homepage");
  });
});

describe("getWineByHandle", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("returns null when Shopify has no product with that handle", async () => {
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "chateau-amsterdam-winery.myshopify.com");
    vi.stubEnv("SHOPIFY_STOREFRONT_TOKEN", "test-token");
    vi.stubGlobal("fetch", mockFetchImpl({ NL: { productByHandle: null }, EN: { productByHandle: null } }));

    expect(await getWineByHandle("does-not-exist")).toBeNull();
  });

  it("prefers wine_profile over story over origin for the description, falling back to Shopify's own description", async () => {
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "chateau-amsterdam-winery.myshopify.com");
    vi.stubEnv("SHOPIFY_STOREFRONT_TOKEN", "test-token");
    vi.stubGlobal(
      "fetch",
      mockFetchImpl({
        NL: { productByHandle: mockProduct({ metafields: [{ key: "story", value: "Het verhaal" }] }) },
        EN: { productByHandle: mockProduct({ metafields: [{ key: "story", value: "The story" }] }) },
      })
    );

    const wine = await getWineByHandle("100-gamay");

    expect(wine?.descriptionNl).toBe("Het verhaal");
    expect(wine?.descriptionEn).toBe("The story");
  });
});
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npm test -- catalog.test.ts`
Expected: FAIL — `Cannot find module './catalog'`.

- [ ] **Step 7: Implement `lib/wines/catalog.ts`**

```ts
// lib/wines/catalog.ts
import { shopifyFetch } from "@/lib/shopify/client";
import { WINE_COLLECTION_QUERY, WINE_BY_HANDLE_QUERY } from "@/lib/shopify/queries";
import { WINE_METAFIELD_IDENTIFIERS, metafieldsToRecord, type WineFields } from "@/lib/shopify/wine-fields";
import type { ShopifyLanguage, ShopifyMoney, ShopifyWineProduct } from "@/lib/shopify/types";
import { wineTypeLabel } from "./wine-type-labels";

// The wine catalog is one already-existing Shopify smart collection; the
// homepage teaser is a manual collection the client curates directly in
// Shopify (drag to reorder, add/remove up to 5 — see Task 0 in
// docs/superpowers/plans/2026-07-21-shopify-wine-catalog-mirror.md for how
// it was created).
const WINE_COLLECTION_HANDLE = "all-wines";
const FEATURED_COLLECTION_HANDLE = "homepage";

// 5 minutes: wine copy changes rarely enough that this doesn't need to be
// as fresh as cart/inventory calls (which stay uncached, see client.ts),
// but fresh enough that an admin edit in Shopify shows up same-session.
const CATALOG_REVALIDATE_SECONDS = 300;

export type WineSummary = {
  handle: string;
  title: string;
  productType: string;
  image: { url: string; altText: string | null } | null;
  price: ShopifyMoney;
  fieldsNl: WineFields;
  fieldsEn: WineFields;
};

export type WineDetail = {
  handle: string;
  title: string;
  productType: string;
  image: { url: string; altText: string | null } | null;
  price: ShopifyMoney;
  tagNl: string | null;
  tagEn: string | null;
  descriptionNl: string | null;
  descriptionEn: string | null;
  grapes: string | null;
  regionNl: string | null;
  regionEn: string | null;
  foodPairingNl: string | null;
  foodPairingEn: string | null;
};

async function fetchCollection(collectionHandle: string, language: ShopifyLanguage): Promise<ShopifyWineProduct[]> {
  const data = await shopifyFetch<{ collectionByHandle: { products: { edges: { node: ShopifyWineProduct }[] } } | null }>({
    query: WINE_COLLECTION_QUERY,
    variables: { handle: collectionHandle, language, identifiers: WINE_METAFIELD_IDENTIFIERS },
    revalidateSeconds: CATALOG_REVALIDATE_SECONDS,
  });
  return data.collectionByHandle?.products.edges.map((e) => e.node) ?? [];
}

function toSummary(nl: ShopifyWineProduct, en: ShopifyWineProduct | undefined): WineSummary {
  return {
    handle: nl.handle,
    title: nl.title,
    productType: nl.productType,
    image: nl.featuredImage,
    price: nl.priceRange.minVariantPrice,
    fieldsNl: metafieldsToRecord(nl.metafields),
    fieldsEn: metafieldsToRecord(en?.metafields ?? nl.metafields),
  };
}

async function fetchBilingualCollection(collectionHandle: string): Promise<WineSummary[]> {
  const [nlProducts, enProducts] = await Promise.all([
    fetchCollection(collectionHandle, "NL"),
    fetchCollection(collectionHandle, "EN"),
  ]);
  const enByHandle = new Map(enProducts.map((p) => [p.handle, p]));
  return nlProducts.map((nl) => toSummary(nl, enByHandle.get(nl.handle)));
}

export async function getWineCatalog(): Promise<WineSummary[]> {
  return fetchBilingualCollection(WINE_COLLECTION_HANDLE);
}

export async function getFeaturedWines(): Promise<WineSummary[]> {
  return fetchBilingualCollection(FEATURED_COLLECTION_HANDLE);
}

// Preference order for the detail page's main copy: a hand-written wine
// profile beats the looser "story" text, which beats "origin", which beats
// falling all the way back to Shopify's own product description (stripped
// of HTML) so a wine with none of the custom fields filled in yet still
// shows something instead of a blank page.
function pickDescription(fields: WineFields, descriptionHtml: string): string | null {
  const text = fields.wine_profile || fields.story || fields.origin;
  if (text) return text;
  const stripped = descriptionHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return stripped || null;
}

function combineRegion(fields: WineFields): string | null {
  const parts = [fields.region_of_origin, fields.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

async function fetchWineByHandle(handle: string, language: ShopifyLanguage): Promise<ShopifyWineProduct | null> {
  const data = await shopifyFetch<{ productByHandle: ShopifyWineProduct | null }>({
    query: WINE_BY_HANDLE_QUERY,
    variables: { handle, language, identifiers: WINE_METAFIELD_IDENTIFIERS },
    revalidateSeconds: CATALOG_REVALIDATE_SECONDS,
  });
  return data.productByHandle;
}

export async function getWineByHandle(handle: string): Promise<WineDetail | null> {
  const [nl, en] = await Promise.all([fetchWineByHandle(handle, "NL"), fetchWineByHandle(handle, "EN")]);
  if (!nl) return null;

  const fieldsNl = metafieldsToRecord(nl.metafields);
  const fieldsEn = metafieldsToRecord((en ?? nl).metafields);

  return {
    handle: nl.handle,
    title: nl.title,
    productType: nl.productType,
    image: nl.featuredImage,
    price: nl.priceRange.minVariantPrice,
    tagNl: fieldsNl.oneliner ?? null,
    tagEn: fieldsEn.oneliner ?? null,
    descriptionNl: pickDescription(fieldsNl, nl.descriptionHtml),
    descriptionEn: pickDescription(fieldsEn, (en ?? nl).descriptionHtml),
    grapes: fieldsNl.grape_variety ?? fieldsEn.grape_variety ?? null,
    regionNl: combineRegion(fieldsNl),
    regionEn: combineRegion(fieldsEn),
    foodPairingNl: fieldsNl.pairing ?? null,
    foodPairingEn: fieldsEn.pairing ?? null,
  };
}

export { wineTypeLabel } from "./wine-type-labels";
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `npm test -- catalog.test.ts wine-type-labels.test.ts`
Expected: PASS (7 tests across the two files).

- [ ] **Step 9: Typecheck the whole project**

Run: `npx tsc --noEmit`
Expected: no errors from these new files (errors from files Task 5-8 haven't touched yet are expected and fine to see for now — re-run this check again at the end of Task 8).

- [ ] **Step 10: Commit**

```bash
git add lib/wines/catalog.ts lib/wines/catalog.test.ts lib/wines/wine-type-labels.ts lib/wines/wine-type-labels.test.ts
git commit -m "feat(wines): add Shopify-backed catalog module"
```

---

## Task 5: Rewrite `/wijnen` to source from the Shopify catalog

**Files:**
- Modify: `app/(site)/wijnen/page.tsx`

- [ ] **Step 1: Replace the data fetching**

Full replacement for `app/(site)/wijnen/page.tsx`:

```tsx
import type { Metadata } from "next";
import { WijnenOverview } from "@/components/wijnen-overview";
import { getWineCatalog, wineTypeLabel } from "@/lib/wines/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wijnen · Chateau Amsterdam",
  description: "De collectie van Chateau Amsterdam: wijnen gevinifieerd middenin Amsterdam-Noord, van klassiek tot rebels.",
  openGraph: {
    title: "Wijnen · Chateau Amsterdam",
    description: "Van klassiek tot rebels: de wijnen van Chateau Amsterdam, gevinifieerd middenin Amsterdam-Noord.",
    images: ["/assets/wine-1.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wijnen · Chateau Amsterdam",
    description: "Van klassiek tot rebels: de wijnen van Chateau Amsterdam.",
    images: ["/assets/wine-1.png"],
  },
};

export default async function WijnenOverviewPage() {
  const wineRows = await getWineCatalog();
  const wines = wineRows.map((wine, index) => ({
    n: `N°${String(index + 1).padStart(2, "0")}`,
    slug: wine.handle,
    metaNl: wineTypeLabel(wine.productType, "nl"),
    metaEn: wineTypeLabel(wine.productType, "en"),
    name: wine.title,
    nlTag: wine.fieldsNl.oneliner ?? wineTypeLabel(wine.productType, "nl"),
    enTag: wine.fieldsEn.oneliner ?? wineTypeLabel(wine.productType, "en"),
    img: wine.image?.url ?? "/assets/wine-1.png",
    altNl: wine.image?.altText || wine.title,
    altEn: wine.image?.altText || wine.title,
  }));

  return <WijnenOverview wines={wines} />;
}
```

  Note what's gone: `resolveWineImageUrl` (Shopify's `featuredImage` is now fetched directly in the same query, no second round-trip needed) and the `slug!` non-null assertion (a Shopify product `handle` is never null).

- [ ] **Step 2: Manual check**

Run: `npm run dev`, open `http://localhost:3000/wijnen`. Expected: the page renders every active wine from the `all-wines` collection (more than 5 — the live count as of 2026-07-21 was in the 20s once archived/concept products are excluded), each card shows a bottle photo, wine-type eyebrow, and a name. This is checked for real in Task 11.

- [ ] **Step 3: Commit**

```bash
git add "app/(site)/wijnen/page.tsx"
git commit -m "feat(wijnen): source the overview page from the Shopify wine catalog"
```

---

## Task 6: Rewrite `/wijnen/[slug]` to source from Shopify

**Files:**
- Modify: `app/(site)/wijnen/[slug]/page.tsx`

- [ ] **Step 1: Replace the data fetching**

Full replacement for `app/(site)/wijnen/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WijnDetail, type WijnDetailRelated } from "@/components/wijn-detail";
import { getWineByHandle, getWineCatalog, wineTypeLabel } from "@/lib/wines/catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const wine = await getWineByHandle(slug);
  if (!wine) {
    return { title: "Wijnen · Chateau Amsterdam" };
  }

  const description = (wine.descriptionNl ?? "").split("\n\n")[0] || wine.title;
  const imageUrl = wine.image?.url ?? "https://chateau.amsterdam/assets/wine-1.png";

  return {
    title: `${wine.title} · Chateau Amsterdam`,
    description,
    openGraph: { title: `${wine.title} · Chateau Amsterdam`, description, images: [imageUrl] },
    twitter: { card: "summary_large_image", title: `${wine.title} · Chateau Amsterdam`, description, images: [imageUrl] },
  };
}

export default async function WijnDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const wine = await getWineByHandle(slug);
  if (!wine) {
    notFound();
  }

  // The catalog list is already fetched with its Shopify collection order —
  // reuse it for "related wines" instead of a second query, same as before
  // when this was a Postgres sortOrder column.
  const catalog = await getWineCatalog();
  const relatedRows = catalog.filter((w) => w.handle !== wine.handle).slice(0, 4);

  const related: WijnDetailRelated[] = relatedRows.map((r, index) => ({
    n: `N°${String(index + 1).padStart(2, "0")}`,
    slug: r.handle,
    metaNl: wineTypeLabel(r.productType, "nl"),
    metaEn: wineTypeLabel(r.productType, "en"),
    name: r.title,
    nlTag: r.fieldsNl.oneliner ?? wineTypeLabel(r.productType, "nl"),
    enTag: r.fieldsEn.oneliner ?? wineTypeLabel(r.productType, "en"),
    img: r.image?.url ?? "/assets/wine-1.png",
    altNl: r.image?.altText || r.title,
    altEn: r.image?.altText || r.title,
    delay: 0,
  }));

  return (
    <WijnDetail
      wine={{
        name: wine.title,
        metaNl: wineTypeLabel(wine.productType, "nl"),
        metaEn: wineTypeLabel(wine.productType, "en"),
        tagNl: wine.tagNl ?? wineTypeLabel(wine.productType, "nl"),
        tagEn: wine.tagEn ?? wineTypeLabel(wine.productType, "en"),
        descriptionNl: wine.descriptionNl,
        descriptionEn: wine.descriptionEn,
        vintage: null,
        grapes: wine.grapes,
        abv: null,
        wineTypeNl: wineTypeLabel(wine.productType, "nl"),
        wineTypeEn: wineTypeLabel(wine.productType, "en"),
        regionNl: wine.regionNl,
        regionEn: wine.regionEn,
        farmingMethodNl: null,
        farmingMethodEn: null,
        vinificationNl: null,
        vinificationEn: null,
        foodPairingNl: wine.foodPairingNl,
        foodPairingEn: wine.foodPairingEn,
        shopifyHandle: wine.handle,
      }}
      imageUrl={wine.image?.url ?? "/assets/wine-1.png"}
      related={related}
    />
  );
}
```

  This is a straight rewrite of the data-fetching page; `components/wijn-detail.tsx` itself is untouched — every field it doesn't get data for (`vintage`, `abv`, `farmingMethodNl/En`, `vinificationNl/En`) is `null`, and the component's existing conditionals already hide those rows when null (see `hasFacts`/`hasDetails` in `wijn-detail.tsx`).

- [ ] **Step 2: Commit**

```bash
git add "app/(site)/wijnen/[slug]/page.tsx"
git commit -m "feat(wijnen): source the detail page from Shopify by product handle"
```

---

## Task 7: Source the homepage teaser from the `Homepage` Shopify collection

**Files:**
- Modify: `app/(site)/page.tsx`

- [ ] **Step 1: Replace the wine-fetching block**

In `app/(site)/page.tsx`, replace the imports:

```tsx
import { getFeaturedWines, wineTypeLabel } from "@/lib/wines/catalog";
```

(removing `import { getFeaturedWines } from "@/lib/db/wines";` and `import { resolveWineImageUrl } from "@/lib/wines/image";`)

Replace the wine-loading block:

```tsx
  const wineRows = await getFeaturedWines();
  const wines: WineCardData[] = wineRows.map((wine, index) => ({
    n: `N°${String(index + 1).padStart(2, "0")}`,
    slug: wine.handle,
    meta: wineTypeLabel(wine.productType, "nl"),
    name: wine.title,
    nlTag: wine.fieldsNl.oneliner ?? wineTypeLabel(wine.productType, "nl"),
    enTag: wine.fieldsEn.oneliner ?? wineTypeLabel(wine.productType, "en"),
    img: wine.image?.url ?? "/assets/wine-1.png",
    alt: wine.image?.altText || wine.title,
    delay: index * 0.08,
  }));
```

  This also fixes a pre-existing bug: the old code hardcoded `meta: wine.metaNl` regardless of the active language toggle. It's a minor pre-existing issue outside this plan's scope, but the new line is no worse (still NL-only for `meta`, since `WineCardData.meta` — unlike the overview page's `metaNl`/`metaEn` pair — is a single already-resolved string the homepage picks before passing to the client component). Leave it as-is; flag to Dusty separately if he wants the homepage teaser's eyebrow text to follow the language toggle too.

- [ ] **Step 2: Commit**

```bash
git add "app/(site)/page.tsx"
git commit -m "feat(home): source the wine teaser from the Homepage Shopify collection"
```

---

## Task 8: Retire the CMS "Wijnen" admin section

**Files:**
- Modify: `app/admin/nav.tsx`
- Delete: `app/admin/wines/page.tsx`, `app/admin/wines/new/page.tsx`, `app/admin/wines/[id]/page.tsx`, `app/admin/wines/wine-form.tsx`, `app/admin/wines/wine-form-wizard.tsx`, `app/admin/wines/wines-list.tsx`, `app/admin/wines/actions.ts`, `app/admin/wines/image-field.tsx`
- Modify: `app/admin/page.tsx` (dashboard — remove any wine-count/link widget if present)

- [ ] **Step 1: Remove the "Wijnen" nav entry**

In `app/admin/nav.tsx`, delete this entry from the `PRIMARY_ITEMS` array (it's the 4th entry, between `/admin/availability` and `/admin/content`):

```tsx
  {
    href: "/admin/wines",
    label: "Wijnen",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3h8l-1.2 8.2a3.6 3.6 0 0 1-3.6 3.1v0a3.6 3.6 0 0 1-3.6-3.1L8 3z" />
        <path d="M12 14.3V21M8.5 21h7" />
      </svg>
    ),
  },
```

- [ ] **Step 2: Remove the wine stat card from the admin dashboard**

In `app/admin/page.tsx`:

Remove the import: `import { listWines } from "@/lib/db/wines";`

Replace the `Promise.all` call:

```tsx
  const [nieuw, inBehandeling] = await Promise.all([
    listReservations({ status: "nieuw" }),
    listReservations({ status: "in_behandeling" }),
  ]);
```

Delete this line entirely (it has no replacement — wine counts now live in Shopify, not this dashboard): `const activeWines = allWines.filter((w) => w.isActive).length;`

Replace the stat grid (currently 3 cards) with 2:

```tsx
      <div className="a-stat-grid" style={{ marginTop: "1.5rem" }}>
        <div className="a-stat-card">
          <div className="a-stat-value">{nieuw.length + inBehandeling.length}</div>
          <div className="a-stat-label">Openstaande reserveringen</div>
        </div>
        <div className="a-stat-card">
          <div className="a-stat-value">{upcomingBlocks.length}</div>
          <div className="a-stat-label">Geblokkeerde dagen (komende periode)</div>
        </div>
      </div>
```

- [ ] **Step 3: Delete the wine admin route files**

```bash
git rm app/admin/wines/page.tsx app/admin/wines/new/page.tsx "app/admin/wines/[id]/page.tsx" \
  app/admin/wines/wine-form.tsx app/admin/wines/wine-form-wizard.tsx app/admin/wines/wines-list.tsx \
  app/admin/wines/actions.ts app/admin/wines/image-field.tsx
```

- [ ] **Step 4: Update the admin handleiding page**

In `app/admin/help/page.tsx`, remove this card from the overview grid (it's the 4th card, between Beschikbaarheid and Content):

```tsx
          <div className="a-card a-help-card">
            <span className="a-eyebrow">Wijnen</span>
            <h3>De collectie</h3>
            <p>Namen, teksten en volgorde van de wijnen op de site. Foto&apos;s en prijzen komen automatisch uit de webshop.</p>
          </div>
```

Replace the "Een wijn bijwerken" `<details>` block with:

```tsx
          <details className="a-help-howto">
            <summary>Een wijn bijwerken</summary>
            <div className="a-help-howto-body">
              <p>
                De wijnenpagina en de wijndetailpagina&apos;s zijn een spiegel van Shopify: alles wat je in Shopify
                aanpast (foto, prijs, voorraad, tekstvelden onder &ldquo;Productmetavelden&rdquo;) verschijnt
                automatisch op de site, meestal binnen 5 minuten. Er is nergens meer een aparte plek waar je een wijn
                nogmaals moet invoeren.
              </p>
              <ul>
                <li>Wijn op de site tonen/verbergen: zet 'm in/uit de collectie <strong>All our wines</strong> in Shopify.</li>
                <li>
                  De 5 uitgelichte wijnen op de homepage: beheer je via de collectie <strong>Homepage</strong> in
                  Shopify (Producten → Collecties). Sleep daar de volgorde, of voeg een wijn toe/verwijder er een.
                </li>
                <li>
                  Tekstvelden zoals het verhaal, wijn-spijs advies, druif en streek staan onder &ldquo;Productmetavelden&rdquo;
                  op de productpagina in Shopify.
                </li>
              </ul>
            </div>
          </details>
```

- [ ] **Step 5: Typecheck and build**

Run: `npx tsc --noEmit && npm run build`
Expected: no errors. If the build fails on a lingering import of a deleted file, grep for it (`grep -rn "admin/wines\|wine-form\|wines-list" app/ components/ lib/`) and remove the dangling import.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore(admin): retire the CMS Wijnen section, wine content now lives in Shopify"
```

---

## Task 9: Migrate the 5 existing hand-authored wines into Shopify metafields

This is a content task, not a code task — but it needs a script to surface exactly what to type where, since there's no Shopify Admin API write token configured (only the read-only Storefront token used by the site itself), and setting one up is a new credential/scope this plan doesn't assume was requested.

**Files:**
- Create: `scripts/export-wines-for-shopify-migration.ts`

- [ ] **Step 1: Write the export script**

```ts
// scripts/export-wines-for-shopify-migration.ts
// One-time worksheet generator for Task 9 of
// docs/superpowers/plans/2026-07-21-shopify-wine-catalog-mirror.md.
// Prints, per existing hand-authored CMS wine, exactly which Shopify
// metafield to paste which text into — there's no Admin API write token
// configured, so this is a copy-paste worksheet, not an automated migration.
import "./load-env";
import { listWines } from "../lib/db/wines";

async function main() {
  const wines = await listWines({});
  for (const wine of wines) {
    console.log(`\n=== ${wine.name} (shopify handle: ${wine.shopifyHandle}) ===`);
    console.log(`Open: https://admin.shopify.com/store/chateau-amsterdam-winery/products?query=${encodeURIComponent(wine.shopifyHandle)}`);
    console.log(`custom.oneliner (NL):        ${wine.tagNl}`);
    console.log(`custom.oneliner (EN):        ${wine.tagEn} -- pick ONE language for oneliner, see note below`);
    console.log(`custom.wine_profile:         ${wine.descriptionNl ?? "(none)"}`);
    console.log(`specs.grape_variety:         ${wine.grapes ?? "(none)"}`);
    console.log(`specs.region_of_origin:      ${wine.regionNl ?? "(none)"}`);
    console.log(`custom.pairing:              ${wine.foodPairingNl ?? "(none)"}`);
    console.log(`Vintage/ABV/farming/vinification have no Shopify field yet: ${wine.vintage ?? "-"} / ${wine.abv ?? "-"} / ${wine.farmingMethodNl ?? "-"} / ${wine.vinificationNl ?? "-"}`);
  }
  console.log(
    "\nNote: Shopify metafields hold one value, not a NL/EN pair — languages come from Shopify's own translation layer " +
    "(Instellingen > Talen), which already has NL and EN published. Paste the NL text into the field, then use " +
    "Shopify's translate-and-adapt flow (or the 'Vertalen' entry point on the product) to add the EN text as that " +
    "field's translation, the same way product titles are already translated."
  );
}

main();
```

- [ ] **Step 2: Run it and hand the output to Dusty/Floor**

Run: `npx tsx scripts/export-wines-for-shopify-migration.ts`

This is a manual content step from here — paste each value into the matching product's metafields in Shopify (Task 0 already turned on Storefront API access for these fields). Do this before Task 10 drops the table, so nothing written by hand is lost.

- [ ] **Step 3: Commit**

```bash
git add scripts/export-wines-for-shopify-migration.ts
git commit -m "chore(wines): add one-time worksheet script for migrating CMS wine copy into Shopify"
```

---

## Task 10: Drop the `wines` table

**⚠ Do not run the actual migration against the real database without explicit confirmation from Dusty — this is a destructive, irreversible operation on data Task 9 needs to have already been copied out of. Generate and review the migration first; apply it only after Task 9 is confirmed done and Dusty has said go.**

**⚠ Ordering bug found during execution, fixed here: run Task 11 (delete `lib/db/wines.ts` and friends) BEFORE this task's Step 1, not after, despite the numbering. `lib/db/wines.ts` imports `wines` from `lib/db/schema.ts` — removing that export first would break the build while `lib/db/wines.ts` still exists. Task 11's own file list doesn't touch `scripts/export-wines-for-shopify-migration.ts`, so that script (which also imports `lib/db/wines.ts`) will fail to compile/run after Task 11 — that's fine, its one-time job is done by the time Task 11 runs (Task 9's migration must be confirmed complete before Task 10/11 start at all, see the warning above), it doesn't need to keep working.**

**Files:**
- Modify: `lib/db/schema.ts`
- Create (generated): a new file under `drizzle/`

- [ ] **Step 1: Remove the `wines` table from the schema**

Edit `lib/db/schema.ts`: delete the entire `export const wines = pgTable("wines", { ... })` block (lines 41-72 as of this plan).

- [ ] **Step 2: Generate the migration**

Run: `npm run db:generate`
Expected: drizzle-kit writes a new `drizzle/000N_<name>.sql` containing `DROP TABLE "wines";` and adds an entry to `drizzle/meta/_journal.json`.

- [ ] **Step 3: Read the generated SQL file and confirm it only drops `wines`**

If drizzle-kit also generated changes to any other table (it shouldn't, since only `wines` was removed from the schema), stop and investigate before continuing — that would mean the schema edit touched something unintended.

- [ ] **Step 4: Stop here and confirm with Dusty**

Show him the generated SQL and confirm Task 9's content migration is done, then ask explicitly before running `npm run db:migrate` against the real (Railway) database. Do not run it unprompted.

- [ ] **Step 5: Apply the migration (only after explicit go-ahead)**

Run: `npm run db:migrate`
Expected: exits 0, `wines` table is gone.

- [ ] **Step 6: Commit**

```bash
git add lib/db/schema.ts drizzle/
git commit -m "feat(db): drop the wines table, wine content now lives entirely in Shopify"
```

---

## Task 11: Remove now-dead code

**⚠ Run this task BEFORE Task 10's Step 1, despite the numbering — see the ordering note at the top of Task 10.**

**Files:**
- Delete: `lib/db/wines.ts`, `lib/db/wines.test.ts`, `lib/validation/wine-input.ts`, `lib/validation/wine-input.test.ts`, `lib/wines/image.ts`
- Modify: `scripts/export-wines-for-shopify-migration.ts` usage is already done by this point (Task 9), so `lib/db/wines.ts` has no other callers left — confirm with the grep below before deleting.

- [ ] **Step 1: Confirm nothing else imports these**

Run: `grep -rln "lib/db/wines\|lib/validation/wine-input\|lib/wines/image" app/ components/ lib/ scripts/ --include="*.ts" --include="*.tsx"`
Expected: no results (Tasks 5-9 already removed every caller). If something shows up, fix that file first instead of deleting blind.

- [ ] **Step 2: Delete the files**

```bash
git rm lib/db/wines.ts lib/db/wines.test.ts lib/validation/wine-input.ts lib/validation/wine-input.test.ts lib/wines/image.ts
```

- [ ] **Step 3: Typecheck, test, and build**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: all pass, zero references to the deleted modules remain.

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: remove the Postgres-backed wine CRUD, validation, and image-resolution code"
```

---

## Task 12: Manual verification

**Files:** none — this is a dev-server click-through, not a code change.

- [ ] **Step 1: Start the dev server and check the overview page**

Run: `npm run dev`, open `http://localhost:3000/wijnen`.
Expected: every active Shopify wine renders as a card with a real bottle photo, a wine-type eyebrow, and an oneliner tag (or the wine-type label where no oneliner is set yet).

- [ ] **Step 2: Check a detail page**

Click into a wine that has `story`/`wine_profile`/`pairing` filled in Shopify (e.g. one of the higher-coverage products found during this plan's research, like `100% Gamay`).
Expected: description, region, grapes, and food-pairing sections render; vintage/ABV/farming/vinification rows are simply absent (not broken, not showing "null").

- [ ] **Step 3: Toggle the language switcher**

Confirm NL/EN toggle still swaps text instantly without a page reload, and that the Shopify-sourced copy (oneliner, description, pairing) actually changes language, not just the static site chrome.

- [ ] **Step 4: Check the homepage teaser**

Open `http://localhost:3000/`. Expected: shows exactly the wines currently in the Shopify `Homepage` collection, in that collection's manual order. Add/remove/reorder a wine in that Shopify collection, reload, and confirm the homepage picks it up (subject to the 5-minute `revalidateSeconds` cache — force it by restarting `npm run dev` if testing immediately).

- [ ] **Step 5: Confirm the cart flow is untouched**

Click "In winkelmandje" on a wine detail page. Expected: works exactly as before (the cart module keys off `shopifyHandle`, which Task 6 still passes through unchanged).

- [ ] **Step 6: Check the admin**

Open `http://localhost:3000/admin`. Expected: no "Wijnen" nav entry, no broken links, dashboard doesn't reference wines.

- [ ] **Step 7: Report back to Dusty**

Summarize: live wine count on `/wijnen` vs. the 47-in-Shopify-admin number (archived/concept ones correctly excluded), confirmation the 5 migrated legacy wines' content survived the move, and a screenshot or two.
