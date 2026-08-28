import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { seedUsers, INITIAL_USERS } from "./users";

async function cleanSeededUsers() {
  await db.delete(users).where(inArray(users.email, [...INITIAL_USERS]));
}

beforeEach(cleanSeededUsers);
afterEach(cleanSeededUsers);

describe("seedUsers", () => {
  it("creates all 4 initial Chateau team & admin accounts", async () => {
    await seedUsers();

    const rows = await db.select().from(users).where(inArray(users.email, [...INITIAL_USERS]));
    expect(rows).toHaveLength(4);
    for (const row of rows) {
      expect([...INITIAL_USERS]).toContain(row.email);
    }
  });

  it("is idempotent: running it twice still results in exactly 4 rows", async () => {
    await seedUsers();
    await seedUsers();

    const rows = await db.select().from(users).where(inArray(users.email, [...INITIAL_USERS]));
    expect(rows).toHaveLength(4);
  });
});
