// lib/shopify/cart.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { addCartLines, createCart, getCart, removeCartLine, updateCartLine } from "./cart";
import { shopifyFetch } from "./client";

vi.mock("./client", () => ({ shopifyFetch: vi.fn() }));

const rawCart = {
  id: "gid://shopify/Cart/1",
  checkoutUrl: "https://shop.chateau.amsterdam/cart/c/1",
  totalQuantity: 2,
  cost: {
    subtotalAmount: { amount: "45.00", currencyCode: "EUR" },
    totalAmount: { amount: "45.00", currencyCode: "EUR" },
  },
  lines: {
    edges: [
      {
        node: {
          id: "gid://shopify/CartLine/1",
          quantity: 2,
          merchandise: {
            id: "gid://shopify/ProductVariant/1",
            title: "Default Title",
            price: { amount: "22.50", currencyCode: "EUR" },
            image: { url: "/img.png", altText: "Amber Blend" },
            product: { title: "Amber Blend" },
          },
        },
      },
    ],
  },
};

describe("cart repository", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("createCart maps the Shopify cartCreate response into our Cart shape", async () => {
    vi.mocked(shopifyFetch).mockResolvedValue({ cartCreate: { cart: rawCart, userErrors: [] } });

    const cart = await createCart("gid://shopify/ProductVariant/1", 2);

    expect(cart.id).toBe("gid://shopify/Cart/1");
    expect(cart.lines).toHaveLength(1);
    expect(cart.lines[0]).toEqual({
      id: "gid://shopify/CartLine/1",
      quantity: 2,
      merchandiseId: "gid://shopify/ProductVariant/1",
      title: "Amber Blend",
      variantTitle: null,
      price: { amount: "22.50", currencyCode: "EUR" },
      image: { url: "/img.png", altText: "Amber Blend" },
    });
  });

  it("createCart throws on Shopify userErrors", async () => {
    vi.mocked(shopifyFetch).mockResolvedValue({
      cartCreate: { cart: null, userErrors: [{ field: ["lines"], message: "Variant not found" }] },
    });

    await expect(createCart("gid://shopify/ProductVariant/1", 1)).rejects.toThrow(/Variant not found/);
  });

  it("getCart returns null when Shopify has no cart for that id", async () => {
    vi.mocked(shopifyFetch).mockResolvedValue({ cart: null });
    expect(await getCart("gid://shopify/Cart/does-not-exist")).toBeNull();
  });

  it("addCartLines, updateCartLine, removeCartLine all map their respective mutation responses", async () => {
    vi.mocked(shopifyFetch).mockResolvedValue({ cartLinesAdd: { cart: rawCart, userErrors: [] } });
    expect((await addCartLines("gid://shopify/Cart/1", "gid://shopify/ProductVariant/1", 1)).id).toBe(
      "gid://shopify/Cart/1"
    );

    vi.mocked(shopifyFetch).mockResolvedValue({ cartLinesUpdate: { cart: rawCart, userErrors: [] } });
    expect((await updateCartLine("gid://shopify/Cart/1", "gid://shopify/CartLine/1", 3)).totalQuantity).toBe(2);

    vi.mocked(shopifyFetch).mockResolvedValue({ cartLinesRemove: { cart: rawCart, userErrors: [] } });
    expect((await removeCartLine("gid://shopify/Cart/1", "gid://shopify/CartLine/1")).lines).toHaveLength(1);
  });
});
