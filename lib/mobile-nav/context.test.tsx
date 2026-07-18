// lib/mobile-nav/context.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileNavProvider, useMobileNav } from "./context";

function Probe() {
  const { isOpen, toggle, close } = useMobileNav();
  return (
    <div>
      <span data-testid="open">{String(isOpen)}</span>
      <button onClick={toggle}>toggle</button>
      <button onClick={close}>close</button>
    </div>
  );
}

describe("MobileNavProvider", () => {
  it("starts closed", () => {
    render(<MobileNavProvider><Probe /></MobileNavProvider>);
    expect(screen.getByTestId("open").textContent).toBe("false");
  });

  it("toggle flips open/closed", () => {
    render(<MobileNavProvider><Probe /></MobileNavProvider>);
    fireEvent.click(screen.getByText("toggle"));
    expect(screen.getByTestId("open").textContent).toBe("true");
    fireEvent.click(screen.getByText("toggle"));
    expect(screen.getByTestId("open").textContent).toBe("false");
  });

  it("close always sets isOpen to false", () => {
    render(<MobileNavProvider><Probe /></MobileNavProvider>);
    fireEvent.click(screen.getByText("toggle"));
    fireEvent.click(screen.getByText("close"));
    expect(screen.getByTestId("open").textContent).toBe("false");
  });

  it("locks body scroll while open and restores it on close", () => {
    render(<MobileNavProvider><Probe /></MobileNavProvider>);
    fireEvent.click(screen.getByText("toggle"));
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.click(screen.getByText("close"));
    expect(document.body.style.overflow).toBe("");
  });
});
