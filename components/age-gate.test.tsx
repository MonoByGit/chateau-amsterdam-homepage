// components/age-gate.test.tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AgeGate } from "./age-gate";
import { LanguageProvider } from "@/lib/language";

function renderGate() {
  return render(
    <LanguageProvider>
      <AgeGate />
    </LanguageProvider>
  );
}

describe("AgeGate", () => {
  beforeEach(() => {
    localStorage.clear();
    // LanguageProvider detects the browser locale on mount and would otherwise
    // flip to English in jsdom's default "en-US" navigator.language.
    localStorage.setItem("preferred-lang", "nl");
  });

  it("shows the gate on a first visit (no stored verification)", async () => {
    renderGate();
    expect(await screen.findByText("Ben je 18 jaar of ouder?")).toBeInTheDocument();
  });

  it("does not render once age is already verified in localStorage", async () => {
    localStorage.setItem("age-verified", "yes");
    renderGate();
    await waitFor(() => {
      expect(screen.queryByText("Ben je 18 jaar of ouder?")).not.toBeInTheDocument();
    });
  });

  it("hides the gate and persists verification when confirming 18+", async () => {
    renderGate();
    await screen.findByText("Ben je 18 jaar of ouder?");

    fireEvent.click(screen.getByText("Ja, ik ben 18+"));

    expect(localStorage.getItem("age-verified")).toBe("yes");
    await waitFor(() => {
      expect(screen.queryByText("Ben je 18 jaar of ouder?")).not.toBeInTheDocument();
    });
  });

  it("redirects away from the site instead of just blocking when declining", async () => {
    const original = window.location;
    // jsdom doesn't implement real navigation; replace `location` with a
    // writable stub so we can assert the redirect target without jsdom
    // logging an "not implemented" navigation error.
    // @ts-expect-error -- test-only stub of a read-only global
    delete window.location;
    // @ts-expect-error -- deliberately loose test stub, not a real Location
    window.location = { href: "" };

    renderGate();
    await screen.findByText("Ben je 18 jaar of ouder?");

    fireEvent.click(screen.getByText("Nee"));

    expect(window.location.href).toBe("https://www.alcoholinfo.nl/");
    expect(localStorage.getItem("age-verified")).toBeNull();

    // @ts-expect-error -- restoring the real Location after the test stub above
    window.location = original;
  });
});
