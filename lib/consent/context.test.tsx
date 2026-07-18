// lib/consent/context.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConsentProvider, useConsent } from "./context";

function Probe() {
  const { choice, hasChosen, acceptAll, rejectNonEssential } = useConsent();
  return (
    <div>
      <span data-testid="choice">{choice ?? "none"}</span>
      <span data-testid="has-chosen">{String(hasChosen)}</span>
      <button onClick={acceptAll}>accept-all</button>
      <button onClick={rejectNonEssential}>reject</button>
    </div>
  );
}

describe("ConsentProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to no choice (privacy-friendly: nothing non-essential loads yet)", () => {
    render(<ConsentProvider><Probe /></ConsentProvider>);
    expect(screen.getByTestId("choice").textContent).toBe("none");
    expect(screen.getByTestId("has-chosen").textContent).toBe("false");
  });

  it("reads a previously saved choice from localStorage on mount", () => {
    localStorage.setItem("cookie-consent", "all");
    render(<ConsentProvider><Probe /></ConsentProvider>);
    expect(screen.getByTestId("choice").textContent).toBe("all");
    expect(screen.getByTestId("has-chosen").textContent).toBe("true");
  });

  it("acceptAll sets and persists the 'all' choice", () => {
    render(<ConsentProvider><Probe /></ConsentProvider>);
    fireEvent.click(screen.getByText("accept-all"));
    expect(screen.getByTestId("choice").textContent).toBe("all");
    expect(localStorage.getItem("cookie-consent")).toBe("all");
  });

  it("rejectNonEssential sets and persists the 'essential-only' choice", () => {
    render(<ConsentProvider><Probe /></ConsentProvider>);
    fireEvent.click(screen.getByText("reject"));
    expect(screen.getByTestId("choice").textContent).toBe("essential-only");
    expect(localStorage.getItem("cookie-consent")).toBe("essential-only");
  });

  it("ignores a corrupted/unrecognized stored value and treats it as no choice", () => {
    localStorage.setItem("cookie-consent", "yes-please");
    render(<ConsentProvider><Probe /></ConsentProvider>);
    expect(screen.getByTestId("choice").textContent).toBe("none");
    expect(screen.getByTestId("has-chosen").textContent).toBe("false");
  });
});
