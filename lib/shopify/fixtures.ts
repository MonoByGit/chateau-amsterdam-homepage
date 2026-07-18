// lib/shopify/fixtures.ts
// Local, static cart data for building and testing the cart drawer UI without
// a real Shopify token. Not used by any production code path — only by tests
// and, optionally, manual UI dev.
import type { Cart } from "./types";

export const EMPTY_CART_FIXTURE: Cart = {
  id: "gid://shopify/Cart/fixture-empty",
  checkoutUrl: "https://shop.chateau.amsterdam/cart",
  totalQuantity: 0,
  cost: {
    subtotalAmount: { amount: "0.00", currencyCode: "EUR" },
    totalAmount: { amount: "0.00", currencyCode: "EUR" },
  },
  lines: [],
};

export const FILLED_CART_FIXTURE: Cart = {
  id: "gid://shopify/Cart/fixture-filled",
  checkoutUrl: "https://shop.chateau.amsterdam/cart/c/fixture-filled",
  totalQuantity: 3,
  cost: {
    subtotalAmount: { amount: "67.50", currencyCode: "EUR" },
    totalAmount: { amount: "67.50", currencyCode: "EUR" },
  },
  lines: [
    {
      id: "gid://shopify/CartLine/1",
      quantity: 2,
      merchandiseId: "gid://shopify/ProductVariant/1",
      title: "Amber Blend",
      variantTitle: null,
      price: { amount: "22.50", currencyCode: "EUR" },
      image: { url: "/assets/wine-1.png", altText: "Amber Blend" },
    },
    {
      id: "gid://shopify/CartLine/2",
      quantity: 1,
      merchandiseId: "gid://shopify/ProductVariant/2",
      title: "Pinot Noir",
      variantTitle: null,
      price: { amount: "22.50", currencyCode: "EUR" },
      image: { url: "/assets/wine-2.png", altText: "Pinot Noir" },
    },
  ],
};
