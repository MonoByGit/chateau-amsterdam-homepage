// app/admin/reservations/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { updateReservationStatus, updateReservationDetails, type ReservationStatus } from "@/lib/db/reservations";
import { sendReservationUpdateNotification, sendCustomerConfirmation, sendSalesConfirmationAlert } from "@/lib/email/send";

export async function updateStatus(id: string, status: ReservationStatus): Promise<void> {
  await updateReservationStatus(id, status);
  revalidatePath("/admin/reservations");
  revalidatePath(`/admin/reservations/${id}`);
  revalidatePath("/admin");
}

export async function saveReservationDetails(id: string, formData: FormData): Promise<void> {
  const requestedDate = String(formData.get("requestedDate") ?? "").trim() || null;
  const preferredPeriod = String(formData.get("preferredPeriod") ?? "").trim() || null;
  const partySizeRaw = String(formData.get("partySize") ?? "").trim();
  const partySize = partySizeRaw ? Number(partySizeRaw) : null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const notifyCustomer = formData.get("notifyCustomer") === "on";

  const updated = await updateReservationDetails(id, {
    requestedDate,
    preferredPeriod,
    partySize,
    notes,
  });

  if (notifyCustomer) {
    try {
      await sendReservationUpdateNotification(updated);
    } catch (err) {
      console.error("Failed to notify customer about reservation update", err);
    }
  }

  revalidatePath("/admin/reservations");
  revalidatePath(`/admin/reservations/${id}`);
  revalidatePath("/admin");
}

export async function saveAndConfirmReservation(id: string, formData: FormData): Promise<void> {
  const requestedDate = String(formData.get("requestedDate") ?? "").trim() || null;
  const preferredPeriod = String(formData.get("preferredPeriod") ?? "").trim() || null;
  const partySizeRaw = String(formData.get("partySize") ?? "").trim();
  const partySize = partySizeRaw ? Number(partySizeRaw) : null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const updated = await updateReservationDetails(id, {
    requestedDate,
    preferredPeriod,
    partySize,
    notes,
  });

  await updateReservationStatus(id, "bevestigd");

  const confirmedReservation = {
    ...updated,
    status: "bevestigd" as const,
  };

  try {
    await Promise.allSettled([
      sendCustomerConfirmation(confirmedReservation),
      sendSalesConfirmationAlert(confirmedReservation),
    ]);
  } catch (err) {
    console.error("Failed to send confirmation emails", err);
  }

  revalidatePath("/admin/reservations");
  revalidatePath(`/admin/reservations/${id}`);
  revalidatePath("/admin");
}
