// app/(site)/voor-bedrijven/actions.ts
"use server";

import { redirect } from "next/navigation";
import { createBusinessReservation } from "@/lib/db/reservations";
import { validateBusinessInquiry, type BusinessInquiryInput } from "@/lib/validation/business-inquiry";

function readInquiryForm(formData: FormData): BusinessInquiryInput {
  return {
    name: String(formData.get("name") ?? ""),
    companyName: String(formData.get("companyName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    occasion: String(formData.get("occasion") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };
}

export async function submitBusinessInquiry(formData: FormData): Promise<void> {
  const input = readInquiryForm(formData);

  const validationError = validateBusinessInquiry(input);
  if (validationError) {
    redirect(`/voor-bedrijven?fout=${encodeURIComponent(validationError)}#aanvraag`);
  }

  await createBusinessReservation({
    contactName: input.name,
    companyName: input.companyName,
    email: input.email,
    phone: input.phone,
    occasion: input.occasion,
    notes: input.notes,
  });

  redirect("/voor-bedrijven?verzonden=1#aanvraag");
}
