import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { useReveal } from "./use-reveal";

function Probe({ delay = 0 }: { delay?: number }) {
  const { ref, isVisible } = useReveal(delay);
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} data-testid="target">
      {isVisible ? "visible" : "hidden"}
    </div>
  );
}

let observedCallback: IntersectionObserverCallback;

beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    vi.fn().mockImplementation((cb: IntersectionObserverCallback) => {
      observedCallback = cb;
      return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
    })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("useReveal", () => {
  it("starts hidden", () => {
    render(<Probe />);
    expect(screen.getByTestId("target").textContent).toBe("hidden");
  });

  it("becomes visible immediately when intersecting with no delay", () => {
    render(<Probe delay={0} />);
    act(() => {
      observedCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    });
    expect(screen.getByTestId("target").textContent).toBe("visible");
  });

  it("waits for the given delay before becoming visible", () => {
    vi.useFakeTimers();
    render(<Probe delay={0.2} />);
    act(() => {
      observedCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    });
    expect(screen.getByTestId("target").textContent).toBe("hidden");
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByTestId("target").textContent).toBe("visible");
  });

  it("does not become visible when not intersecting", () => {
    render(<Probe />);
    act(() => {
      observedCallback([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver);
    });
    expect(screen.getByTestId("target").textContent).toBe("hidden");
  });

  it("clears the pending timeout on unmount instead of leaving it dangling", () => {
    vi.useFakeTimers();
    const { unmount } = render(<Probe delay={0.5} />);

    act(() => {
      observedCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    });

    // The delayed reveal's setTimeout should be the only pending timer.
    expect(vi.getTimerCount()).toBe(1);

    unmount();

    // Effect cleanup must clear it — nothing left pending after unmount.
    expect(vi.getTimerCount()).toBe(0);

    // Advancing timers past the delay must not throw or try to update
    // the unmounted component (this is the regression case for the bug
    // where the cleanup was mistakenly returned from inside the
    // IntersectionObserver callback instead of from the effect itself,
    // which meant it never actually ran and the timeout kept firing).
    expect(() => {
      act(() => {
        vi.advanceTimersByTime(500);
      });
    }).not.toThrow();
  });
});
