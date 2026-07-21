// lib/shopify/product.ts
import { shopifyFetch } from "./client";
import { PRODUCT_BY_HANDLE_QUERY, PRODUCT_IMAGE_BY_HANDLE_QUERY } from "./queries";
import type { ShopifyProduct, ShopifyProductImage, ShopifyProductVariant } from "./types";

type RawVariantEdge = { node: ShopifyProductVariant };
type RawProduct = {
  id: string;
  handle: string;
  title: string;
  variants: { edges: RawVariantEdge[] };
};

function mapProduct(raw: RawProduct): ShopifyProduct {
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    variants: raw.variants.edges.map((e) => e.node),
  };
}

export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<{ productByHandle: RawProduct | null }>({
    query: PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
  });
  return data.productByHandle ? mapProduct(data.productByHandle) : null;
}

// Product photos live in Shopify already (that's where the client manages
// the catalog), so wine cards pull them straight from here instead of
// requiring a second, duplicate upload in the CMS. Cached for an hour since
// a product photo changing mid-hour isn't worth a Shopify round-trip on
// every page render — unlike price/inventory, which stay uncached.
export async function getProductImageByHandle(handle: string): Promise<ShopifyProductImage | null> {
  const data = await shopifyFetch<{ productByHandle: { featuredImage: ShopifyProductImage | null } | null }>({
    query: PRODUCT_IMAGE_BY_HANDLE_QUERY,
    variables: { handle },
    revalidateSeconds: 3600,
  });
  return data.productByHandle?.featuredImage ?? null;
}

// Most wines are single-variant products (no size/format options), so the
// first available-for-sale variant is the one "In winkelmandje" adds. If a
// wine ever gets real variants (e.g. half bottle vs. full bottle), this is
// the function to extend with a variant picker — out of scope for now.
export function firstAvailableVariant(product: ShopifyProduct): ShopifyProductVariant | null {
  return product.variants.find((v) => v.availableForSale) ?? product.variants[0] ?? null;
}
