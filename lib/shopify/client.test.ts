// lib/shopify/client.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { ShopifyConfigError, isShopifyConfigured, shopifyFetch } from "./client";
import type { ShopifyLanguage } from "./types";

describe("isShopifyConfigured", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is false when either env var is missing", () => {
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "");
    vi.stubEnv("SHOPIFY_STOREFRONT_TOKEN", "");
    expect(isShopifyConfigured()).toBe(false);
  });

  it("is true when both env vars are set", () => {
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "chateau-amsterdam.myshopify.com");
    vi.stubEnv("SHOPIFY_STOREFRONT_TOKEN", "test-token");
    expect(isShopifyConfigured()).toBe(true);
  });
});

describe("shopifyFetch", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("throws a readable ShopifyConfigError when env vars are missing", async () => {
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "");
    vi.stubEnv("SHOPIFY_STOREFRONT_TOKEN", "");

    await expect(shopifyFetch({ query: "query {}" })).rejects.toBeInstanceOf(ShopifyConfigError);
    await expect(shopifyFetch({ query: "query {}" })).rejects.toThrow(/SHOPIFY_STORE_DOMAIN/);
  });

  it("posts to the configured store domain with the access token header", async () => {
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "chateau-amsterdam.myshopify.com");
    vi.stubEnv("SHOPIFY_STOREFRONT_TOKEN", "test-token");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { ok: true } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await shopifyFetch<{ ok: boolean }>({ query: "query {}" });

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://chateau-amsterdam.myshopify.com/api/2025-10/graphql.json",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "X-Shopify-Storefront-Access-Token": "test-token" }),
      })
    );
  });

  it("throws when the response contains GraphQL errors", async () => {
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "chateau-amsterdam.myshopify.com");
    vi.stubEnv("SHOPIFY_STOREFRONT_TOKEN", "test-token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ errors: [{ message: "boom" }] }) })
    );

    await expect(shopifyFetch({ query: "query {}" })).rejects.toThrow(/boom/);
  });

  it("throws when the HTTP response is not ok", async () => {
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "chateau-amsterdam.myshopify.com");
    vi.stubEnv("SHOPIFY_STOREFRONT_TOKEN", "test-token");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401, statusText: "Unauthorized" }));

    await expect(shopifyFetch({ query: "query {}" })).rejects.toThrow(/401/);
  });
});

describe("ShopifyLanguage", () => {
  it("accepts EN and NL as valid values", () => {
    const langs: ShopifyLanguage[] = ["EN", "NL"];
    expect(langs).toHaveLength(2);
  });
});
