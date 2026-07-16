import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("hashPassword", () => {
  it("returns a bcrypt hash, not the plain password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(hash).not.toBe("correct horse battery staple");
    expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/);
  });

  it("produces a different hash for the same password on each call (random salt)", async () => {
    const a = await hashPassword("same-password");
    const b = await hashPassword("same-password");
    expect(a).not.toBe(b);
  });
});

describe("verifyPassword", () => {
  it("returns true for the correct plain-text password", async () => {
    const hash = await hashPassword("s3cret!");
    await expect(verifyPassword("s3cret!", hash)).resolves.toBe(true);
  });

  it("returns false for an incorrect plain-text password", async () => {
    const hash = await hashPassword("s3cret!");
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });
});
