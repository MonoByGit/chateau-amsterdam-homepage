// lib/email/send.ts
import type { Reservation } from "@/lib/db/reservations";
import { renderCustomerConfirmationEmail, renderCustomerReceiptEmail, renderSalesNotificationEmail } from "./templates";

export const SALES_EMAIL_RECIPIENT = process.env.SALES_EMAIL || "sales@chateau.amsterdam";
export const SENDER_EMAIL = process.env.SENDER_EMAIL || "Chateau Amsterdam <no-reply@chateau.amsterdam>";

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: SENDER_EMAIL,
          to,
          subject,
          html,
        }),
      });

      if (res.ok) {
        console.log(`[EMAIL SENT via Resend] To: ${to} | Subject: ${subject}`);
        return true;
      }
      const errText = await res.text();
      console.error(`[EMAIL ERROR Resend] HTTP ${res.status}: ${errText}`);
    } catch (err) {
      console.error("[EMAIL ERROR Resend]", err);
    }
  }

  // Fallback log for dev / staging without active API key
  console.log("=================================================");
  console.log(`[EMAIL DISPATCH] To: ${to}`);
  console.log(`[EMAIL SUBJECT] ${subject}`);
  console.log(`[EMAIL BODY PREVIEW] HTML length ${html.length} chars`);
  console.log("=================================================");
  return true;
}

export async function sendSalesNotification(reservation: Reservation): Promise<void> {
  const { subject, html } = renderSalesNotificationEmail(reservation);
  await sendEmail({
    to: SALES_EMAIL_RECIPIENT,
    subject,
    html,
  });
}

export async function sendCustomerReceipt(reservation: Reservation): Promise<void> {
  const { subject, html } = renderCustomerReceiptEmail(reservation);
  await sendEmail({
    to: reservation.email,
    subject,
    html,
  });
}

export async function sendCustomerConfirmation(reservation: Reservation): Promise<void> {
  const { subject, html } = renderCustomerConfirmationEmail(reservation);
  await sendEmail({
    to: reservation.email,
    subject,
    html,
  });
}
