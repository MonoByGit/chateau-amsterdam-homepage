import { asc, eq, sql } from "drizzle-orm";
import { db } from "./client";
import { users } from "./schema";

export type User = typeof users.$inferSelect;

export async function createUser(email: string, passwordHash?: string | null): Promise<User> {
  const [user] = await db.insert(users).values({ email, passwordHash: passwordHash ?? null }).returning();
  return user;
}

export async function getOrCreateUserByEmail(email: string): Promise<User> {
  const normalized = email.trim().toLowerCase();
  const existing = await findUserByEmail(normalized);
  if (existing) return existing;
  return createUser(normalized);
}

export async function listUsers(): Promise<User[]> {
  return db.select().from(users).orderBy(asc(users.createdAt));
}

export async function countUsers(): Promise<number> {
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(users);
  return Number(count);
}

export async function deleteUser(id: string): Promise<void> {
  await db.delete(users).where(eq(users.id, id));
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user ?? null;
}

export async function updateUserPassword(id: string, passwordHash: string): Promise<void> {
  await db.update(users).set({ passwordHash }).where(eq(users.id, id));
}
