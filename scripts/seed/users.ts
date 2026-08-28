import { db } from "../../lib/db/client";
import { users } from "../../lib/db/schema";

export const INITIAL_USERS = [
  "didier@chateau.amsterdam",
  "sales@chateau.amsterdam",
  "floor@chateau.amsterdam",
  "studio@monobydusty.com",
] as const;

export async function seedUsers(): Promise<void> {
  for (const email of INITIAL_USERS) {
    await db
      .insert(users)
      .values({ email })
      .onConflictDoNothing({
        target: users.email,
      });

    console.log(`[seed:users] User configured for passwordless login: ${email}`);
  }
}
