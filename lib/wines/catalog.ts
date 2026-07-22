// lib/wines/catalog.ts
import { shopifyFetch } from "@/lib/shopify/client";
import { WINE_COLLECTION_QUERY, WINE_BY_HANDLE_QUERY } from "@/lib/shopify/queries";
import { WINE_METAFIELD_IDENTIFIERS, metafieldsToRecord, type WineFields } from "@/lib/shopify/wine-fields";
import type { ShopifyLanguage, ShopifyMoney, ShopifyWineProduct } from "@/lib/shopify/types";
import { wineTypeLabel } from "./wine-type-labels";

// The wine catalog is one already-existing Shopify smart collection; the
// homepage teaser is a manual collection the client curates directly in
// Shopify (drag to reorder, add/remove up to 5 — see Task 0 in
// docs/superpowers/plans/2026-07-21-shopify-wine-catalog-mirror.md for how
// it was created).
const WINE_COLLECTION_HANDLE = "all-wines";
const FEATURED_COLLECTION_HANDLE = "homepage";

// 5 minutes: wine copy changes rarely enough that this doesn't need to be
// as fresh as cart/inventory calls (which stay uncached, see client.ts),
// but fresh enough that an admin edit in Shopify shows up same-session.
const CATALOG_REVALIDATE_SECONDS = 300;

export type WineSummary = {
  handle: string;
  title: string;
  productType: string;
  image: { url: string; altText: string | null } | null;
  price: ShopifyMoney;
  fieldsNl: WineFields;
  fieldsEn: WineFields;
};

export type WineDetail = {
  handle: string;
  title: string;
  productType: string;
  image: { url: string; altText: string | null } | null;
  price: ShopifyMoney;
  tagNl: string | null;
  tagEn: string | null;
  descriptionNl: string | null;
  descriptionEn: string | null;
  grapes: string | null;
  regionNl: string | null;
  regionEn: string | null;
  foodPairingNl: string | null;
  foodPairingEn: string | null;
};

async function fetchCollection(collectionHandle: string, language: ShopifyLanguage): Promise<ShopifyWineProduct[]> {
  const data = await shopifyFetch<{ collectionByHandle: { products: { edges: { node: ShopifyWineProduct }[] } } | null }>({
    query: WINE_COLLECTION_QUERY,
    variables: { handle: collectionHandle, language, identifiers: WINE_METAFIELD_IDENTIFIERS },
    revalidateSeconds: CATALOG_REVALIDATE_SECONDS,
  });
  return data.collectionByHandle?.products.edges.map((e) => e.node) ?? [];
}

function toSummary(nl: ShopifyWineProduct, en: ShopifyWineProduct | undefined): WineSummary {
  return {
    handle: nl.handle,
    title: nl.title,
    productType: nl.productType,
    image: nl.featuredImage,
    price: nl.priceRange.minVariantPrice,
    fieldsNl: metafieldsToRecord(nl.metafields),
    fieldsEn: metafieldsToRecord(en?.metafields ?? nl.metafields),
  };
}

async function fetchBilingualCollection(collectionHandle: string): Promise<WineSummary[]> {
  const [nlProducts, enProducts] = await Promise.all([
    fetchCollection(collectionHandle, "NL"),
    fetchCollection(collectionHandle, "EN"),
  ]);
  const enByHandle = new Map(enProducts.map((p) => [p.handle, p]));
  return nlProducts.map((nl) => toSummary(nl, enByHandle.get(nl.handle)));
}

export async function getWineCatalog(): Promise<WineSummary[]> {
  return fetchBilingualCollection(WINE_COLLECTION_HANDLE);
}

export async function getFeaturedWines(): Promise<WineSummary[]> {
  const featured = await fetchBilingualCollection(FEATURED_COLLECTION_HANDLE);
  if (featured.length > 0) return featured.slice(0, 5);
  const catalog = await fetchBilingualCollection(WINE_COLLECTION_HANDLE);
  return catalog.slice(0, 5);
}

// Preference order for the detail page's main copy: a hand-written wine
// profile beats the looser "story" text, which beats "origin", which beats
// falling all the way back to Shopify's own product description (stripped
// of HTML) so a wine with none of the custom fields filled in yet still
// shows something instead of a blank page.
function pickDescription(fields: WineFields, descriptionHtml: string): string | null {
  const text = fields.wine_profile || fields.story || fields.origin;
  if (text) return text;
  const stripped = descriptionHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return stripped || null;
}

function combineRegion(fields: WineFields): string | null {
  const parts = [fields.region_of_origin, fields.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

async function fetchWineByHandle(handle: string, language: ShopifyLanguage): Promise<ShopifyWineProduct | null> {
  const data = await shopifyFetch<{ productByHandle: ShopifyWineProduct | null }>({
    query: WINE_BY_HANDLE_QUERY,
    variables: { handle, language, identifiers: WINE_METAFIELD_IDENTIFIERS },
    revalidateSeconds: CATALOG_REVALIDATE_SECONDS,
  });
  return data.productByHandle;
}

export async function getWineByHandle(handle: string): Promise<WineDetail | null> {
  const [nl, en] = await Promise.all([fetchWineByHandle(handle, "NL"), fetchWineByHandle(handle, "EN")]);
  if (!nl) return null;

  const fieldsNl = metafieldsToRecord(nl.metafields);
  const fieldsEn = metafieldsToRecord((en ?? nl).metafields);

  return {
    handle: nl.handle,
    title: nl.title,
    productType: nl.productType,
    image: nl.featuredImage,
    price: nl.priceRange.minVariantPrice,
    tagNl: fieldsNl.oneliner ?? null,
    tagEn: fieldsEn.oneliner ?? null,
    descriptionNl: pickDescription(fieldsNl, nl.descriptionHtml),
    descriptionEn: pickDescription(fieldsEn, (en ?? nl).descriptionHtml),
    grapes: fieldsNl.grape_variety ?? fieldsEn.grape_variety ?? null,
    regionNl: combineRegion(fieldsNl),
    regionEn: combineRegion(fieldsEn),
    foodPairingNl: fieldsNl.pairing ?? null,
    foodPairingEn: fieldsEn.pairing ?? null,
  };
}

export { wineTypeLabel } from "./wine-type-labels";
