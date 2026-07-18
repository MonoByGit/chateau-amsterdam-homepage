// lib/cart/actions.ts
"use server";

import { cookies } from "next/headers";
import { addCartLines, createCart, getCart, removeCartLine, updateCartLine } from "@/lib/shopify/cart";
import { isShopifyConfigured, SHOPIFY_NOT_CONFIGURED_ERROR } from "@/lib/shopify/client";
import { firstAvailableVariant, getProductByHandle } from "@/lib/shopify/product";
import type { CartActionResult } from "@/lib/shopify/types";

const CART_COOKIE = "chateau_cart_id";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, matches a typical Shopify cart lifetime

async function getCartId(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

async function setCartId(cartId: string): Promise<void> {
  const store = await cookies();
  store.set(CART_COOKIE, cartId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
  });
}

function errorResult(error: unknown): CartActionResult {
  return { ok: false, error: error instanceof Error ? error.message : "Onbekende fout." };
}

export async function getCartAction(): Promise<CartActionResult> {
  if (!isShopifyConfigured()) {
    return { ok: true, cart: null };
  }
  try {
    const cartId = await getCartId();
    if (!cartId) {
      return { ok: true, cart: null };
    }
    return { ok: true, cart: await getCart(cartId) };
  } catch (error) {
    return errorResult(error);
  }
}

export async function addToCartAction(shopifyHandle: string, quantity = 1): Promise<CartActionResult> {
  if (!isShopifyConfigured()) {
    return { ok: false, error: SHOPIFY_NOT_CONFIGURED_ERROR };
  }
  try {
    const product = await getProductByHandle(shopifyHandle);
    if (!product) {
      return { ok: false, error: `Kon deze fles niet vinden in de shop ("${shopifyHandle}").` };
    }
    const variant = firstAvailableVariant(product);
    if (!variant) {
      return { ok: false, error: "Deze fles is momenteel niet op voorraad." };
    }

    const existingCartId = await getCartId();
    const cart = existingCartId
      ? await addCartLines(existingCartId, variant.id, quantity)
      : await createCart(variant.id, quantity);

    await setCartId(cart.id);
    return { ok: true, cart };
  } catch (error) {
    return errorResult(error);
  }
}

export async function updateCartLineAction(lineId: string, quantity: number): Promise<CartActionResult> {
  try {
    const cartId = await getCartId();
    if (!cartId) {
      return { ok: false, error: "Geen winkelmandje gevonden." };
    }
    const cart = quantity <= 0 ? await removeCartLine(cartId, lineId) : await updateCartLine(cartId, lineId, quantity);
    return { ok: true, cart };
  } catch (error) {
    return errorResult(error);
  }
}

export async function removeCartLineAction(lineId: string): Promise<CartActionResult> {
  try {
    const cartId = await getCartId();
    if (!cartId) {
      return { ok: false, error: "Geen winkelmandje gevonden." };
    }
    return { ok: true, cart: await removeCartLine(cartId, lineId) };
  } catch (error) {
    return errorResult(error);
  }
}
