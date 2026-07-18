// lib/shopify/client.ts
const DEFAULT_API_VERSION = "2025-10";

export class ShopifyConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShopifyConfigError";
  }
}

export function isShopifyConfigured(): boolean {
  return Boolean(process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_STOREFRONT_TOKEN);
}

// A cart action returns this exact string as its `error` when Shopify isn't
// configured yet, so the UI can distinguish "not set up" (show a fallback
// link to the shop) from a real, unexpected failure (show a retry message).
export const SHOPIFY_NOT_CONFIGURED_ERROR = "shopify_not_configured";

function getConfig(): { domain: string; token: string; apiVersion: string } {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_TOKEN;

  if (!domain || !token) {
    throw new ShopifyConfigError(
      "Shopify is nog niet geconfigureerd: zet SHOPIFY_STORE_DOMAIN en SHOPIFY_STOREFRONT_TOKEN in .env.local (lokaal) of de Railway-variabelen (productie)."
    );
  }

  return { domain, token, apiVersion: process.env.SHOPIFY_API_VERSION || DEFAULT_API_VERSION };
}

export async function shopifyFetch<T>({
  query,
  variables,
}: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<T> {
  const { domain, token, apiVersion } = getConfig();

  const response = await fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Shopify Storefront API-verzoek mislukt: ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as { data?: T; errors?: unknown };
  if (json.errors) {
    throw new Error(`Shopify Storefront API gaf een fout terug: ${JSON.stringify(json.errors)}`);
  }
  if (!json.data) {
    throw new Error("Shopify Storefront API gaf geen data terug.");
  }

  return json.data;
}
