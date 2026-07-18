// lib/cart/context.tsx
"use client";

import { createContext, useContext, useEffect, useState, useTransition, type ReactNode } from "react";
import { addToCartAction, getCartAction, removeCartLineAction, updateCartLineAction } from "./actions";
import type { Cart } from "@/lib/shopify/types";

type CartContextValue = {
  cart: Cart | null;
  isOpen: boolean;
  isPending: boolean;
  error: string | null;
  addItem: (shopifyHandle: string, quantity?: number) => void;
  updateLine: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  openCart: () => void;
  closeCart: () => void;
  dismissError: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await getCartAction();
      if (result.ok) setCart(result.cart);
    });
  }, []);

  function addItem(shopifyHandle: string, quantity = 1) {
    setError(null);
    startTransition(async () => {
      const result = await addToCartAction(shopifyHandle, quantity);
      if (result.ok) {
        setCart(result.cart);
      } else {
        setError(result.error);
      }
      // Open the drawer either way: on success to show the newly added item,
      // on failure so the error/fallback notice is actually visible instead
      // of failing silently (this is exactly the fallback UX Task 1a asks for).
      setIsOpen(true);
    });
  }

  function updateLine(lineId: string, quantity: number) {
    setError(null);
    startTransition(async () => {
      const result = await updateCartLineAction(lineId, quantity);
      if (result.ok) setCart(result.cart);
      else setError(result.error);
    });
  }

  function removeLine(lineId: string) {
    setError(null);
    startTransition(async () => {
      const result = await removeCartLineAction(lineId);
      if (result.ok) setCart(result.cart);
      else setError(result.error);
    });
  }

  const value: CartContextValue = {
    cart,
    isOpen,
    isPending,
    error,
    addItem,
    updateLine,
    removeLine,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    dismissError: () => setError(null),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
