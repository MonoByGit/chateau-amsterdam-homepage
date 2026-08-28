import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "./client";
import { authCodes, users, sessions } from "./schema";
import {
  createAuthCode,
  verifyAuthCode,
  verifyMagicToken,
  generateOtpCode,
  AUTH_CODE_EXPIRY_MS,
  MAX_AUTH_ATTEMPTS,
} from "./auth-codes";

async function cleanTables() {
  await db.delete(authCodes);
  await db.delete(sessions);
  await db.delete(users);
}

beforeEach(cleanTables);
afterEach(cleanTables);

describe("auth-codes OTP & magic link system", () => {
  it("generates a valid 6-digit OTP code", () => {
    for (let i = 0; i < 20; i++) {
      const code = generateOtpCode();
      expect(code).toMatch(/^[1-9][0-9]{5}$/);
      expect(code.length).toBe(6);
    }
  });

  it("creates an auth code with 15-minute expiry and clean state", async () => {
    const email = "floor@chateauamsterdam.nl";
    const before = Date.now();
    const { code, magicToken, expiresAt } = await createAuthCode(email);

    expect(code).toMatch(/^[0-9]{6}$/);
    expect(magicToken).toMatch(/^[0-9a-f]{64}$/);

    const diffMinutes = (expiresAt.getTime() - before) / (1000 * 60);
    expect(diffMinutes).toBeGreaterThanOrEqual(14.9);
    expect(diffMinutes).toBeLessThanOrEqual(15.1);

    const [record] = await db.select().from(authCodes).where(eq(authCodes.email, email));
    expect(record).toBeDefined();
    expect(record.attempts).toBe(0);
  });

  it("cleans up previous unused codes when a new code is requested for the same email", async () => {
    const email = "floor@chateauamsterdam.nl";
    await createAuthCode(email);
    const { code: newCode } = await createAuthCode(email);

    const records = await db.select().from(authCodes).where(eq(authCodes.email, email));
    expect(records.length).toBe(1);

    // Verifying the latest code works
    const result = await verifyAuthCode(email, newCode);
    expect(result.success).toBe(true);
  });

  it("successfully verifies valid OTP code and provisions user", async () => {
    const email = "collega@chateau.amsterdam";
    const { code } = await createAuthCode(email);

    const result = await verifyAuthCode(email, code);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.user.email).toBe(email);
    }

    // Code should be deleted after successful consumption
    const remaining = await db.select().from(authCodes).where(eq(authCodes.email, email));
    expect(remaining.length).toBe(0);
  });

  it("handles whitespace or formatted strings seamlessly", async () => {
    const email = "collega@chateau.amsterdam";
    const { code } = await createAuthCode(email);

    // Formatted e.g. "839 204" or with spaces
    const formatted = `${code.slice(0, 3)} ${code.slice(3)}`;
    const result = await verifyAuthCode(email, formatted);
    expect(result.success).toBe(true);
  });

  it("tracks remaining attempts and invalidates after 3 failed attempts", async () => {
    const email = "test@chateauamsterdam.nl";
    const { code } = await createAuthCode(email);

    // Attempt 1: wrong code
    const res1 = await verifyAuthCode(email, "000000");
    expect(res1.success).toBe(false);
    if (!res1.success) {
      expect(res1.reason).toBe("invalid_code");
      expect(res1.remainingAttempts).toBe(2);
    }

    // Attempt 2: wrong code
    const res2 = await verifyAuthCode(email, "111111");
    expect(res2.success).toBe(false);
    if (!res2.success) {
      expect(res2.reason).toBe("invalid_code");
      expect(res2.remainingAttempts).toBe(1);
    }

    // Attempt 3: wrong code -> reaches max attempts and is deleted
    const res3 = await verifyAuthCode(email, "222222");
    expect(res3.success).toBe(false);
    if (!res3.success) {
      expect(res3.reason).toBe("max_attempts");
      expect(res3.remainingAttempts).toBe(0);
    }

    // Attempt 4 with the originally correct code fails because it was invalidated
    const res4 = await verifyAuthCode(email, code);
    expect(res4.success).toBe(false);
    if (!res4.success) {
      expect(res4.reason).toBe("not_found");
    }
  });

  it("rejects expired auth codes", async () => {
    const email = "expired@chateauamsterdam.nl";
    const { code } = await createAuthCode(email);

    // Expire the code manually
    await db
      .update(authCodes)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(authCodes.email, email));

    const result = await verifyAuthCode(email, code);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toBe("expired");
    }
  });

  it("successfully verifies magic link tokens", async () => {
    const email = "magic@chateauamsterdam.nl";
    const { magicToken } = await createAuthCode(email);

    const result = await verifyMagicToken(magicToken);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.user.email).toBe(email);
    }

    // Subsequent call should fail because token was consumed
    const retry = await verifyMagicToken(magicToken);
    expect(retry.success).toBe(false);
  });
});
