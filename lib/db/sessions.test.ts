import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "./client";
import { sessions, users } from "./schema";
import { createUser } from "./users";
import { createSession, validateSession, deleteSession } from "./sessions";
import { hashSessionToken } from "@/lib/auth/session";

async function cleanTables() {
  await db.delete(sessions);
  await db.delete(users);
}

beforeEach(cleanTables);
afterEach(cleanTables);

describe("sessions repository", () => {
  it("creates a session with a ~30-day expiry and returns the raw token", async () => {
    const user = await createUser("session-user@chateau.amsterdam", "hashed-password");
    const before = Date.now();
    const { token, expiresAt } = await createSession(user.id);

    expect(token).toMatch(/^[0-9a-f]{64}$/);
    const daysUntilExpiry = (expiresAt.getTime() - before) / (1000 * 60 * 60 * 24);
    expect(daysUntilExpiry).toBeGreaterThan(29.9);
    expect(daysUntilExpiry).toBeLessThan(30.1);
  });

  it("validates a session created for a real token and returns the owning userId", async () => {
    const user = await createUser("valid-session@chateau.amsterdam", "hashed-password");
    const { token } = await createSession(user.id);

    const result = await validateSession(token);
    expect(result).toEqual({ userId: user.id });
  });

  it("returns null for a token that was never issued", async () => {
    const result = await validateSession("0".repeat(64));
    expect(result).toBeNull();
  });

  it("returns null for an expired session", async () => {
    const user = await createUser("expired-session@chateau.amsterdam", "hashed-password");
    const { token } = await createSession(user.id);

    await db
      .update(sessions)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(sessions.tokenHash, hashSessionToken(token)));

    const result = await validateSession(token);
    expect(result).toBeNull();
  });

  it("deletes a session so a subsequent validateSession call returns null", async () => {
    const user = await createUser("logout-user@chateau.amsterdam", "hashed-password");
    const { token } = await createSession(user.id);

    await deleteSession(token);

    const result = await validateSession(token);
    expect(result).toBeNull();
  });
});
