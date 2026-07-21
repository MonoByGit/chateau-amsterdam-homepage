// lib/wines/image.ts
import { isShopifyConfigured } from "@/lib/shopify/client";
import { getProductImageByHandle } from "@/lib/shopify/product";
import { getObjectUrl } from "@/lib/storage/s3";

const PLACEHOLDER_IMAGE = "/assets/wine-1.png";

// Shopify is the source of truth for product photos: a wine gets its image
// from there whenever it's linked (shopifyHandle set) and Shopify actually
// has one, so nobody has to upload the same bottle shot twice. The CMS
// upload (imageStorageKey) only matters as a fallback — tasting-room-only
// wines with no Shopify listing, or a handle Shopify doesn't recognize.
export async function resolveWineImageUrl(wine: {
  shopifyHandle: string | null;
  imageStorageKey: string | null;
}): Promise<string> {
  if (wine.shopifyHandle && isShopifyConfigured()) {
    try {
      const shopifyImage = await getProductImageByHandle(wine.shopifyHandle);
      if (shopifyImage) return shopifyImage.url;
    } catch {
      // Shopify unreachable or handle unknown — fall through to the CMS photo.
    }
  }
  return wine.imageStorageKey ? await getObjectUrl(wine.imageStorageKey) : PLACEHOLDER_IMAGE;
}
