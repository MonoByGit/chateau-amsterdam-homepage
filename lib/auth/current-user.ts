import { cookies } from "next/headers";
import { validateSession } from "@/lib/db/sessions";
import { findUserById, type User } from "@/lib/db/users";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session-cookie";

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await validateSession(token);
  if (!session) return null;

  return findUserById(session.userId);
}
