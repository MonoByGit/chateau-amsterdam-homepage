import { randomBytes } from "node:crypto";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/password";

const PLACEHOLDER_EMAILS = [
  "team1@chateau.amsterdam",
  "team2@chateau.amsterdam",
  "team3@chateau.amsterdam",
  "team4@chateau.amsterdam",
] as const;

function generatePlaceholderPassword(): string {
  return randomBytes(9).toString("base64url");
}

export async function seedUsers(): Promise<void> {
  for (const email of PLACEHOLDER_EMAILS) {
    const plainPassword = generatePlaceholderPassword();
    const passwordHash = await hashPassword(plainPassword);

    await db
      .insert(users)
      .values({ email, passwordHash })
      .onConflictDoUpdate({
        target: users.email,
        set: { passwordHash },
      });

    console.log(
      `[seed:users] ${email} -> temporary password: ${plainPassword} (replace with the real client account before go-live)`
    );
  }
}
