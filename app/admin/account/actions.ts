// app/admin/account/actions.ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/current-user";
import { countUsers, createUser, deleteUser, findUserByEmail } from "@/lib/db/users";

function fail(message: string): never {
  redirect(`/admin/account?error=${encodeURIComponent(message)}`);
}

export async function addUser(formData: FormData): Promise<void> {
  // Server actions are independently callable endpoints, not something the
  // page's own auth redirect protects — each one needs its own check.
  if (!(await getCurrentUser())) {
    fail("Je sessie is verlopen. Log opnieuw in.");
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    fail("Vul een geldig e-mailadres in.");
  }
  if (await findUserByEmail(email)) {
    fail("Er bestaat al een account met dit e-mailadres.");
  }

  await createUser(email);

  revalidatePath("/admin/account");
  redirect(`/admin/account?created=${encodeURIComponent(email)}`);
}

export async function removeUser(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    fail("Je sessie is verlopen. Log opnieuw in.");
  }
  if (currentUser.id === id) {
    fail("Je kunt je eigen account niet verwijderen.");
  }
  if ((await countUsers()) <= 1) {
    fail("Je kunt het laatste account niet verwijderen.");
  }

  await deleteUser(id);
  revalidatePath("/admin/account");
}
