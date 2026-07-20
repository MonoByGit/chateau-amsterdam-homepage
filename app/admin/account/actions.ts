// app/admin/account/actions.ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/current-user";
import { generateTemporaryPassword } from "@/lib/auth/generate-password";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { checkRateLimit, recordFailedAttempt } from "@/lib/auth/rate-limit";
import { countUsers, createUser, deleteUser, findUserByEmail, updateUserPassword } from "@/lib/db/users";

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

function fail(message: string): never {
  redirect(`/admin/account?error=${encodeURIComponent(message)}`);
}

export async function addUser(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    fail("Vul een geldig e-mailadres in.");
  }
  if (await findUserByEmail(email)) {
    fail("Er bestaat al een account met dit e-mailadres.");
  }

  const temporaryPassword = generateTemporaryPassword();
  await createUser(email, await hashPassword(temporaryPassword));

  revalidatePath("/admin/account");
  redirect(
    `/admin/account?created=${encodeURIComponent(email)}&password=${encodeURIComponent(temporaryPassword)}`
  );
}

export async function removeUser(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const currentUser = await getCurrentUser();

  if (currentUser?.id === id) {
    fail("Je kunt je eigen account niet verwijderen.");
  }
  if ((await countUsers()) <= 1) {
    fail("Je kunt het laatste account niet verwijderen.");
  }

  await deleteUser(id);
  revalidatePath("/admin/account");
}
