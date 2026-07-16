import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db } from "./client";
import { users } from "./schema";
import { createUser, findUserByEmail, findUserById } from "./users";

beforeEach(async () => {
  await db.delete(users);
});

afterEach(async () => {
  await db.delete(users);
});

describe("users repository", () => {
  it("creates a user and returns the inserted row", async () => {
    const user = await createUser("jan@chateau.amsterdam", "hashed-password");
    expect(user.id).toBeTruthy();
    expect(user.email).toBe("jan@chateau.amsterdam");
    expect(user.passwordHash).toBe("hashed-password");
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  it("finds a user by email", async () => {
    await createUser("marie@chateau.amsterdam", "hashed-password");
    const found = await findUserByEmail("marie@chateau.amsterdam");
    expect(found?.email).toBe("marie@chateau.amsterdam");
  });

  it("returns null when no user matches the given email", async () => {
    const found = await findUserByEmail("nobody@chateau.amsterdam");
    expect(found).toBeNull();
  });

  it("finds a user by id", async () => {
    const created = await createUser("piet@chateau.amsterdam", "hashed-password");
    const found = await findUserById(created.id);
    expect(found?.id).toBe(created.id);
  });

  it("returns null when no user matches the given id", async () => {
    const found = await findUserById("00000000-0000-0000-0000-000000000000");
    expect(found).toBeNull();
  });

  it("rejects a second user with the same email", async () => {
    await createUser("duplicate@chateau.amsterdam", "hashed-password");
    await expect(createUser("duplicate@chateau.amsterdam", "another-hash")).rejects.toThrow();
  });
});
