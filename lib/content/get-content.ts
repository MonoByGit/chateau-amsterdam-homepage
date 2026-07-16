import { getBlocksForSection } from "@/lib/db/content";

export type ContentPair = { nl: string; en: string };

type FetchBlocks = (
  page: string,
  section: string
) => Promise<Array<{ fieldKey: string; valueNl: string; valueEn: string }>>;

/**
 * Fetches this section's content_blocks rows and merges them over `defaults`,
 * keyed by field_key. Any field_key present in `defaults` but missing from
 * the DB falls back to its hardcoded default rather than rendering blank —
 * that fallback is the behavior this module exists to guarantee.
 *
 * `fetchBlocks` defaults to the real repository (`getBlocksForSection`) so
 * every real call site just does `getContent(page, section, SOME_DEFAULTS)`;
 * the parameter exists so tests can inject a fake without touching Postgres.
 */
export async function getContent<T extends Record<string, ContentPair>>(
  page: string,
  section: string,
  defaults: T,
  fetchBlocks: FetchBlocks = getBlocksForSection
): Promise<T> {
  const rows = await fetchBlocks(page, section);
  const overrides = new Map(rows.map((row) => [row.fieldKey, { nl: row.valueNl, en: row.valueEn }]));

  const merged = {} as T;
  for (const fieldKey of Object.keys(defaults) as Array<keyof T>) {
    const override = overrides.get(fieldKey as string);
    merged[fieldKey] = (override as T[keyof T] | undefined) ?? defaults[fieldKey];
  }
  return merged;
}
