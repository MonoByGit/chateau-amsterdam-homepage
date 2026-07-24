// app/(site)/tours-tastings/actions.ts
"use server";

import { redirect } from "next/navigation";
import { createTastingReservation } from "@/lib/db/reservations";
import { validateTastingInquiry, type TastingInquiryInput } from "@/lib/validation/tasting-inquiry";
import { checkRateLimit, recordFailedAttempt } from "@/lib/auth/rate-limit";
import { sendCustomerReceipt, sendSalesNotification } from "@/lib/email/send";

function readInquiryForm(formData: FormData): TastingInquiryInput {
  return {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    partySize: String(formData.get("partySize") ?? ""),
    requestedDate: String(formData.get("requestedDate") ?? ""),
    preferredPeriod: String(formData.get("preferredPeriod") ?? ""),
    occasion: String(formData.get("occasion") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };
}

export async function submitTastingInquiry(formData: FormData): Promise<void> {
  const input = readInquiryForm(formData);
  const rateLimitKey = `tasting:${input.email.trim().toLowerCase()}`;

  const rateLimit = checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    redirect(`/tours-tastings?fout=rate_limited#reserveren`);
  }

  const validationError = validateTastingInquiry(input);
  if (validationError) {
    redirect(`/tours-tastings?fout=${encodeURIComponent(validationError)}#reserveren`);
  }

  recordFailedAttempt(rateLimitKey);

  const reservation = await createTastingReservation({
    contactName: input.name,
    email: input.email,
    phone: input.phone,
    partySize: Number(input.partySize),
    requestedDate: input.requestedDate,
    preferredPeriod: input.preferredPeriod,
    occasion: input.occasion,
    notes: input.notes,
  });

  try {
    await sendSalesNotification(reservation);
    await sendCustomerReceipt(reservation);
  } catch (err) {
    console.error("Failed to send reservation emails", err);
  }

  redirect("/tours-tastings?verzonden=1#reserveren");
}
