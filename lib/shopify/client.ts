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
  revalidateSeconds,
}: {
  query: string;
  variables?: Record<string, unknown>;
  // Cart/checkout/inventory calls must stay uncached (default: no-store).
  // Pass this for data that's fine to be a little stale, e.g. product
  // photos, so we're not round-tripping to Shopify on every page render.
  revalidateSeconds?: number;
}): Promise<T> {
  const { domain, token, apiVersion } = getConfig();

  const response = await fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    ...(revalidateSeconds !== undefined ? { next: { revalidate: revalidateSeconds } } : { cache: "no-store" }),
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
