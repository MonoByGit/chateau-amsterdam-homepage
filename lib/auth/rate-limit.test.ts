// lib/auth/rate-limit.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { checkRateLimit, recordFailedAttempt, resetRateLimiter } from "./rate-limit";

beforeEach(() => {
  resetRateLimiter();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("checkRateLimit / recordFailedAttempt", () => {
  it("allows the first attempt for a key with no prior failures", () => {
    expect(checkRateLimit("test@chateau.amsterdam")).toEqual({ allowed: true });
  });

  it("allows up to 5 failed attempts, then blocks the 6th", () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit("test@chateau.amsterdam")).toEqual({ allowed: true });
      recordFailedAttempt("test@chateau.amsterdam");
    }
    const result = checkRateLimit("test@chateau.amsterdam");
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("tracks attempts independently per key", () => {
    for (let i = 0; i < 5; i++) {
      recordFailedAttempt("locked-out@chateau.amsterdam");
    }
    expect(checkRateLimit("locked-out@chateau.amsterdam").allowed).toBe(false);
    expect(checkRateLimit("someone-else@chateau.amsterdam").allowed).toBe(true);
  });

  it("resets the block after the lockout window passes", () => {
    vi.useFakeTimers();
    for (let i = 0; i < 5; i++) {
      recordFailedAttempt("windowed@chateau.amsterdam");
    }
    expect(checkRateLimit("windowed@chateau.amsterdam").allowed).toBe(false);

    vi.advanceTimersByTime(15 * 60 * 1000 + 1);

    expect(checkRateLimit("windowed@chateau.amsterdam").allowed).toBe(true);
  });
});
