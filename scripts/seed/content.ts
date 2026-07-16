// scripts/seed/content.ts
import { upsertBlock } from "@/lib/db/content";
import {
  HEADER_DEFAULTS,
  HERO_DEFAULTS,
  MARQUEE_DEFAULTS,
  MANIFEST_DEFAULTS,
  PROCESS_DEFAULTS,
  PATHS_DEFAULTS,
  WINES_DEFAULTS,
  PLACE_DEFAULTS,
  FOOTER_DEFAULTS,
  type ContentPair,
} from "@/lib/content/defaults";

const PAGE = "home";

const SECTIONS: Array<{ section: string; defaults: Record<string, ContentPair> }> = [
  { section: "header", defaults: HEADER_DEFAULTS },
  { section: "hero", defaults: HERO_DEFAULTS },
  { section: "marquee", defaults: MARQUEE_DEFAULTS },
  { section: "manifest", defaults: MANIFEST_DEFAULTS },
  { section: "process", defaults: PROCESS_DEFAULTS },
  { section: "paths", defaults: PATHS_DEFAULTS },
  { section: "wines", defaults: WINES_DEFAULTS },
  { section: "place", defaults: PLACE_DEFAULTS },
  { section: "footer", defaults: FOOTER_DEFAULTS },
];

/**
 * Populates content_blocks with today's real homepage copy, sourced from the
 * same lib/content/defaults.ts constants the components fall back to — so
 * the seed and the fallback can never silently drift apart. Not a standalone
 * runnable script: exported for the final cross-module seed-wiring task
 * (owned elsewhere) to call alongside the user/reservation seed modules.
 * Safe to re-run — every write goes through upsertBlock's
 * onConflictDoUpdate, so re-seeding just re-asserts today's defaults.
 */
export async function seedContent(): Promise<void> {
  for (const { section, defaults } of SECTIONS) {
    for (const [fieldKey, value] of Object.entries(defaults)) {
      await upsertBlock(PAGE, section, fieldKey, value.nl, value.en);
    }
  }
}
