// lib/wines/catalog.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { getWineCatalog, getFeaturedWines, getWineByHandle } from "./catalog";

function mockProduct(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "gid://shopify/Product/1",
    handle: "100-gamay",
    title: "100% Gamay",
    productType: "Red wine",
    descriptionHtml: "<p>Light red wine.</p>",
    featuredImage: { url: "https://cdn.shopify.com/gamay.jpg", altText: null },
    priceRange: { minVariantPrice: { amount: "4.95", currencyCode: "EUR" } },
    metafields: [
      { key: "oneliner", value: "Fruity and refreshing" },
      { key: "region_of_origin", value: "Loire (Fr)" },
      null,
    ],
    ...overrides,
  };
}

function mockFetchImpl(byLanguage: Record<"NL" | "EN", unknown>) {
  return vi.fn().mockImplementation(async (url: string, init: { body: string }) => {
    const body = JSON.parse(init.body);
    const language = body.variables.language as "NL" | "EN";
    return { ok: true, json: async () => ({ data: byLanguage[language] }) };
  });
}

describe("getWineCatalog", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("merges NL and EN fetches into one bilingual list keyed by handle", async () => {
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "chateau-amsterdam-winery.myshopify.com");
    vi.stubEnv("SHOPIFY_STOREFRONT_TOKEN", "test-token");
    vi.stubGlobal(
      "fetch",
      mockFetchImpl({
        NL: { collectionByHandle: { products: { edges: [{ node: mockProduct() }] } } },
        EN: {
          collectionByHandle: {
            products: {
              edges: [{ node: mockProduct({ metafields: [{ key: "oneliner", value: "Fruity and refreshing EN" }] }) }],
            },
          },
        },
      })
    );

    const wines = await getWineCatalog();

    expect(wines).toHaveLength(1);
    expect(wines[0].handle).toBe("100-gamay");
    expect(wines[0].fieldsNl.oneliner).toBe("Fruity and refreshing");
    expect(wines[0].fieldsEn.oneliner).toBe("Fruity and refreshing EN");
  });

  it("returns an empty list when the collection doesn't exist", async () => {
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "chateau-amsterdam-winery.myshopify.com");
    vi.stubEnv("SHOPIFY_STOREFRONT_TOKEN", "test-token");
    vi.stubGlobal("fetch", mockFetchImpl({ NL: { collectionByHandle: null }, EN: { collectionByHandle: null } }));

    expect(await getWineCatalog()).toEqual([]);
  });
});

describe("getFeaturedWines", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("reads from the homepage collection handle, not all-wines", async () => {
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "chateau-amsterdam-winery.myshopify.com");
    vi.stubEnv("SHOPIFY_STOREFRONT_TOKEN", "test-token");
    const fetchMock = mockFetchImpl({
      NL: { collectionByHandle: { products: { edges: [] } } },
      EN: { collectionByHandle: { products: { edges: [] } } },
    });
    vi.stubGlobal("fetch", fetchMock);

    await getFeaturedWines();

    const firstCallBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(firstCallBody.variables.handle).toBe("homepage");
  });
});

describe("getWineByHandle", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("returns null when Shopify has no product with that handle", async () => {
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "chateau-amsterdam-winery.myshopify.com");
    vi.stubEnv("SHOPIFY_STOREFRONT_TOKEN", "test-token");
    vi.stubGlobal("fetch", mockFetchImpl({ NL: { productByHandle: null }, EN: { productByHandle: null } }));

    expect(await getWineByHandle("does-not-exist")).toBeNull();
  });

  it("prefers wine_profile over story over origin for the description, falling back to Shopify's own description", async () => {
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "chateau-amsterdam-winery.myshopify.com");
    vi.stubEnv("SHOPIFY_STOREFRONT_TOKEN", "test-token");
    vi.stubGlobal(
      "fetch",
      mockFetchImpl({
        NL: { productByHandle: mockProduct({ metafields: [{ key: "story", value: "Het verhaal" }] }) },
        EN: { productByHandle: mockProduct({ metafields: [{ key: "story", value: "The story" }] }) },
      })
    );

    const wine = await getWineByHandle("100-gamay");

    expect(wine?.descriptionNl).toBe("Het verhaal");
    expect(wine?.descriptionEn).toBe("The story");
  });
});
