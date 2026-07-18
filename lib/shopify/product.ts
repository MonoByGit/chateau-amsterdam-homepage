// lib/shopify/product.ts
import { shopifyFetch } from "./client";
import { PRODUCT_BY_HANDLE_QUERY } from "./queries";
import type { ShopifyProduct, ShopifyProductVariant } from "./types";

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

// Most wines are single-variant products (no size/format options), so the
// first available-for-sale variant is the one "In winkelmandje" adds. If a
// wine ever gets real variants (e.g. half bottle vs. full bottle), this is
// the function to extend with a variant picker — out of scope for now.
export function firstAvailableVariant(product: ShopifyProduct): ShopifyProductVariant | null {
  return product.variants.find((v) => v.availableForSale) ?? product.variants[0] ?? null;
}
