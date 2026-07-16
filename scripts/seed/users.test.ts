import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { seedUsers } from "./users";

const PLACEHOLDER_EMAILS = [
  "team1@chateau.amsterdam",
  "team2@chateau.amsterdam",
  "team3@chateau.amsterdam",
  "team4@chateau.amsterdam",
];

async function cleanSeededUsers() {
  await db.delete(users).where(inArray(users.email, PLACEHOLDER_EMAILS));
}

beforeEach(cleanSeededUsers);
afterEach(cleanSeededUsers);

describe("seedUsers", () => {
  it("creates all 4 placeholder accounts with valid bcrypt password hashes", async () => {
    await seedUsers();

    const rows = await db.select().from(users).where(inArray(users.email, PLACEHOLDER_EMAILS));
    expect(rows).toHaveLength(4);
    for (const row of rows) {
      expect(PLACEHOLDER_EMAILS).toContain(row.email);
      expect(row.passwordHash).toMatch(/^\$2[aby]\$\d{2}\$/);
    }
  });

  it("is idempotent: running it twice still results in exactly 4 rows", async () => {
    await seedUsers();
    await seedUsers();

    const rows = await db.select().from(users).where(inArray(users.email, PLACEHOLDER_EMAILS));
    expect(rows).toHaveLength(4);
  });

  it("rotates the password hash on a second run rather than leaving it untouched", async () => {
    await seedUsers();
    const [before] = await db.select().from(users).where(inArray(users.email, ["team1@chateau.amsterdam"]));

    await seedUsers();
    const [after] = await db.select().from(users).where(inArray(users.email, ["team1@chateau.amsterdam"]));

    expect(after.passwordHash).not.toBe(before.passwordHash);
  });
});
