# Wijnenoverzicht en Wijndetailpagina — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a wine overview page (`/wijnen`) and a wine detail page per bottle (`/wijnen/[slug]`), reachable by clicking any wine card, backed by nine new optional CMS fields on the wine model, per `docs/superpowers/specs/2026-07-17-wine-pages-design.md`.

**Architecture:** The wines table gains a stable, auto-generated `slug` column (used for routing, never edited through the CMS) plus nine new optional content columns. A small `lib/slug.ts` helper generates collision-safe slugs at creation time only, so URLs never change under an existing wine. `components/wine-card.tsx` is extracted from `components/wines-preview.tsx` so the homepage row and the new overview grid share one card component, both wrapped in a real `next/link` to the detail page. Both new public routes are Server Components under `app/(site)/`, reusing `app/globals.css`'s existing brand tokens, `force-dynamic` (matching every other DB-backed public route, for the same Railway build-time reason `app/(site)/page.tsx` already uses it). The CMS wine form gains a fourth wizard step, "Profiel," for the new fields, all optional, all shipped empty for the client to fill in.

**Tech Stack:** Next.js 16 App Router, Drizzle ORM (node-postgres), Vitest + React Testing Library, TypeScript.

---

## File structure

```
lib/
├── slug.ts                          # new: slugify() + a unique-slug generator
├── slug.test.ts                     # new
├── db/
│   ├── schema.ts                    # modify: wines table gains slug + 9 fields
│   ├── wines.ts                     # modify: WineInput, createWine slug logic, getWineBySlug, getRelatedWines
│   └── wines.test.ts                # modify: cover the above
components/
├── wine-card.tsx                    # new: extracted from wines-preview.tsx, now a next/link
├── wines-preview.tsx                # modify: uses the extracted WineCard
app/
├── globals.css                      # modify: overview intro/grid, detail page, profile block, pairing card, breadcrumb
├── (site)/
│   ├── page.tsx                     # modify: pass slug through to WineCardData
│   └── wijnen/
│       ├── page.tsx                 # new: overview page
│       └── [slug]/
│           └── page.tsx             # new: detail page
├── admin/wines/
│   ├── wine-form-wizard.tsx         # modify: add "Profiel" step
│   ├── actions.ts                   # modify: read new fields, revalidate /wijnen
scripts/
├── backfill-wine-slugs.ts           # new: one-off, deleted after running against production
drizzle/                             # generated migration file (name assigned by drizzle-kit)
```

---

### Task 1: Slug helper

**Files:**
- Create: `lib/slug.ts`
- Test: `lib/slug.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/slug.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/slug.test.ts`
Expected: FAIL — `Cannot find module './slug'`.

- [ ] **Step 3: Write `lib/slug.ts`**

```ts
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function uniqueSlug(
  name: string,
  exists: (candidate: string) => Promise<boolean>
): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let suffix = 2;
  while (await exists(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/slug.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/slug.ts lib/slug.test.ts
git commit -m "feat: add slugify/uniqueSlug helpers for wine detail page URLs"
```

---

### Task 2: Wines schema — slug and profile fields

**Files:**
- Modify: `lib/db/schema.ts`

- [ ] **Step 1: Add the new columns to the `wines` table**

In `lib/db/schema.ts`, replace the `wines` table definition:

```ts
import { pgTable, uuid, text, timestamp, integer, boolean, pgEnum, date, uniqueIndex, real } from "drizzle-orm/pg-core";
```

(add `real` to the existing import list, everything else in that import stays the same)

```ts
export const wines = pgTable("wines", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug"),
  name: text("name").notNull(),
  metaNl: text("meta_nl").notNull(),
  metaEn: text("meta_en").notNull(),
  tagNl: text("tag_nl").notNull(),
  tagEn: text("tag_en").notNull(),
  imageId: uuid("image_id").references(() => media.id),
  shopifyHandle: text("shopify_handle").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  descriptionNl: text("description_nl"),
  descriptionEn: text("description_en"),
  grapes: text("grapes"),
  vintage: text("vintage"),
  wineTypeNl: text("wine_type_nl"),
  wineTypeEn: text("wine_type_en"),
  regionNl: text("region_nl"),
  regionEn: text("region_en"),
  farmingMethodNl: text("farming_method_nl"),
  farmingMethodEn: text("farming_method_en"),
  vinificationNl: text("vinification_nl"),
  vinificationEn: text("vinification_en"),
  abv: real("abv"),
  foodPairingNl: text("food_pairing_nl"),
  foodPairingEn: text("food_pairing_en"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  uniqueSlug: uniqueIndex("wines_slug_idx").on(table.slug),
}));
```

Note: `slug` is deliberately **not** `.notNull()` at the schema level, even though every wine is meant to have exactly one. There are already 5 real rows in production with no `slug` value, and Postgres cannot add a `NOT NULL` column without a default to a table that already has rows, that migration would fail outright. Making it nullable keeps this one migration purely additive and safe to run immediately; Task 8's backfill script fills in every existing row's slug right after, and `createWine` (Task 3) always generates one for new rows, so in practice `slug` is never actually empty by the time any page reads it. A second migration to add the `NOT NULL` constraint after backfilling would be the textbook-complete version of this, deliberately skipped here as unnecessary ceremony for a 5-row table where the application already guarantees the invariant. The unique index still works correctly on a nullable column, Postgres allows any number of `NULL` values through a unique index, it only enforces uniqueness among the non-null values.

- [ ] **Step 2: Generate the migration**

Run: `npm run db:generate`
Expected: a new file appears under `drizzle/`, e.g. `drizzle/0006_*.sql`. Open it and confirm it only adds columns and one unique index, no drops, no type changes to existing columns, and specifically that `slug` has no `NOT NULL` constraint, since this must be a purely additive migration for the 5 real wine rows already in production.

- [ ] **Step 3: Apply it to the local dev database**

Run: `npm run db:migrate`
Expected: `Migrations applied.` with no error.

- [ ] **Step 4: Commit**

```bash
git add lib/db/schema.ts drizzle/
git commit -m "feat: add slug and wine profile columns to the wines table"
```

---

### Task 3: Wines repository — slug generation, `getWineBySlug`, `getRelatedWines`

**Files:**
- Modify: `lib/db/wines.ts`
- Modify: `lib/db/wines.test.ts`

- [ ] **Step 1: Write the failing tests**

Add to `lib/db/wines.test.ts` (keep every existing test; only the `wineInput` helper and imports change, plus these new tests):

```ts
// Update the import line to add the new functions:
import {
  createWine,
  deleteWine,
  getWine,
  getWineBySlug,
  getRelatedWines,
  getWinesForHomepage,
  listWines,
  reorderWines,
  updateWine,
  type WineInput,
} from "./wines";
```

```ts
describe("createWine slug generation", () => {
  afterEach(async () => {
    await db.delete(wines);
  });

  it("generates a slug from the name", async () => {
    const wine = await createWine(wineInput({ name: "Pinot Noir" }));
    expect(wine.slug).toBe("pinot-noir");
  });

  it("appends a numeric suffix when the slug is already taken", async () => {
    await createWine(wineInput({ name: "Pinot Noir" }));
    const second = await createWine(wineInput({ name: "Pinot Noir" }));
    expect(second.slug).toBe("pinot-noir-2");
  });

  it("does not change the slug when the wine is later renamed", async () => {
    const wine = await createWine(wineInput({ name: "Pinot Noir" }));
    await updateWine(wine.id, { name: "Pinot Noir Reserve" });
    expect((await getWine(wine.id))?.slug).toBe("pinot-noir");
  });
});

describe("getWineBySlug", () => {
  afterEach(async () => {
    await db.delete(wines);
  });

  it("returns the matching row, or null when not found", async () => {
    const created = await createWine(wineInput({ name: "Pinot Noir" }));
    expect((await getWineBySlug("pinot-noir"))?.id).toBe(created.id);
    expect(await getWineBySlug("does-not-exist")).toBeNull();
  });
});

describe("getRelatedWines", () => {
  afterEach(async () => {
    await db.delete(wines);
  });

  it("returns other active wines, excluding the given id", async () => {
    const a = await createWine(wineInput({ name: "A" }));
    const b = await createWine(wineInput({ name: "B" }));
    const c = await createWine(wineInput({ name: "C", isActive: false }));

    const related = await getRelatedWines(a.id);
    expect(related.map((w) => w.id)).toEqual([b.id]);
    expect(related.map((w) => w.id)).not.toContain(a.id);
    expect(related.map((w) => w.id)).not.toContain(c.id);
  });

  it("caps the result at 4 wines", async () => {
    const wines = await Promise.all(
      Array.from({ length: 6 }, (_, i) => createWine(wineInput({ name: `Wine ${i}` })))
    );
    const related = await getRelatedWines(wines[0].id);
    expect(related.length).toBeLessThanOrEqual(4);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/db/wines.test.ts`
Expected: FAIL — `getWineBySlug`/`getRelatedWines` not exported, `wine.slug` undefined.

- [ ] **Step 3: Update `lib/db/wines.ts`**

```ts
import { and, asc, eq, ne, sql } from "drizzle-orm";
import { db } from "./client";
import { media, wines } from "./schema";
import { uniqueSlug } from "../slug";

export type Wine = typeof wines.$inferSelect;

export type WineInput = {
  name: string;
  metaNl: string;
  metaEn: string;
  tagNl: string;
  tagEn: string;
  imageId: string | null;
  shopifyHandle: string;
  isActive: boolean;
  descriptionNl?: string | null;
  descriptionEn?: string | null;
  grapes?: string | null;
  vintage?: string | null;
  wineTypeNl?: string | null;
  wineTypeEn?: string | null;
  regionNl?: string | null;
  regionEn?: string | null;
  farmingMethodNl?: string | null;
  farmingMethodEn?: string | null;
  vinificationNl?: string | null;
  vinificationEn?: string | null;
  abv?: number | null;
  foodPairingNl?: string | null;
  foodPairingEn?: string | null;
};

export async function listWines({ activeOnly = false }: { activeOnly?: boolean } = {}): Promise<Wine[]> {
  if (activeOnly) {
    return db.select().from(wines).where(eq(wines.isActive, true)).orderBy(asc(wines.sortOrder));
  }
  return db.select().from(wines).orderBy(asc(wines.sortOrder));
}

export async function getWine(id: string): Promise<Wine | null> {
  const [row] = await db.select().from(wines).where(eq(wines.id, id));
  return row ?? null;
}

export async function getWineBySlug(slug: string): Promise<Wine | null> {
  const [row] = await db.select().from(wines).where(eq(wines.slug, slug));
  return row ?? null;
}

export async function getRelatedWines(excludeId: string, limit = 4): Promise<Wine[]> {
  return db
    .select()
    .from(wines)
    .where(and(eq(wines.isActive, true), ne(wines.id, excludeId)))
    .orderBy(asc(wines.sortOrder))
    .limit(limit);
}

export async function createWine(input: WineInput): Promise<Wine> {
  const [{ maxSortOrder }] = await db
    .select({ maxSortOrder: sql<number>`coalesce(max(${wines.sortOrder}), -1)` })
    .from(wines);

  const slug = await uniqueSlug(input.name, async (candidate) => {
    const [existing] = await db.select({ id: wines.id }).from(wines).where(eq(wines.slug, candidate));
    return Boolean(existing);
  });

  const [row] = await db
    .insert(wines)
    .values({ ...input, slug, sortOrder: maxSortOrder + 1 })
    .returning();
  return row;
}

export async function updateWine(id: string, input: Partial<WineInput>): Promise<void> {
  await db
    .update(wines)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(wines.id, id));
}

export async function deleteWine(id: string): Promise<void> {
  await db.delete(wines).where(eq(wines.id, id));
}

export async function reorderWines(orderedIds: string[]): Promise<void> {
  await db.transaction(async (tx) => {
    for (const [index, id] of orderedIds.entries()) {
      await tx.update(wines).set({ sortOrder: index }).where(eq(wines.id, id));
    }
  });
}

export type WineWithImage = Wine & {
  imageStorageKey: string | null;
  imageAltNl: string | null;
  imageAltEn: string | null;
};

export async function getWinesForHomepage(): Promise<WineWithImage[]> {
  return db
    .select({
      id: wines.id,
      slug: wines.slug,
      name: wines.name,
      metaNl: wines.metaNl,
      metaEn: wines.metaEn,
      tagNl: wines.tagNl,
      tagEn: wines.tagEn,
      imageId: wines.imageId,
      shopifyHandle: wines.shopifyHandle,
      sortOrder: wines.sortOrder,
      isActive: wines.isActive,
      descriptionNl: wines.descriptionNl,
      descriptionEn: wines.descriptionEn,
      grapes: wines.grapes,
      vintage: wines.vintage,
      wineTypeNl: wines.wineTypeNl,
      wineTypeEn: wines.wineTypeEn,
      regionNl: wines.regionNl,
      regionEn: wines.regionEn,
      farmingMethodNl: wines.farmingMethodNl,
      farmingMethodEn: wines.farmingMethodEn,
      vinificationNl: wines.vinificationNl,
      vinificationEn: wines.vinificationEn,
      abv: wines.abv,
      foodPairingNl: wines.foodPairingNl,
      foodPairingEn: wines.foodPairingEn,
      updatedAt: wines.updatedAt,
      imageStorageKey: media.storageKey,
      imageAltNl: media.altTextNl,
      imageAltEn: media.altTextEn,
    })
    .from(wines)
    .leftJoin(media, eq(wines.imageId, media.id))
    .where(eq(wines.isActive, true))
    .orderBy(asc(wines.sortOrder));
}
```

Note: `createWine` now looks up slug collisions against the real table on every insert. This is an extra query per creation, acceptable given wines are created rarely, by hand, through the admin CMS, never in bulk or on a hot path. `updateWine` takes `Partial<WineInput>`, which has no `slug` key at all, so there is no code path that can overwrite an existing slug, this is what Task 1's "does not change the slug when the wine is later renamed" test is actually verifying.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/db/wines.test.ts`
Expected: PASS, all tests (existing + new).

- [ ] **Step 5: Commit**

```bash
git add lib/db/wines.ts lib/db/wines.test.ts
git commit -m "feat: generate wine slugs on create, add getWineBySlug and getRelatedWines"
```

---

### Task 4: CMS wine form — "Profiel" step

**Files:**
- Modify: `lib/validation/wine-input.ts`
- Modify: `lib/validation/wine-input.test.ts`
- Modify: `app/admin/wines/wine-form-wizard.tsx`
- Modify: `app/admin/wines/actions.ts`

- [ ] **Step 1: Update the validation input type (no new validation rules needed, the new fields are all optional)**

`lib/validation/wine-input.ts`:

```ts
export type WineFormInput = {
  name: string;
  metaNl: string;
  metaEn: string;
  tagNl: string;
  tagEn: string;
  imageId: string | null;
  shopifyHandle: string;
  isActive: boolean;
  descriptionNl: string;
  descriptionEn: string;
  grapes: string;
  vintage: string;
  wineTypeNl: string;
  wineTypeEn: string;
  regionNl: string;
  regionEn: string;
  farmingMethodNl: string;
  farmingMethodEn: string;
  vinificationNl: string;
  vinificationEn: string;
  abv: string;
  foodPairingNl: string;
  foodPairingEn: string;
};

export function validateWineInput(input: WineFormInput): string | null {
  if (!input.name.trim()) {
    return "Naam is verplicht.";
  }
  if (!input.shopifyHandle.trim()) {
    return "Shopify handle is verplicht.";
  }
  if (input.abv.trim() && Number.isNaN(Number(input.abv))) {
    return "Alcoholpercentage moet een getal zijn.";
  }
  return null;
}
```

`abv` stays a `string` on the form-input type (it comes off an `<input>` as text either way) and is only parsed to a number at the point it is written to the database (Task 4, Step 3), consistent with every other form field on this type.

- [ ] **Step 2: Write the failing test**

Add to `lib/validation/wine-input.test.ts` (keep existing tests, add):

```ts
it("rejects a non-numeric alcohol percentage", () => {
  const input = validInput({ abv: "niet een getal" });
  expect(validateWineInput(input)).toBe("Alcoholpercentage moet een getal zijn.");
});

it("accepts an empty alcohol percentage", () => {
  const input = validInput({ abv: "" });
  expect(validateWineInput(input)).toBeNull();
});
```

(`validInput` here is whatever this test file's existing helper for building a valid `WineFormInput` is called — extend it with the new fields as empty strings by default, the same way the existing helper already covers `name`/`shopifyHandle`.)

- [ ] **Step 3: Run test to verify it fails, then confirm it passes**

Run: `npx vitest run lib/validation/wine-input.test.ts`
Expected: FAIL first (new fields missing from the helper / `abv` check doesn't exist), then PASS after Step 1's change.

- [ ] **Step 4: Add the "Profiel" step to the wizard**

In `app/admin/wines/wine-form-wizard.tsx`, update the `STEPS` array:

```ts
const STEPS = [
  { key: "foto", label: "Foto" },
  { key: "details", label: "Details" },
  { key: "profiel", label: "Profiel" },
  { key: "publiceren", label: "Publiceren" },
] as const;
```

Add this block right after the existing `details` step's closing `</div>` (i.e. as a sibling of it, before the `publiceren` step's block):

```tsx
<div style={{ display: step === "profiel" ? "flex" : "none", flexDirection: "column", gap: "1.25rem" }}>
  <span className="a-hint">
    Alles hieronder is optioneel en verschijnt op de detailpagina van deze wijn. Leeg laten mag, vul aan wanneer je de content klaar hebt.
  </span>

  <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
    <label className="a-field">
      <span className="a-label">Beschrijving (NL)</span>
      <textarea id="descriptionNl" name="descriptionNl" defaultValue={wine?.descriptionNl ?? ""} className="a-input" rows={3} />
    </label>
    <label className="a-field">
      <span className="a-label">Beschrijving (EN)</span>
      <textarea id="descriptionEn" name="descriptionEn" defaultValue={wine?.descriptionEn ?? ""} className="a-input" rows={3} />
    </label>
  </div>

  <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
    <label className="a-field">
      <span className="a-label">Druif / blend</span>
      <span className="a-hint">Bijv. &ldquo;Chardonnay, macabeo, viognier&rdquo;.</span>
      <input type="text" id="grapes" name="grapes" defaultValue={wine?.grapes ?? ""} className="a-input" />
    </label>
    <label className="a-field">
      <span className="a-label">Jaargang</span>
      <span className="a-hint">Bijv. &ldquo;2023&rdquo; of &ldquo;blend&rdquo;.</span>
      <input type="text" id="vintage" name="vintage" defaultValue={wine?.vintage ?? ""} className="a-input" />
    </label>
    <label className="a-field">
      <span className="a-label">Alcoholpercentage</span>
      <input type="text" id="abv" name="abv" defaultValue={wine?.abv ?? ""} className="a-input" placeholder="13" />
    </label>
  </div>

  <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
    <label className="a-field">
      <span className="a-label">Type (NL)</span>
      <input type="text" id="wineTypeNl" name="wineTypeNl" defaultValue={wine?.wineTypeNl ?? ""} className="a-input" />
    </label>
    <label className="a-field">
      <span className="a-label">Type (EN)</span>
      <input type="text" id="wineTypeEn" name="wineTypeEn" defaultValue={wine?.wineTypeEn ?? ""} className="a-input" />
    </label>
  </div>

  <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
    <label className="a-field">
      <span className="a-label">Regio (NL)</span>
      <input type="text" id="regionNl" name="regionNl" defaultValue={wine?.regionNl ?? ""} className="a-input" />
    </label>
    <label className="a-field">
      <span className="a-label">Regio (EN)</span>
      <input type="text" id="regionEn" name="regionEn" defaultValue={wine?.regionEn ?? ""} className="a-input" />
    </label>
  </div>

  <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
    <label className="a-field">
      <span className="a-label">Landbouwtechniek (NL)</span>
      <input type="text" id="farmingMethodNl" name="farmingMethodNl" defaultValue={wine?.farmingMethodNl ?? ""} className="a-input" />
    </label>
    <label className="a-field">
      <span className="a-label">Landbouwtechniek (EN)</span>
      <input type="text" id="farmingMethodEn" name="farmingMethodEn" defaultValue={wine?.farmingMethodEn ?? ""} className="a-input" />
    </label>
  </div>

  <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
    <label className="a-field">
      <span className="a-label">Vinificatie (NL)</span>
      <input type="text" id="vinificationNl" name="vinificationNl" defaultValue={wine?.vinificationNl ?? ""} className="a-input" />
    </label>
    <label className="a-field">
      <span className="a-label">Vinificatie (EN)</span>
      <input type="text" id="vinificationEn" name="vinificationEn" defaultValue={wine?.vinificationEn ?? ""} className="a-input" />
    </label>
  </div>

  <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
    <label className="a-field">
      <span className="a-label">Wijn-spijs suggestie (NL)</span>
      <textarea id="foodPairingNl" name="foodPairingNl" defaultValue={wine?.foodPairingNl ?? ""} className="a-input" rows={2} />
    </label>
    <label className="a-field">
      <span className="a-label">Wijn-spijs suggestie (EN)</span>
      <textarea id="foodPairingEn" name="foodPairingEn" defaultValue={wine?.foodPairingEn ?? ""} className="a-input" rows={2} />
    </label>
  </div>
</div>
```

`wine?.abv` is a `number | null` on the `Wine` type but `defaultValue` needs a string or number, both are acceptable to React here since `defaultValue={null}` renders as an empty input, no extra coercion needed.

- [ ] **Step 5: Wire the new fields through `actions.ts`**

In `app/admin/wines/actions.ts`, update `readWineForm`:

```ts
function readWineForm(formData: FormData): WineFormInput {
  return {
    name: String(formData.get("name") ?? ""),
    metaNl: String(formData.get("metaNl") ?? ""),
    metaEn: String(formData.get("metaEn") ?? ""),
    tagNl: String(formData.get("tagNl") ?? ""),
    tagEn: String(formData.get("tagEn") ?? ""),
    imageId: (formData.get("imageId") as string) || null,
    shopifyHandle: String(formData.get("shopifyHandle") ?? ""),
    isActive: formData.get("isActive") === "on",
    descriptionNl: String(formData.get("descriptionNl") ?? ""),
    descriptionEn: String(formData.get("descriptionEn") ?? ""),
    grapes: String(formData.get("grapes") ?? ""),
    vintage: String(formData.get("vintage") ?? ""),
    wineTypeNl: String(formData.get("wineTypeNl") ?? ""),
    wineTypeEn: String(formData.get("wineTypeEn") ?? ""),
    regionNl: String(formData.get("regionNl") ?? ""),
    regionEn: String(formData.get("regionEn") ?? ""),
    farmingMethodNl: String(formData.get("farmingMethodNl") ?? ""),
    farmingMethodEn: String(formData.get("farmingMethodEn") ?? ""),
    vinificationNl: String(formData.get("vinificationNl") ?? ""),
    vinificationEn: String(formData.get("vinificationEn") ?? ""),
    abv: String(formData.get("abv") ?? ""),
    foodPairingNl: String(formData.get("foodPairingNl") ?? ""),
    foodPairingEn: String(formData.get("foodPairingEn") ?? ""),
  };
}
```

Update `saveWine` to convert `abv` from string to `number | null` before it reaches the repository (which expects `abv?: number | null`), and to revalidate the new public routes:

```ts
export async function saveWine(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string) || null;
  const input = readWineForm(formData);

  const validationError = validateWineInput(input);
  if (validationError) {
    const target = id ? `/admin/wines/${id}` : "/admin/wines/new";
    redirect(`${target}?error=${encodeURIComponent(validationError)}`);
  }

  const { abv, ...rest } = input;
  const dbInput = { ...rest, abv: abv.trim() ? Number(abv) : null };

  if (id) {
    await updateWine(id, dbInput);
  } else {
    await createWine(dbInput);
  }

  revalidatePath("/admin/wines");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/wijnen");
  revalidatePath("/wijnen/[slug]", "page");
  redirect("/admin/wines");
}
```

Also update `deleteWine` and `reorderWinesTo` in the same file to add the two new `revalidatePath` calls (`/wijnen` and `/wijnen/[slug]`), the exact same real bug this project already hit once this session (the dashboard not revalidating) would otherwise repeat here for the new public routes.

- [ ] **Step 6: Manual verification**

Run: `npm run dev`, open `/admin/wines/new`, confirm a fourth "Profiel" step appears between Details and Publiceren, fill in a couple of fields, save, reopen the wine and confirm the values persisted.

- [ ] **Step 7: Commit**

```bash
git add lib/validation/wine-input.ts lib/validation/wine-input.test.ts app/admin/wines/wine-form-wizard.tsx app/admin/wines/actions.ts
git commit -m "feat: add Profiel step to the wine form for the new detail-page fields"
```

---

### Task 5: Shared `WineCard` component, homepage linking

**Files:**
- Create: `components/wine-card.tsx`
- Modify: `components/wines-preview.tsx`
- Modify: `app/(site)/page.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Extract `WineCard` into its own file, now a link**

```tsx
// components/wine-card.tsx
import Link from "next/link";

export type WineCardData = {
  n: string;
  slug: string;
  meta: string;
  name: string;
  nlTag: string;
  enTag: string;
  price: string;
  img: string;
  alt: string;
  delay: number;
};

export function WineCard({
  wine,
  lang,
  reveal,
}: {
  wine: WineCardData;
  lang: "nl" | "en";
  reveal?: { ref: React.RefObject<HTMLElement | null>; isVisible: boolean };
}) {
  return (
    <Link
      href={`/wijnen/${wine.slug}`}
      ref={reveal?.ref as React.RefObject<HTMLAnchorElement>}
      className={`wine-card${reveal ? ` rv${reveal.isVisible ? " in" : ""}` : ""}`}
    >
      <div className="meta">
        <span>{wine.n}</span>
        <span>{wine.meta}</span>
      </div>
      <div className="wine-img-wrap">
        <img src={wine.img} alt={wine.alt} className="wine-packshot" />
      </div>
      <h3>{wine.name}</h3>
      <div className="tag">{lang === "nl" ? wine.nlTag : wine.enTag}</div>
      <div className="price">{wine.price}</div>
    </Link>
  );
}
```

`reveal` is optional because the overview page's grid (Task 6) doesn't need the homepage's scroll-reveal stagger, it renders all cards at once. The `<Link>` now carries the `wine-card` class directly since `.wine-card` in `globals.css` is styled as a block-level element already (padding, border, background), an anchor tag with `display: block`-like treatment via the existing card styles works the same as the previous `<article>`.

- [ ] **Step 2: Confirm `.wine-card` renders correctly as an anchor**

In `app/globals.css`, the existing `.wine-card` rule (around line 434) has no `display` declared, and defaults to whatever the element's own default is. Add `display: block;` as the first declaration in `.wine-card` so it behaves identically whether the element is an `<article>` or an `<a>`:

```css
.wine-card {
  display: block;
  flex: 0 0 clamp(240px, 24vw, 320px); scroll-snap-align: start;
  background: var(--theme-bg-card); border: 1px solid var(--theme-border);
  z-index: 2; padding: 26px 26px 30px; position: relative;
  transition: transform 0.6s var(--ease-out), box-shadow 0.6s var(--ease-out), background-color 0.4s var(--ease-out), border-color 0.4s;
}
```

(this replaces the existing `.wine-card { ... }` block, adding only the `display: block;` line, every other declaration is unchanged)

- [ ] **Step 3: Update `wines-preview.tsx` to use the extracted component**

```tsx
// components/wines-preview.tsx
"use client";

import { useCallback } from "react";
import { useLanguage } from "@/lib/language";
import { useReveal } from "@/lib/use-reveal";
import { useMagnetic } from "@/lib/use-magnetic";
import type { WinesContent } from "@/lib/content/defaults";
import { WineCard, type WineCardData } from "./wine-card";

export type { WineCardData };

function RevealingWineCard({ wine, lang }: { wine: WineCardData; lang: "nl" | "en" }) {
  const reveal = useReveal(wine.delay);
  return <WineCard wine={wine} lang={lang} reveal={reveal} />;
}

export function WinesPreview({ content, wines }: { content: WinesContent; wines: WineCardData[] }) {
  const { lang, t } = useLanguage();
  const heading1 = useReveal();
  const heading2 = useReveal(0.12);
  const cta = useReveal(0.2);
  const ctaMagnetic = useMagnetic();
  const setCtaRef = useCallback(
    (node: HTMLAnchorElement | null) => {
      cta.ref.current = node;
      ctaMagnetic.current = node;
    },
    [cta.ref, ctaMagnetic]
  );

  return (
    <section className="wines" id="wijnen">
      <div className="wines-head">
        <div>
          <div className="label rv in">
            {t(content.label.nl, content.label.en)} <span className="en">· made in Noord</span>
          </div>
          <h2>
            <span ref={heading1.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${heading1.isVisible ? " in" : ""}`}>
              <span>{t(content.heading_line1.nl, content.heading_line1.en)}</span>
            </span>
            <span ref={heading2.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${heading2.isVisible ? " in" : ""}`}>
              <span>
                {t(content.heading_line2_lead.nl, content.heading_line2_lead.en)}
                <em>{t(content.heading_line2_em.nl, content.heading_line2_em.en)}</em>
              </span>
            </span>
          </h2>
        </div>
        <a ref={setCtaRef} className={`btn rv${cta.isVisible ? " in" : ""}`} href="/wijnen">
          {t(content.cta_label.nl, content.cta_label.en)} <span className="arr">→</span>
        </a>
      </div>
      <div className="wine-row">
        {wines.map((wine) => (
          <RevealingWineCard key={wine.n} wine={wine} lang={lang} />
        ))}
      </div>
    </section>
  );
}
```

Two changes from the original: the CTA's `href` goes from `"#wijnen"` to `"/wijnen"` (the whole reason this task exists, per the client's original question about the "Shop alle wijnen" button), and card rendering is now `RevealingWineCard` (keeps the homepage-only scroll-reveal behavior local to this file) delegating to the shared `WineCard`.

- [ ] **Step 4: Thread `slug` through the homepage's data mapping**

In `app/(site)/page.tsx`, add a `slug` line to the object built in the `wines.map(...)` call. `wines.slug` is nullable at the database level (see Task 2's note on why), but always populated in practice, so this is a non-null assertion, not a silent cast:

```ts
  const wines: WineCardData[] = await Promise.all(
    wineRows.map(async (wine, index) => ({
      n: `N°${String(index + 1).padStart(2, "0")}`,
      // slug is nullable in the DB only because Postgres can't add a NOT
      // NULL column to a populated table; createWine always sets one for
      // new wines, and the migration's backfill script sets one for every
      // existing wine, so this is never actually null once code runs.
      slug: wine.slug!,
      meta: wine.metaNl,
      name: wine.name,
      nlTag: wine.tagNl,
      enTag: wine.tagEn,
      price: WINE_PRICE_PLACEHOLDER,
      img: wine.imageStorageKey ? await getObjectUrl(wine.imageStorageKey) : "/assets/wine-1.png",
      alt: wine.imageAltNl || wine.name,
      delay: index * 0.08,
    }))
  );
```

- [ ] **Step 5: Manual verification**

Run: `npm run dev`, open `/`, confirm every wine card on the homepage is now a real link and clicking one navigates to `/wijnen/<slug>` (a 404 is expected until Task 7 exists, that is fine at this point, confirm the URL itself is correct).

- [ ] **Step 6: Regression check before moving on**

Run: `npx vitest run` and `npx tsc --noEmit`
Expected: all existing tests still pass, no type errors (the `WineCardData` re-export from `wines-preview.tsx` keeps every existing import of that type working unchanged).

- [ ] **Step 7: Commit**

```bash
git add components/wine-card.tsx components/wines-preview.tsx app/\(site\)/page.tsx app/globals.css
git commit -m "refactor: extract WineCard as a shared, linked component; wire up the Shop alle wijnen button"
```

---

### Task 6: Wine overview page

**Files:**
- Create: `app/(site)/wijnen/page.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Add overview page styles**

Add to `app/globals.css` (anywhere in the WIJNEN section, after the existing `.wine-card .price` rule):

```css
.wijnen-breadcrumb { padding: 130px var(--gutter) 0; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--theme-fg-muted); }
.wijnen-breadcrumb a:hover { color: var(--theme-fg); }
.wijnen-breadcrumb .sep { margin: 0 8px; }
.wijnen-breadcrumb .current { color: var(--theme-fg); }

.wijnen-intro { padding: 30px var(--gutter) 10px; }
.wijnen-intro h1 { font-stretch: 125%; font-weight: 800; text-transform: uppercase; letter-spacing: -0.01em; font-size: clamp(38px, 6vw, 80px); line-height: 0.95; margin: 14px 0 20px; }
.wijnen-intro h1 em { font-family: var(--font-serif); font-style: italic; font-weight: 400; text-transform: none; color: var(--theme-accent); }
.wijnen-intro p { max-width: 50ch; font-size: 17px; line-height: 1.6; color: var(--theme-fg-muted); }

.wijnen-grid { padding: 40px var(--gutter) 120px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 26px; }
.wijnen-grid .wine-card { flex: none; }
.wijnen-grid .wine-link-cue { font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--theme-fg-muted); margin-top: 16px; display: block; }
@media (max-width: 900px) { .wijnen-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .wijnen-grid { grid-template-columns: 1fr; } }
```

`.wijnen-grid .wine-card { flex: none; }` overrides the homepage row's `flex: 0 0 clamp(...)` sizing (meant for a horizontal scroll row) since this page uses a real grid instead, each card should fill its grid cell rather than clamp to a fixed width.

- [ ] **Step 2: Write the page**

```tsx
// app/(site)/wijnen/page.tsx
import Link from "next/link";
import { WineCard, type WineCardData } from "@/components/wine-card";
import { getWinesForHomepage } from "@/lib/db/wines";
import { getObjectUrl } from "@/lib/storage/s3";

const WINE_PRICE_PLACEHOLDER = "vanaf shop.chateau.amsterdam";

export const dynamic = "force-dynamic";

export default async function WijnenOverviewPage() {
  const wineRows = await getWinesForHomepage();
  const wines: WineCardData[] = await Promise.all(
    wineRows.map(async (wine, index) => ({
      n: `N°${String(index + 1).padStart(2, "0")}`,
      // See app/(site)/page.tsx's identical assertion: slug is nullable in
      // the DB only for migration-safety reasons, never actually empty.
      slug: wine.slug!,
      meta: wine.metaNl,
      name: wine.name,
      nlTag: wine.tagNl,
      enTag: wine.tagEn,
      price: WINE_PRICE_PLACEHOLDER,
      img: wine.imageStorageKey ? await getObjectUrl(wine.imageStorageKey) : "/assets/wine-1.png",
      alt: wine.imageAltNl || wine.name,
      delay: 0,
    }))
  );

  return (
    <>
      <nav className="wijnen-breadcrumb">
        <Link href="/">Home</Link>
        <span className="sep">/</span>
        <span className="current">Wijnen</span>
      </nav>

      <div className="wijnen-intro">
        <div className="label">
          <span>De collectie</span>
        </div>
        <h1>
          Van klassiek <em>tot rebels</em>
        </h1>
        <p>Vijf wijnen, allemaal gevinifieerd middenin Amsterdam-Noord. Klik op een fles voor het volledige verhaal.</p>
      </div>

      <div className="wijnen-grid">
        {wines.map((wine) => (
          <WineCard key={wine.slug} wine={wine} lang="nl" />
        ))}
      </div>
    </>
  );
}
```

This page renders in Dutch only for now (`lang="nl"` hardcoded, `<WineCard lang="nl">`), matching the fact that this route has no `LanguageProvider`-driven toggle wired up yet, that is out of scope for this plan (the spec does not call for it, and the existing homepage's own language toggle is a client-side `useLanguage()` hook, whereas this is a plain Server Component). `key` is passed directly on `<WineCard>` with no wrapper element, `key` is a special prop React strips before it reaches the component, it does not need to appear in `WineCard`'s own prop type, and a wrapper `<div>` here would become the actual CSS grid item instead of the `<a class="wine-card">` inside it, breaking the grid sizing.

Note: this hardcoded-Dutch approach is a deliberate, narrow scope decision, not an oversight, if a later phase adds language-toggle support to `/wijnen`, this is the file to revisit.

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, open `/wijnen`, confirm the breadcrumb, intro block, and a 3-column grid of all 5 wines render, and that the button on the homepage's wines section now navigates here.

- [ ] **Step 4: Commit**

```bash
git add "app/(site)/wijnen/page.tsx" app/globals.css
git commit -m "feat: add the wine overview page at /wijnen"
```

---

### Task 7: Wine detail page

**Files:**
- Create: `app/(site)/wijnen/[slug]/page.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Add detail page styles**

Add to `app/globals.css`:

```css
.wijn-detail { display: grid; grid-template-columns: 0.85fr 1fr; gap: 56px; padding: 40px var(--gutter) 90px; }
@media (max-width: 900px) { .wijn-detail { grid-template-columns: 1fr; } }

.wijn-detail-photo { display: flex; flex-direction: column; }
.wijn-detail-photo .frame { background: var(--theme-bg-card); border: 1px solid var(--theme-border); border-radius: 2px; height: 560px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.wijn-detail-photo .frame img { height: 88%; object-fit: contain; }

.wijn-pairing { background: var(--theme-bg-card); border-left: 3px solid var(--theme-accent); padding: 18px 20px; margin-top: 24px; }
.wijn-pairing .label { margin-bottom: 8px; }
.wijn-pairing p { font-size: 15px; line-height: 1.6; }

.wijn-detail-info .meta { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--theme-fg-muted); }
.wijn-detail-info h1 { font-stretch: 125%; font-weight: 800; text-transform: uppercase; letter-spacing: -0.01em; font-size: clamp(34px, 4vw, 56px); line-height: 0.95; margin: 10px 0 4px; }
.wijn-detail-info .tag { font-family: var(--font-serif); font-style: italic; color: var(--theme-accent-text); font-size: 22px; display: block; margin-bottom: 22px; }
.wijn-detail-info .description { font-size: 17px; line-height: 1.65; max-width: 46ch; color: var(--theme-fg); opacity: 0.85; margin-bottom: 30px; }

.wijn-profile { border: 1px solid var(--theme-border); border-radius: 2px; margin-bottom: 26px; overflow: hidden; }
.wijn-profile-title { font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--theme-accent-text); background: var(--theme-bg-dim); padding: 10px 16px; }
.wijn-profile-body { display: flex; gap: 30px; padding: 18px 16px; }
.wijn-profile-facts { flex: 0 0 34%; display: flex; flex-direction: column; gap: 14px; padding-right: 24px; border-right: 1px solid var(--theme-border); }
.wijn-profile-details { flex: 1; display: flex; flex-direction: column; gap: 14px; }
.wijn-profile-item .k { font-family: var(--font-mono); font-size: 9.5px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--theme-fg-muted); display: block; margin-bottom: 4px; }
.wijn-profile-item .v { font-size: 14.5px; }
.wijn-profile-facts .wijn-profile-item:not(:last-child),
.wijn-profile-details .wijn-profile-item:not(:last-child) { border-bottom: 1px solid var(--theme-border); padding-bottom: 14px; }
@media (max-width: 520px) {
  .wijn-profile-body { flex-direction: column; }
  .wijn-profile-facts { border-right: none; border-bottom: 1px solid var(--theme-border); padding-right: 0; padding-bottom: 16px; }
}

.wijn-related { padding: 20px var(--gutter) 120px; }
.wijn-related h2 { font-stretch: 125%; font-weight: 800; text-transform: uppercase; font-size: clamp(26px, 3.4vw, 40px); margin-bottom: 24px; }
.wijn-related h2 em { font-family: var(--font-serif); font-style: italic; font-weight: 400; text-transform: none; color: var(--theme-accent); }
.wijn-related-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.wijn-related-row .wine-card { flex: none; }
@media (max-width: 900px) { .wijn-related-row { grid-template-columns: repeat(2, 1fr); } }
```

- [ ] **Step 2: Write the page**

```tsx
// app/(site)/wijnen/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { WineCard, type WineCardData } from "@/components/wine-card";
import { getRelatedWines, getWineBySlug } from "@/lib/db/wines";
import { getObjectUrl } from "@/lib/storage/s3";
import { listMedia } from "@/lib/db/media";

export const dynamic = "force-dynamic";

const PROFILE_FACT_KEYS = ["vintage", "grapes", "abv"] as const;

export default async function WijnDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const wine = await getWineBySlug(slug);
  if (!wine || !wine.isActive) {
    notFound();
  }

  const media = await listMedia();
  const image = media.find((m) => m.id === wine.imageId);
  const imageUrl = image ? await getObjectUrl(image.storageKey) : "/assets/wine-1.png";

  const relatedRows = await getRelatedWines(wine.id);
  const related: WineCardData[] = await Promise.all(
    relatedRows.map(async (r, index) => {
      const relatedImage = media.find((m) => m.id === r.imageId);
      return {
        n: `N°${String(index + 1).padStart(2, "0")}`,
        // Same nullable-in-the-DB-only assertion as the other two pages.
        slug: r.slug!,
        meta: r.metaNl,
        name: r.name,
        nlTag: r.tagNl,
        enTag: r.tagEn,
        price: "vanaf shop.chateau.amsterdam",
        img: relatedImage ? await getObjectUrl(relatedImage.storageKey) : "/assets/wine-1.png",
        alt: relatedImage?.altTextNl || r.name,
        delay: 0,
      };
    })
  );

  const hasFacts = wine.vintage || wine.grapes || wine.abv !== null;
  const hasDetails = wine.wineTypeNl || wine.regionNl || wine.farmingMethodNl || wine.vinificationNl;

  return (
    <>
      <nav className="wijnen-breadcrumb">
        <Link href="/">Home</Link>
        <span className="sep">/</span>
        <Link href="/wijnen">Wijnen</Link>
        <span className="sep">/</span>
        <span className="current">{wine.name}</span>
      </nav>

      <div className="wijn-detail">
        <div className="wijn-detail-photo">
          <div className="frame">
            <img src={imageUrl} alt={wine.name} />
          </div>
          {wine.foodPairingNl ? (
            <div className="wijn-pairing">
              <span className="label">Wijn-spijs suggestie</span>
              <p>{wine.foodPairingNl}</p>
            </div>
          ) : null}
        </div>

        <div className="wijn-detail-info">
          <span className="meta">{wine.metaNl}</span>
          <h1>{wine.name}</h1>
          <span className="tag">{wine.tagNl}</span>

          {wine.descriptionNl ? <p className="description">{wine.descriptionNl}</p> : null}

          {hasFacts || hasDetails ? (
            <div className="wijn-profile">
              <div className="wijn-profile-title">Wijnprofiel</div>
              <div className="wijn-profile-body">
                {hasFacts ? (
                  <div className="wijn-profile-facts">
                    {wine.vintage ? (
                      <div className="wijn-profile-item">
                        <span className="k">Jaargang</span>
                        <span className="v">{wine.vintage}</span>
                      </div>
                    ) : null}
                    {wine.grapes ? (
                      <div className="wijn-profile-item">
                        <span className="k">Druif</span>
                        <span className="v">{wine.grapes}</span>
                      </div>
                    ) : null}
                    {wine.abv !== null ? (
                      <div className="wijn-profile-item">
                        <span className="k">Alcoholpercentage</span>
                        <span className="v">{wine.abv}% vol</span>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {hasDetails ? (
                  <div className="wijn-profile-details">
                    {wine.wineTypeNl ? (
                      <div className="wijn-profile-item">
                        <span className="k">Type</span>
                        <span className="v">{wine.wineTypeNl}</span>
                      </div>
                    ) : null}
                    {wine.regionNl ? (
                      <div className="wijn-profile-item">
                        <span className="k">Regio</span>
                        <span className="v">{wine.regionNl}</span>
                      </div>
                    ) : null}
                    {wine.farmingMethodNl ? (
                      <div className="wijn-profile-item">
                        <span className="k">Landbouwtechniek</span>
                        <span className="v">{wine.farmingMethodNl}</span>
                      </div>
                    ) : null}
                    {wine.vinificationNl ? (
                      <div className="wijn-profile-item">
                        <span className="k">Vinificatie</span>
                        <span className="v">{wine.vinificationNl}</span>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {/*
            TEMPORARY BRIDGE: this button links straight to the wine's
            existing Shopify product page. It is not the end state, do
            not extend this pattern elsewhere.

            End state (Shopify Storefront API phase, a later, separate
            plan): this becomes an "In winkelmandje" action that adds
            the item to a Cart (Storefront API Cart object) and opens a
            slide-in drawer. The customer adds/removes wines and stays
            on this site throughout; only the final payment step
            redirects once to Shopify's hosted checkout. Price and
            stock become live at that point via a server-side
            Storefront API call. Replace this direct link wholesale
            when that phase starts, do not build on top of it.
          */}
          <a className="btn btn--primary" href={`https://shop.chateau.amsterdam/products/${wine.shopifyHandle}`}>
            Bestel deze fles <span className="arr">→</span>
          </a>
        </div>
      </div>

      {related.length > 0 ? (
        <div className="wijn-related">
          <h2>
            Misschien vind je dit <em>ook leuk</em>
          </h2>
          <div className="wijn-related-row">
            {related.map((r) => (
              <WineCard key={r.slug} wine={r} lang="nl" />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
```

Every profile field renders conditionally on its own, and the two profile groups (`hasFacts`/`hasDetails`) each render only if at least one of their fields has a value, so a freshly-created wine with every Task 4 field still empty shows no empty "Wijnprofiel" box at all, just the name, tag, and buy button, exactly the same content the wine has today. The Shopify product URL (`https://shop.chateau.amsterdam/products/${wine.shopifyHandle}`) matches the existing live pattern the current homepage already implies via `WINE_PRICE_PLACEHOLDER`'s "vanaf shop.chateau.amsterdam" text, confirm this exact URL shape against the client's real shop before shipping (Step 4 below).

- [ ] **Step 3: Write a not-found check test**

This page's core logic (`getWineBySlug` returning `null`/inactive → `notFound()`) is already covered indirectly by `lib/db/wines.test.ts`'s `getWineBySlug` tests from Task 3. No additional unit test is needed here since the rest of this file is Server Component markup, consistent with how `app/(site)/page.tsx` itself has no dedicated test file either (this project's established pattern: hooks and pure logic get unit tests, page markup gets manual visual verification, see the Phase 1 plan's testing-approach note).

- [ ] **Step 4: Manual verification**

Run: `npm run dev`.
1. Open `/wijnen`, click a wine card, confirm it lands on `/wijnen/<slug>` with the full layout: breadcrumb, photo, wijn-spijs suggestie under the photo (only if that wine has one filled in), Wijnprofiel block (only the groups/fields that have data), buy button.
2. Confirm the buy button's `href` actually resolves on the real `shop.chateau.amsterdam` for at least one of the 5 real wines' `shopifyHandle` values, fix the URL template in Step 2 if the real path shape differs.
3. Open a wine that has zero Task 4 fields filled in yet (true for all 5 real wines until the client fills them in) and confirm the page still looks intentional: no empty boxes, just name/tag/photo/buy button/related wines.
4. Visit `/wijnen/does-not-exist` and confirm it renders the site's normal 404 page.

- [ ] **Step 5: Commit**

```bash
git add "app/(site)/wijnen/[slug]/page.tsx" app/globals.css
git commit -m "feat: add the wine detail page at /wijnen/[slug]"
```

---

### Task 8: Full regression, production migration, and deploy

**Files:** none new, verification and infrastructure only.

- [ ] **Step 1: Full local regression**

Run, in order:
```bash
npx vitest run
npx tsc --noEmit
npm run build
```
Expected: all tests pass, no type errors, and the build output lists `/wijnen` and `/wijnen/[slug]` as `ƒ` (dynamic), not `○` (static) — if either shows as static, `export const dynamic = "force-dynamic"` is missing from that page and the production build will fail the same way `app/(site)/page.tsx` originally did (see that file's own comment for why).

- [ ] **Step 2: Merge to main**

Follow this repository's existing merge convention (as used for the Phase 1 and Phase 2 worktrees): merge the feature branch into `main`, then confirm with `git log --oneline -5` and `git status`.

- [ ] **Step 3: Generate and review the production migration once more**

Run: `npm run db:generate` if not already committed from Task 2, confirm no destructive statements (`DROP`, `ALTER COLUMN ... TYPE`, `NOT NULL` added to an existing column) appear anywhere in the new migration file, only `ADD COLUMN` and one `CREATE UNIQUE INDEX`.

- [ ] **Step 4: Write and run the one-off slug backfill script against production**

```ts
// scripts/backfill-wine-slugs.ts
import { config } from "dotenv";
config({ path: ".env.local" });
import { eq, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { wines } from "../lib/db/schema";
import { slugify } from "../lib/slug";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  const rows = await db.select().from(wines);
  for (const row of rows) {
    const slug = row.shopifyHandle ? slugify(row.shopifyHandle) : slugify(row.name);
    await db.update(wines).set({ slug }).where(eq(wines.id, row.id));
    console.log(`${row.name} -> ${slug}`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

This backfills every existing wine's `slug` from its `shopifyHandle` (already a clean, human-readable slug per Phase 2's wine recovery work, e.g. `"pinot-noir"`), falling back to the wine's `name` only if `shopifyHandle` is ever empty. Run against the **production** database specifically for this one-off (per this project's established pattern for one-off scripts, see the Phase 2 wine-photo recovery script): point `DATABASE_URL`/`DATABASE_PUBLIC_URL` at production for this single invocation, run `npx tsx scripts/backfill-wine-slugs.ts`, confirm the printed output shows all 5 real wines with sensible slugs, then delete this script (its job is done, it must never run twice against a database that already has slugs, since `uniqueSlug`'s collision logic is in `createWine`, not in this bulk-update script).

- [ ] **Step 5: Apply the migration to production, then deploy**

Run the production migration (`npm run db:migrate` with `DATABASE_URL` pointed at production, matching how the Phase 2 CMS migration was applied), then run the backfill script from Step 4, then `git push origin main` to trigger the Railway deploy.

- [ ] **Step 6: Poll the deployment and verify live**

Poll `railway status --json` for the new commit hash to reach `SUCCESS` (same pattern used after every deploy so far this project). Once live:
- `curl` the login page and homepage for a `200`.
- Open `/wijnen` on the live URL, confirm all 5 real wines render with real photos.
- Click through to at least 2 detail pages, confirm the buy button's Shopify link actually opens the right product.
- Confirm the homepage's "Shop alle wijnen" button now goes to `/wijnen` instead of scrolling to the same section.

- [ ] **Step 7: Report back**

Summarize what shipped, and flag explicitly (as already noted in the spec) that all 9 new profile fields are empty for the 5 real wines until the client fills them in via `/admin/wines/<id>`'s new "Profiel" step.
