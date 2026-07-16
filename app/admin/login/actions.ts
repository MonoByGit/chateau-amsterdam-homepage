"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findUserByEmail } from "@/lib/db/users";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/db/sessions";
import { SESSION_COOKIE_NAME, sessionCookieOptions } from "@/lib/auth/session-cookie";
import { checkRateLimit, recordFailedAttempt } from "@/lib/auth/rate-limit";

export async function login(_prevState: string | null, formData: FormData): Promise<string | null> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return "Vul e-mailadres en wachtwoord in.";
  }

  const rateLimit = checkRateLimit(email);
  if (!rateLimit.allowed) {
    const minutes = Math.ceil((rateLimit.retryAfterMs ?? 0) / 60000);
    return `Te veel mislukte inlogpogingen. Probeer het over ${minutes} minuten opnieuw.`;
  }

  const user = await findUserByEmail(email);
  if (!user) {
    recordFailedAttempt(email);
    return "Onjuiste combinatie van e-mailadres en wachtwoord.";
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    recordFailedAttempt(email);
    return "Onjuiste combinatie van e-mailadres en wachtwoord.";
  }

  const { token } = await createSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, sessionCookieOptions());

  redirect("/admin/content");
}
