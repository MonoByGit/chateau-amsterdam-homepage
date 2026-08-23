// lib/email/send.ts
import type { Reservation } from "@/lib/db/reservations";
import {
  renderCustomerConfirmationEmail,
  renderCustomerReceiptEmail,
  renderSalesNotificationEmail,
  renderSalesConfirmationAlertEmail,
  renderReservationUpdateEmail,
} from "./templates";
import { getEmailContent } from "@/lib/content/emails";
import { generateIcsContent } from "./calendar";

export const SALES_EMAIL_RECIPIENT = process.env.SALES_EMAIL || "sales@chateau.amsterdam";
export const SENDER_EMAIL = process.env.SENDER_EMAIL || "Chateau Amsterdam <no-reply@updates.chateau.amsterdam>";

export interface EmailAttachment {
  filename: string;
  content: string; // Base64 or string
}

export async function sendEmail({
  to,
  subject,
  html,
  attachments,
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    try {
      const payload: Record<string, any> = {
        from: SENDER_EMAIL,
        to,
        subject,
        html,
      };

      if (attachments && attachments.length > 0) {
        payload.attachments = attachments;
      }

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
  const content = await getEmailContent(reservation.track === "zakelijk" ? "sales-business" : "sales-tasting");
  const { subject, html } = renderSalesNotificationEmail(reservation, content);
  await sendEmail({
    to: SALES_EMAIL_RECIPIENT,
    subject,
    html,
  });
}

export async function sendSalesConfirmationAlert(reservation: Reservation): Promise<void> {
  const { subject, html } = renderSalesConfirmationAlertEmail(reservation);
  const ics = generateIcsContent(reservation);

  await sendEmail({
    to: SALES_EMAIL_RECIPIENT,
    subject,
    html,
    attachments: [
      {
        filename: "chateau-amsterdam-afspraak.ics",
        content: Buffer.from(ics).toString("base64"),
      },
    ],
  });
}

export async function sendCustomerReceipt(reservation: Reservation): Promise<void> {
  const content = await getEmailContent("customer-receipt");
  const { subject, html } = renderCustomerReceiptEmail(reservation, content);
  await sendEmail({
    to: reservation.email,
    subject,
    html,
  });
}

export async function sendCustomerConfirmation(reservation: Reservation): Promise<void> {
  const content = await getEmailContent("customer-confirmation");
  const { subject, html } = renderCustomerConfirmationEmail(reservation, content);
  const ics = generateIcsContent(reservation);

  await sendEmail({
    to: reservation.email,
    subject,
    html,
    attachments: [
      {
        filename: "chateau-amsterdam-reservering.ics",
        content: Buffer.from(ics).toString("base64"),
      },
    ],
  });
}

export async function sendReservationUpdateNotification(reservation: Reservation): Promise<void> {
  const content = await getEmailContent("customer-update");
  const { subject, html } = renderReservationUpdateEmail(reservation, content);
  const ics = generateIcsContent(reservation);

  await sendEmail({
    to: reservation.email,
    subject,
    html,
    attachments: [
      {
        filename: "chateau-amsterdam-gewijzigd.ics",
        content: Buffer.from(ics).toString("base64"),
      },
    ],
  });
}
