// app/(site)/voor-bedrijven/actions.ts
"use server";

import { redirect } from "next/navigation";
import { createBusinessReservation } from "@/lib/db/reservations";
import { validateBusinessInquiry, type BusinessInquiryInput } from "@/lib/validation/business-inquiry";
import { checkRateLimit, recordFailedAttempt } from "@/lib/auth/rate-limit";
import { sendCustomerReceipt, sendSalesNotification } from "@/lib/email/send";

function readInquiryForm(formData: FormData): BusinessInquiryInput {
  return {
    name: String(formData.get("name") ?? ""),
    companyName: String(formData.get("companyName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    occasion: String(formData.get("occasion") ?? ""),
    groupSize: String(formData.get("groupSize") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };
}

export async function submitBusinessInquiry(formData: FormData): Promise<void> {
  const input = readInquiryForm(formData);
  const rateLimitKey = `business:${input.email.trim().toLowerCase()}`;

  const rateLimit = checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    redirect(`/voor-bedrijven?fout=rate_limited#aanvraag`);
  }

  const validationError = validateBusinessInquiry(input);
  if (validationError) {
    redirect(`/voor-bedrijven?fout=${encodeURIComponent(validationError)}#aanvraag`);
  }

  recordFailedAttempt(rateLimitKey);

  const reservation = await createBusinessReservation({
    contactName: input.name,
    companyName: input.companyName,
    email: input.email,
    phone: input.phone,
    occasion: input.occasion,
    groupSize: input.groupSize.trim() ? Number(input.groupSize) : null,
    notes: input.notes,
  });

  try {
    await sendSalesNotification(reservation);
    await sendCustomerReceipt(reservation);
  } catch (err) {
    console.error("Failed to send reservation emails", err);
  }

  redirect("/voor-bedrijven?verzonden=1#aanvraag");
}
