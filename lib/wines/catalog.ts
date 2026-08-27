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

import { WINE_TRANSLATIONS_NL, translateRegion, extractAbv } from "./translations";

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
  grapesNl: string | null;
  grapesEn: string | null;
  abvNl: string | null;
  abvEn: string | null;
  wineTypeNl: string | null;
  wineTypeEn: string | null;
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
  const fieldsNl = metafieldsToRecord(nl.metafields);
  const fieldsEn = metafieldsToRecord(en?.metafields ?? nl.metafields);
  const translation = WINE_TRANSLATIONS_NL[nl.handle];

  if (translation?.oneliner) {
    fieldsNl.oneliner = translation.oneliner;
  }

  return {
    handle: nl.handle,
    title: nl.title,
    productType: nl.productType,
    image: nl.featuredImage,
    price: nl.priceRange.minVariantPrice,
    fieldsNl,
    fieldsEn,
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

import { isShopifyConfigured } from "@/lib/shopify/client";

const FALLBACK_WINES: WineSummary[] = [
  {
    handle: "amsterdam-blend",
    title: "Amsterdam Blend",
    productType: "Red wine",
    image: { url: "/assets/wine-1.png", altText: "Amsterdam Blend" },
    price: { amount: "22.50", currencyCode: "EUR" },
    fieldsNl: { oneliner: "Krachtig, kruidig en ongefilterd.", origin: "Pfalz, Duitsland", country: "Duitsland" },
    fieldsEn: { oneliner: "Bold, spicy and unfiltered.", origin: "Pfalz, Germany", country: "Germany" },
  },
  {
    handle: "the-hustler",
    title: "The Hustler",
    productType: "White wine",
    image: { url: "/assets/wine-2.png", altText: "The Hustler" },
    price: { amount: "19.50", currencyCode: "EUR" },
    fieldsNl: { oneliner: "Fris, mineraal en strak wit.", origin: "Katalonië, Spanje", country: "Spanje" },
    fieldsEn: { oneliner: "Fresh, mineral and crisp white.", origin: "Catalonia, Spain", country: "Spain" },
  },
  {
    handle: "serenade",
    title: "Serenade",
    productType: "Orange wine",
    image: { url: "/assets/wine-1.png", altText: "Serenade" },
    price: { amount: "24.00", currencyCode: "EUR" },
    fieldsNl: { oneliner: "Maceratie op amfora, tannines en steenvruchten.", origin: "Veneto, Italië", country: "Italië" },
    fieldsEn: { oneliner: "Amphora maceration, gentle tannins and stone fruits.", origin: "Veneto, Italy", country: "Italy" },
  },
  {
    handle: "night-owl",
    title: "Night Owl",
    productType: "Pet nat",
    image: { url: "/assets/wine-2.png", altText: "Night Owl" },
    price: { amount: "21.00", currencyCode: "EUR" },
    fieldsNl: { oneliner: "Natuurlijk mousserend, levendig en troebel.", origin: "Burgenland, Oostenrijk", country: "Oostenrijk" },
    fieldsEn: { oneliner: "Naturally sparkling, vibrant and cloudy.", origin: "Burgenland, Austria", country: "Austria" },
  },
];

export async function getWineCatalog(): Promise<WineSummary[]> {
  if (!isShopifyConfigured()) return FALLBACK_WINES;
  try {
    return await fetchBilingualCollection(WINE_COLLECTION_HANDLE);
  } catch (err) {
    console.warn("Could not fetch wine catalog from Shopify, using fallbacks:", err);
    return FALLBACK_WINES;
  }
}

export async function getFeaturedWines(): Promise<WineSummary[]> {
  if (!isShopifyConfigured()) return FALLBACK_WINES;
  try {
    const featured = await fetchBilingualCollection(FEATURED_COLLECTION_HANDLE);
    if (featured.length > 0) return featured.slice(0, 5);
    const catalog = await fetchBilingualCollection(WINE_COLLECTION_HANDLE);
    return catalog.slice(0, 5);
  } catch (err) {
    console.warn("Could not fetch featured wines from Shopify, using fallbacks:", err);
    return FALLBACK_WINES;
  }
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
  const translation = WINE_TRANSLATIONS_NL[handle];

  const descEn = pickDescription(fieldsEn, (en ?? nl).descriptionHtml);
  const descNl = translation?.wineProfile ?? pickDescription(fieldsNl, nl.descriptionHtml) ?? descEn;

  const rawRegionEn = combineRegion(fieldsEn) ?? combineRegion(fieldsNl);
  const rawRegionNl = translation?.region ?? translateRegion(combineRegion(fieldsNl) ?? rawRegionEn, "nl");

  const experimentalVal = fieldsNl.experimental ?? fieldsEn.experimental;

  return {
    handle: nl.handle,
    title: nl.title,
    productType: nl.productType,
    image: nl.featuredImage,
    price: nl.priceRange.minVariantPrice,
    tagNl: translation?.oneliner ?? fieldsNl.oneliner ?? fieldsEn.oneliner ?? null,
    tagEn: fieldsEn.oneliner ?? fieldsNl.oneliner ?? null,
    descriptionNl: descNl,
    descriptionEn: descEn,
    grapesNl: translation?.grapes ?? fieldsNl.grape_variety ?? fieldsEn.grape_variety ?? null,
    grapesEn: fieldsEn.grape_variety ?? fieldsNl.grape_variety ?? null,
    abvNl: extractAbv(experimentalVal, descNl || descEn || "", "nl"),
    abvEn: extractAbv(experimentalVal, descEn || descNl || "", "en"),
    wineTypeNl: wineTypeLabel(nl.productType, "nl"),
    wineTypeEn: wineTypeLabel(nl.productType, "en"),
    regionNl: rawRegionNl,
    regionEn: rawRegionEn,
    foodPairingNl: translation?.pairing ?? fieldsNl.pairing ?? fieldsEn.pairing ?? null,
    foodPairingEn: fieldsEn.pairing ?? fieldsNl.pairing ?? null,
  };
}

export { wineTypeLabel } from "./wine-type-labels";
