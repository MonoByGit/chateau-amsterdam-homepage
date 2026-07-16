// app/admin/reservations/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { updateReservationStatus, type ReservationStatus } from "@/lib/db/reservations";

export async function updateStatus(id: string, status: ReservationStatus): Promise<void> {
  await updateReservationStatus(id, status);
  revalidatePath("/admin/reservations");
  revalidatePath(`/admin/reservations/${id}`);
}
