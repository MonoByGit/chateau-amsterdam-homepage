// lib/content/popups.ts
import { getBlocksForSection } from "@/lib/db/content";
import type { ContentPair } from "./get-content";
import {
  NEWSLETTER_POPUP_DEFAULTS,
  AGE_GATE_POPUP_DEFAULTS,
  COOKIE_BANNER_POPUP_DEFAULTS,
} from "./popup-defaults";

export * from "./popup-defaults";

export async function getPopupContent<T extends Record<string, ContentPair>>(
  popupKey: "newsletter" | "age-gate" | "cookie-banner"
): Promise<T> {
  let defaults: Record<string, ContentPair>;
  if (popupKey === "newsletter") {
    defaults = NEWSLETTER_POPUP_DEFAULTS;
  } else if (popupKey === "age-gate") {
    defaults = AGE_GATE_POPUP_DEFAULTS;
  } else {
    defaults = COOKIE_BANNER_POPUP_DEFAULTS;
  }

  try {
    const rawBlocks = await getBlocksForSection("popups", popupKey);
    if (!rawBlocks || rawBlocks.length === 0) return defaults as T;

    const blockMap = new Map(rawBlocks.map((b) => [b.fieldKey, b]));
    const result: Record<string, ContentPair> = {};

    for (const [key, defaultPair] of Object.entries(defaults)) {
      const match = blockMap.get(key);
      result[key] = {
        nl: match?.valueNl || defaultPair.nl,
        en: match?.valueEn || defaultPair.en,
      };
    }
    return result as T;
  } catch (err) {
    return defaults as T;
  }
}
