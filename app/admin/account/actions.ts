// app/admin/account/actions.ts
"use server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { checkRateLimit, recordFailedAttempt } from "@/lib/auth/rate-limit";
import { updateUserPassword } from "@/lib/db/users";

const MIN_PASSWORD_LENGTH = 10;

export async function changePassword(_prevState: string | null, formData: FormData): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) {
    return "Je sessie is verlopen. Log opnieuw in.";
  }

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const newPasswordRepeat = String(formData.get("newPasswordRepeat") ?? "");

  const rateLimitKey = `change-password:${user.id}`;
  const rateLimit = checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    const minutes = Math.ceil((rateLimit.retryAfterMs ?? 0) / 60000);
    return `Te veel pogingen. Probeer het over ${minutes} minuten opnieuw.`;
  }

  const currentValid = await verifyPassword(currentPassword, user.passwordHash);
  if (!currentValid) {
    recordFailedAttempt(rateLimitKey);
    return "Huidig wachtwoord klopt niet.";
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return `Nieuw wachtwoord moet minstens ${MIN_PASSWORD_LENGTH} tekens zijn.`;
  }

  if (newPassword !== newPasswordRepeat) {
    return "De twee wachtwoorden komen niet overeen.";
  }

  const passwordHash = await hashPassword(newPassword);
  await updateUserPassword(user.id, passwordHash);

  return "gelukt";
}
