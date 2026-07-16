import { describe, it, expect } from "vitest";
import { generateSessionToken, hashSessionToken } from "./session";

describe("generateSessionToken", () => {
  it("returns a 64-character lowercase hex string (32 random bytes)", () => {
    const token = generateSessionToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("returns a different token on every call", () => {
    const a = generateSessionToken();
    const b = generateSessionToken();
    expect(a).not.toBe(b);
  });
});

describe("hashSessionToken", () => {
  it("returns a 64-character lowercase hex string (sha256 digest)", () => {
    const hash = hashSessionToken("some-token");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic: the same token always hashes to the same value", () => {
    const token = generateSessionToken();
    expect(hashSessionToken(token)).toBe(hashSessionToken(token));
  });

  it("produces different hashes for different tokens", () => {
    const a = generateSessionToken();
    const b = generateSessionToken();
    expect(hashSessionToken(a)).not.toBe(hashSessionToken(b));
  });
});
