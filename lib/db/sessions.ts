import { eq, gt, and } from "drizzle-orm";
import { db } from "./client";
import { sessions } from "./schema";
import { generateSessionToken, hashSessionToken } from "@/lib/auth/session";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessions).values({ userId, tokenHash, expiresAt });

  return { token, expiresAt };
}

export async function validateSession(token: string): Promise<{ userId: string } | null> {
  const tokenHash = hashSessionToken(token);
  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())))
    .limit(1);

  return session ? { userId: session.userId } : null;
}

export async function deleteSession(token: string): Promise<void> {
  const tokenHash = hashSessionToken(token);
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
}
