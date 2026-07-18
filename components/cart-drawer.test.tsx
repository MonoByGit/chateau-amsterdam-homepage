// components/cart-drawer.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CartDrawer } from "./cart-drawer";
import { CartProvider, useCart } from "@/lib/cart/context";
import { LanguageProvider } from "@/lib/language";
import * as actions from "@/lib/cart/actions";
import { EMPTY_CART_FIXTURE, FILLED_CART_FIXTURE } from "@/lib/shopify/fixtures";

vi.mock("@/lib/cart/actions", () => ({
  getCartAction: vi.fn(),
  addToCartAction: vi.fn(),
  updateCartLineAction: vi.fn(),
  removeCartLineAction: vi.fn(),
}));

function AddItemButton() {
  const { addItem } = useCart();
  return (
    <button type="button" onClick={() => addItem("amber-blend")}>
      add
    </button>
  );
}

function renderDrawer() {
  return render(
    <LanguageProvider>
      <CartProvider>
        <AddItemButton />
        <CartDrawer />
      </CartProvider>
    </LanguageProvider>
  );
}

describe("CartDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // LanguageProvider detects the browser locale on mount and would otherwise
    // flip to English in jsdom's default "en-US" navigator.language, making
    // the Dutch assertions below flaky depending on test order.
    window.localStorage.setItem("preferred-lang", "nl");
    vi.mocked(actions.getCartAction).mockResolvedValue({ ok: true, cart: null });
  });

  it("shows the empty state when the cart has no lines", async () => {
    vi.mocked(actions.addToCartAction).mockResolvedValue({ ok: true, cart: EMPTY_CART_FIXTURE });
    renderDrawer();

    fireEvent.click(screen.getByText("add"));

    expect(await screen.findByText("Je winkelmandje is nog leeg.")).toBeInTheDocument();
  });

  it("renders every line from a filled cart fixture, with subtotal and checkout link", async () => {
    vi.mocked(actions.addToCartAction).mockResolvedValue({ ok: true, cart: FILLED_CART_FIXTURE });
    renderDrawer();

    fireEvent.click(screen.getByText("add"));

    expect(await screen.findByText("Amber Blend")).toBeInTheDocument();
    expect(screen.getByText("Pinot Noir")).toBeInTheDocument();
    expect(screen.getByText("Afrekenen")).toHaveAttribute("href", FILLED_CART_FIXTURE.checkoutUrl);
  });

  it("opens the drawer and shows a shop fallback link when Shopify isn't configured yet", async () => {
    vi.mocked(actions.addToCartAction).mockResolvedValue({ ok: false, error: "shopify_not_configured" });
    renderDrawer();

    fireEvent.click(screen.getByText("add"));

    expect(await screen.findByText(/shop\.chateau\.amsterdam/)).toBeInTheDocument();
  });

  it("removes a line when its remove button is clicked", async () => {
    vi.mocked(actions.addToCartAction).mockResolvedValue({ ok: true, cart: FILLED_CART_FIXTURE });
    vi.mocked(actions.removeCartLineAction).mockResolvedValue({ ok: true, cart: EMPTY_CART_FIXTURE });
    renderDrawer();

    fireEvent.click(screen.getByText("add"));
    await screen.findByText("Amber Blend");

    fireEvent.click(screen.getAllByText("Verwijderen")[0]);

    expect(await screen.findByText("Je winkelmandje is nog leeg.")).toBeInTheDocument();
    expect(actions.removeCartLineAction).toHaveBeenCalledWith(FILLED_CART_FIXTURE.lines[0].id);
  });
});
