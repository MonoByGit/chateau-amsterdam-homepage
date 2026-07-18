// components/cart-drawer.tsx
"use client";

import { useLanguage } from "@/lib/language";
import { useCart } from "@/lib/cart/context";
import { SHOPIFY_NOT_CONFIGURED_ERROR } from "@/lib/shopify/client";
import type { Cart, CartLine } from "@/lib/shopify/types";

function formatMoney(amount: string, currencyCode: string, locale: string): string {
  const value = Number(amount);
  if (Number.isNaN(value)) return amount;
  return new Intl.NumberFormat(locale, { style: "currency", currency: currencyCode }).format(value);
}

function CartLineRow({ line, locale }: { line: CartLine; locale: string }) {
  const { updateLine, removeLine, isPending } = useCart();
  const { t } = useLanguage();

  return (
    <div className="cart-line">
      <div className="cart-line-img">
        {line.image ? <img src={line.image.url} alt={line.image.altText ?? line.title} /> : null}
      </div>
      <div className="cart-line-body">
        <span className="cart-line-title">{line.title}</span>
        {line.variantTitle ? <span className="cart-line-variant">{line.variantTitle}</span> : null}
        <span className="cart-line-price">{formatMoney(line.price.amount, line.price.currencyCode, locale)}</span>
        <div className="cart-line-qty">
          <button
            type="button"
            aria-label={t("Verminder aantal", "Decrease quantity")}
            disabled={isPending}
            onClick={() => updateLine(line.id, line.quantity - 1)}
          >
            −
          </button>
          <span>{line.quantity}</span>
          <button
            type="button"
            aria-label={t("Verhoog aantal", "Increase quantity")}
            disabled={isPending}
            onClick={() => updateLine(line.id, line.quantity + 1)}
          >
            +
          </button>
        </div>
      </div>
      <button
        type="button"
        className="cart-line-remove"
        aria-label={t("Verwijder uit winkelmandje", "Remove from cart")}
        disabled={isPending}
        onClick={() => removeLine(line.id)}
      >
        {t("Verwijderen", "Remove")}
      </button>
    </div>
  );
}

function CartErrorNotice({ error }: { error: string }) {
  const { t } = useLanguage();

  if (error === SHOPIFY_NOT_CONFIGURED_ERROR) {
    return (
      <div className="cart-error">
        <p>
          {t(
            "Het winkelmandje is nog niet aangesloten. Bestel deze fles direct via onze shop.",
            "The cart isn't connected yet. Order this bottle directly via our shop."
          )}
        </p>
        <a href="https://shop.chateau.amsterdam" className="cart-error-link">
          shop.chateau.amsterdam →
        </a>
      </div>
    );
  }

  return (
    <div className="cart-error">
      <p>{t("Er ging iets mis met het winkelmandje. Probeer het opnieuw.", "Something went wrong with the cart. Please try again.")}</p>
    </div>
  );
}

function CartSummary({ cart, locale }: { cart: Cart; locale: string }) {
  const { t } = useLanguage();

  return (
    <div className="cart-summary">
      <div className="cart-subtotal">
        <span>{t("Subtotaal", "Subtotal")}</span>
        <span>{formatMoney(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode, locale)}</span>
      </div>
      <a className="btn btn--primary cart-checkout" href={cart.checkoutUrl}>
        {t("Afrekenen", "Checkout")} <span className="arr">→</span>
      </a>
    </div>
  );
}

export function CartDrawer() {
  const { cart, isOpen, error, closeCart } = useCart();
  const { lang, t } = useLanguage();
  const locale = lang === "nl" ? "nl-NL" : "en-US";

  return (
    <>
      <div className={`cart-overlay${isOpen ? " is-open" : ""}`} onClick={closeCart} aria-hidden={!isOpen} />
      <aside className={`cart-drawer${isOpen ? " is-open" : ""}`} aria-label={t("Winkelmandje", "Cart")} aria-hidden={!isOpen}>
        <div className="cart-drawer-head">
          <span className="label">{t("Winkelmandje", "Cart")}</span>
          <button type="button" className="cart-close" aria-label={t("Sluiten", "Close")} onClick={closeCart}>
            ✕
          </button>
        </div>

        <div className="cart-drawer-body">
          {error ? <CartErrorNotice error={error} /> : null}

          {!error && cart && cart.lines.length > 0 ? (
            <div className="cart-lines">
              {cart.lines.map((line) => (
                <CartLineRow key={line.id} line={line} locale={locale} />
              ))}
            </div>
          ) : null}

          {!error && (!cart || cart.lines.length === 0) ? (
            <p className="cart-empty">{t("Je winkelmandje is nog leeg.", "Your cart is empty.")}</p>
          ) : null}
        </div>

        {!error && cart && cart.lines.length > 0 ? <CartSummary cart={cart} locale={locale} /> : null}
      </aside>
    </>
  );
}
