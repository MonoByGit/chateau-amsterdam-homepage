// lib/content/emails.ts
import { getBlocksForSection } from "@/lib/db/content";
import {
  EMAIL_RECEIPT_DEFAULTS,
  EMAIL_CONFIRMATION_DEFAULTS,
  EMAIL_UPDATE_DEFAULTS,
  EMAIL_SALES_DEFAULTS,
  type EmailTemplateContent,
} from "./defaults";

export function getEmailDefaults(templateKey: string): EmailTemplateContent {
  switch (templateKey) {
    case "customer-confirmation":
      return EMAIL_CONFIRMATION_DEFAULTS;
    case "customer-update":
      return EMAIL_UPDATE_DEFAULTS;
    case "sales-tasting":
    case "sales-business":
      return EMAIL_SALES_DEFAULTS;
    case "customer-receipt":
    default:
      return EMAIL_RECEIPT_DEFAULTS;
  }
}

export async function getEmailContent(templateKey: string): Promise<EmailTemplateContent> {
  const defaults = getEmailDefaults(templateKey);
  try {
    const rawBlocks = await getBlocksForSection("emails", templateKey);
    if (!rawBlocks || rawBlocks.length === 0) return defaults;

    const blockMap = new Map(rawBlocks.map((b) => [b.fieldKey, b]));
    const result: Record<string, { nl: string; en: string }> = {};

    for (const [key, defaultPair] of Object.entries(defaults)) {
      const match = blockMap.get(key);
      result[key] = {
        nl: match?.valueNl || defaultPair.nl,
        en: match?.valueEn || defaultPair.en,
      };
    }
    return result as EmailTemplateContent;
  } catch (err) {
    return defaults;
  }
}
