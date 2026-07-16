import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useMagnetic } from "./use-magnetic";

function Probe({ strength = 0.3 }: { strength?: number }) {
  const ref = useMagnetic(strength);
  return (
    <button ref={ref as React.RefObject<HTMLButtonElement>} data-testid="target">
      CTA
    </button>
  );
}

function stubMatchMedia({ reducedMotion, hover }: { reducedMotion: boolean; hover: boolean }) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion") ? reducedMotion : hover,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("useMagnetic", () => {
  it("does not attach mousemove/mouseleave listeners when prefers-reduced-motion is set", () => {
    stubMatchMedia({ reducedMotion: true, hover: true });
    const addSpy = vi.spyOn(Element.prototype, "addEventListener");

    render(<Probe />);
    const el = screen.getByTestId("target");
    const eventsOnEl = addSpy.mock.calls
      .filter((_, i) => addSpy.mock.contexts[i] === el)
      .map((call) => call[0]);

    expect(eventsOnEl).not.toContain("mousemove");
    expect(eventsOnEl).not.toContain("mouseleave");
  });

  it("does not attach mousemove/mouseleave listeners when hover is not supported", () => {
    stubMatchMedia({ reducedMotion: false, hover: false });
    const addSpy = vi.spyOn(Element.prototype, "addEventListener");

    render(<Probe />);
    const el = screen.getByTestId("target");
    const eventsOnEl = addSpy.mock.calls
      .filter((_, i) => addSpy.mock.contexts[i] === el)
      .map((call) => call[0]);

    expect(eventsOnEl).not.toContain("mousemove");
    expect(eventsOnEl).not.toContain("mouseleave");
  });

  it("clears the pending transition-reset timeout on unmount instead of leaving it dangling", () => {
    stubMatchMedia({ reducedMotion: false, hover: true });
    vi.useFakeTimers();

    const { unmount } = render(<Probe />);
    const el = screen.getByTestId("target");

    fireEvent.mouseLeave(el);

    // The transition-reset setTimeout scheduled in onMouseLeave should be
    // the only pending timer at this point.
    expect(vi.getTimerCount()).toBe(1);

    unmount();

    // Effect cleanup must clear it — nothing left pending after unmount.
    // This is the regression case for the bug where the timeout was
    // scheduled inside onMouseLeave but never hoisted to effect scope,
    // so cleanup could never clear it (same bug shape as use-reveal.ts).
    expect(vi.getTimerCount()).toBe(0);
  });
});
