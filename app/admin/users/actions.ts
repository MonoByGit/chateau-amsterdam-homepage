// app/admin/users/actions.ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/current-user";
import { generateTemporaryPassword } from "@/lib/auth/generate-password";
import { hashPassword } from "@/lib/auth/password";
import { countUsers, createUser, deleteUser, findUserByEmail } from "@/lib/db/users";

function fail(message: string): never {
  redirect(`/admin/users?error=${encodeURIComponent(message)}`);
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

  revalidatePath("/admin/users");
  redirect(
    `/admin/users?created=${encodeURIComponent(email)}&password=${encodeURIComponent(temporaryPassword)}`
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
  revalidatePath("/admin/users");
}
