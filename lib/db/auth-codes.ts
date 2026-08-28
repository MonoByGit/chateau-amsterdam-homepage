import { randomBytes, randomInt, createHash } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "./client";
import { authCodes } from "./schema";
import { getOrCreateUserByEmail, type User } from "./users";

export const AUTH_CODE_EXPIRY_MINUTES = 15;
export const AUTH_CODE_EXPIRY_MS = AUTH_CODE_EXPIRY_MINUTES * 60 * 1000;
export const MAX_AUTH_ATTEMPTS = 3;

function hashCode(value: string): string {
  return createHash("sha256").update(value.trim()).digest("hex");
}

export function generateOtpCode(): string {
  return randomInt(100000, 1000000).toString();
}

export function generateMagicToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createAuthCode(email: string): Promise<{
  code: string;
  magicToken: string;
  expiresAt: Date;
}> {
  const normalizedEmail = email.trim().toLowerCase();
  const code = generateOtpCode();
  const magicToken = generateMagicToken();
  const codeHash = hashCode(code);
  const magicTokenHash = hashCode(magicToken);
  const expiresAt = new Date(Date.now() + AUTH_CODE_EXPIRY_MS);

  // Clean up any existing auth codes for this email
  await db.delete(authCodes).where(eq(authCodes.email, normalizedEmail));

  // Insert fresh auth code
  await db.insert(authCodes).values({
    email: normalizedEmail,
    codeHash,
    magicTokenHash,
    attempts: 0,
    expiresAt,
  });

  return { code, magicToken, expiresAt };
}

export type VerifyResult =
  | { success: true; user: User }
  | { success: false; reason: "not_found" | "expired" | "invalid_code" | "max_attempts"; remainingAttempts: number };

export async function verifyAuthCode(email: string, rawCode: string): Promise<VerifyResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const sanitizedCode = rawCode.replace(/\s+/g, "").trim();
  const codeHash = hashCode(sanitizedCode);

  const [record] = await db
    .select()
    .from(authCodes)
    .where(eq(authCodes.email, normalizedEmail))
    .limit(1);

  if (!record) {
    return { success: false, reason: "not_found", remainingAttempts: 0 };
  }

  // Check if expired
  if (record.expiresAt.getTime() <= Date.now()) {
    await db.delete(authCodes).where(eq(authCodes.id, record.id));
    return { success: false, reason: "expired", remainingAttempts: 0 };
  }

  // Check if already reached max attempts
  if (record.attempts >= MAX_AUTH_ATTEMPTS) {
    await db.delete(authCodes).where(eq(authCodes.id, record.id));
    return { success: false, reason: "max_attempts", remainingAttempts: 0 };
  }

  // Check if code matches
  if (record.codeHash !== codeHash) {
    const newAttempts = record.attempts + 1;
    const remaining = Math.max(0, MAX_AUTH_ATTEMPTS - newAttempts);

    if (remaining === 0) {
      await db.delete(authCodes).where(eq(authCodes.id, record.id));
      return { success: false, reason: "max_attempts", remainingAttempts: 0 };
    }

    await db.update(authCodes).set({ attempts: newAttempts }).where(eq(authCodes.id, record.id));
    return { success: false, reason: "invalid_code", remainingAttempts: remaining };
  }

  // Code is valid! Consume and delete the record
  await db.delete(authCodes).where(eq(authCodes.id, record.id));

  // Get or provision the user
  const user = await getOrCreateUserByEmail(normalizedEmail);
  return { success: true, user };
}

export async function verifyMagicToken(rawToken: string): Promise<{ success: true; user: User } | { success: false }> {
  const tokenHash = hashCode(rawToken.trim());

  const [record] = await db
    .select()
    .from(authCodes)
    .where(and(eq(authCodes.magicTokenHash, tokenHash), gt(authCodes.expiresAt, new Date())))
    .limit(1);

  if (!record) {
    return { success: false };
  }

  // Token is valid! Consume and delete
  await db.delete(authCodes).where(eq(authCodes.id, record.id));

  const user = await getOrCreateUserByEmail(record.email);
  return { success: true, user };
}
