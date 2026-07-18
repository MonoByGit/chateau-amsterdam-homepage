// lib/shopify/cart.ts
import { shopifyFetch } from "./client";
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
} from "./queries";
import type { Cart, ShopifyMoney } from "./types";

type RawCartLineEdge = {
  node: {
    id: string;
    quantity: number;
    merchandise: {
      id: string;
      title: string;
      price: ShopifyMoney;
      image: { url: string; altText: string | null } | null;
      product: { title: string };
    };
  };
};

type RawCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: ShopifyMoney; totalAmount: ShopifyMoney };
  lines: { edges: RawCartLineEdge[] };
};

function mapCart(raw: RawCart): Cart {
  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl,
    totalQuantity: raw.totalQuantity,
    cost: raw.cost,
    lines: raw.lines.edges.map(({ node }) => ({
      id: node.id,
      quantity: node.quantity,
      merchandiseId: node.merchandise.id,
      title: node.merchandise.product.title,
      variantTitle: node.merchandise.title === "Default Title" ? null : node.merchandise.title,
      price: node.merchandise.price,
      image: node.merchandise.image,
    })),
  };
}

function throwOnUserErrors(userErrors: { field: string[]; message: string }[] | undefined): void {
  if (userErrors && userErrors.length > 0) {
    throw new Error(userErrors.map((e) => e.message).join(" "));
  }
}

export async function createCart(merchandiseId: string, quantity: number): Promise<Cart> {
  const data = await shopifyFetch<{
    cartCreate: { cart: RawCart | null; userErrors: { field: string[]; message: string }[] };
  }>({
    query: CART_CREATE_MUTATION,
    variables: { lines: [{ merchandiseId, quantity }] },
  });
  throwOnUserErrors(data.cartCreate.userErrors);
  if (!data.cartCreate.cart) {
    throw new Error("Shopify kon geen winkelmandje aanmaken.");
  }
  return mapCart(data.cartCreate.cart);
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await shopifyFetch<{ cart: RawCart | null }>({
    query: CART_QUERY,
    variables: { cartId },
  });
  return data.cart ? mapCart(data.cart) : null;
}

export async function addCartLines(cartId: string, merchandiseId: string, quantity: number): Promise<Cart> {
  const data = await shopifyFetch<{
    cartLinesAdd: { cart: RawCart | null; userErrors: { field: string[]; message: string }[] };
  }>({
    query: CART_LINES_ADD_MUTATION,
    variables: { cartId, lines: [{ merchandiseId, quantity }] },
  });
  throwOnUserErrors(data.cartLinesAdd.userErrors);
  if (!data.cartLinesAdd.cart) {
    throw new Error("Shopify kon dit product niet aan het winkelmandje toevoegen.");
  }
  return mapCart(data.cartLinesAdd.cart);
}

export async function updateCartLine(cartId: string, lineId: string, quantity: number): Promise<Cart> {
  const data = await shopifyFetch<{
    cartLinesUpdate: { cart: RawCart | null; userErrors: { field: string[]; message: string }[] };
  }>({
    query: CART_LINES_UPDATE_MUTATION,
    variables: { cartId, lines: [{ id: lineId, quantity }] },
  });
  throwOnUserErrors(data.cartLinesUpdate.userErrors);
  if (!data.cartLinesUpdate.cart) {
    throw new Error("Shopify kon de hoeveelheid niet aanpassen.");
  }
  return mapCart(data.cartLinesUpdate.cart);
}

export async function removeCartLine(cartId: string, lineId: string): Promise<Cart> {
  const data = await shopifyFetch<{
    cartLinesRemove: { cart: RawCart | null; userErrors: { field: string[]; message: string }[] };
  }>({
    query: CART_LINES_REMOVE_MUTATION,
    variables: { cartId, lineIds: [lineId] },
  });
  throwOnUserErrors(data.cartLinesRemove.userErrors);
  if (!data.cartLinesRemove.cart) {
    throw new Error("Shopify kon deze regel niet verwijderen.");
  }
  return mapCart(data.cartLinesRemove.cart);
}
