// components/add-to-cart-button.tsx
"use client";

import { useLanguage } from "@/lib/language";
import { useCart } from "@/lib/cart/context";
import { SHOPIFY_NOT_CONFIGURED_ERROR } from "@/lib/shopify/client";

export function AddToCartButton({ shopifyHandle }: { shopifyHandle: string }) {
  const { addItem, isPending, error } = useCart();
  const { t } = useLanguage();

  const showInlineFallback = error === SHOPIFY_NOT_CONFIGURED_ERROR;

  return (
    <div>
      <button
        type="button"
        className="btn btn--primary"
        disabled={isPending}
        onClick={() => addItem(shopifyHandle)}
      >
        {t("In winkelmandje", "Add to cart")} <span className="arr">→</span>
      </button>
      {showInlineFallback ? (
        <p className="add-to-cart-error">
          {t("Bestel deze fles alvast rechtstreeks via ", "Order this bottle directly via ")}
          <a href={`https://shop.chateau.amsterdam/products/${shopifyHandle}`}>shop.chateau.amsterdam</a>.
        </p>
      ) : null}
    </div>
  );
}
