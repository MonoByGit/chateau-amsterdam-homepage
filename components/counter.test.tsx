import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { Counter } from "./counter";

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
});

describe("Counter", () => {
  it("renders 0 before becoming visible", () => {
    render(<Counter target={91} />);
    expect(screen.getByTestId("counter").textContent).toBe("0");
  });

  it("jumps straight to the target when prefers-reduced-motion is set", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("reduce"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    render(<Counter target={91} />);
    act(() => {
      observedCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    });
    expect(screen.getByTestId("counter").textContent).toBe("91");
  });

  it("formats with thousands dots when format='dots'", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("reduce"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    render(<Counter target={200000} format="dots" />);
    act(() => {
      observedCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    });
    expect(screen.getByTestId("counter").textContent).toBe((200000).toLocaleString("nl-NL"));
  });

  it("cancels the correct (second, still-pending) animation frame on unmount, not the first, already-fired one", () => {
    // Not reduced motion, so the component takes the requestAnimationFrame
    // tick-loop path instead of jumping straight to the target.
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    let nextId = 1;
    const scheduled = new Map<number, FrameRequestCallback>();
    const raf = vi.fn((cb: FrameRequestCallback) => {
      const id = nextId++;
      scheduled.set(id, cb);
      return id;
    });
    const caf = vi.fn((id: number) => {
      scheduled.delete(id);
    });
    vi.stubGlobal("requestAnimationFrame", raf);
    vi.stubGlobal("cancelAnimationFrame", caf);

    const { unmount } = render(<Counter target={91} />);

    act(() => {
      observedCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    });

    // The intersection kicked off exactly one pending frame request.
    expect(raf).toHaveBeenCalledTimes(1);
    const firstId = 1;
    expect(scheduled.has(firstId)).toBe(true);

    // Manually fire the first tick with a timestamp that keeps progress
    // under 1, so it reschedules a SECOND frame. This is the step a test
    // that only triggers the intersection and unmounts immediately would
    // never reach — and it's exactly the step needed to expose a stale
    // `rafId` that never gets reassigned on reschedule.
    const firstCallback = scheduled.get(firstId)!;
    // A real requestAnimationFrame callback is one-shot: once it fires,
    // it's no longer "pending" and cancelling it again would be a no-op.
    scheduled.delete(firstId);
    act(() => {
      firstCallback(performance.now());
    });

    expect(raf).toHaveBeenCalledTimes(2);
    const secondId = 2;
    expect(scheduled.has(secondId)).toBe(true);
    expect(scheduled.has(firstId)).toBe(false);

    unmount();

    // Effect cleanup must cancel the SECOND (still pending) frame, proving
    // rafId was reassigned on reschedule rather than left stale pointing at
    // the first, already-fired frame. If the reschedule inside `tick` ever
    // regresses to a bare `requestAnimationFrame(tick)` call (not assigned
    // back to `rafId`), this assertion fails because cancelAnimationFrame
    // would instead be called with the stale `firstId`.
    expect(caf).toHaveBeenCalledTimes(1);
    expect(caf).toHaveBeenCalledWith(secondId);
    expect(scheduled.size).toBe(0);
  });
});
