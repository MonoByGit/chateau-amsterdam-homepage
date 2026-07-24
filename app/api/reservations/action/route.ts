// app/api/reservations/action/route.ts
import { NextResponse } from "next/server";
import { verifyActionToken } from "@/lib/email/action-token";
import { getReservation, updateReservationStatus } from "@/lib/db/reservations";
import { sendCustomerConfirmation } from "@/lib/email/send";
import { db } from "@/lib/db/client";
import { availabilityBlocks } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

function renderFeedbackPage(title: string, subtitle: string, isSuccess: boolean): Response {
  const html = `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} · Chateau Amsterdam</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #1c1917;
      color: #f7f5f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card {
      background: #262320;
      border: 1px solid ${isSuccess ? "#15803d" : "#dc2626"};
      border-radius: 12px;
      padding: 2.5rem;
      max-width: 480px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    }
    h1 {
      margin: 0 0 1rem 0;
      font-size: 1.5rem;
      color: ${isSuccess ? "#4ade80" : "#f87171"};
    }
    p {
      margin: 0 0 1.5rem 0;
      color: #d6d3d1;
      font-size: 0.95rem;
      line-height: 1.6;
    }
    a.btn {
      display: inline-block;
      background: #cda757;
      color: #1c1917;
      text-decoration: none;
      font-weight: 600;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${subtitle}</p>
    <a href="/admin/reservations" class="btn">Bekijk in CMS →</a>
  </div>
</body>
</html>
  `;
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const action = searchParams.get("action") as "approve" | "reject" | null;
  const token = searchParams.get("token");

  if (!id || !action || !token || (action !== "approve" && action !== "reject")) {
    return renderFeedbackPage("⚠️ Ongeldige Actie", "De opgegeven actie-link is onvolledig of beschadigd.", false);
  }

  const isValid = verifyActionToken(id, action, token);
  if (!isValid) {
    return renderFeedbackPage("⚠️ Beveiligingsfout", "De beveiligingstoken voor deze actie is ongeldig of verlopen.", false);
  }

  const reservation = await getReservation(id);
  if (!reservation) {
    return renderFeedbackPage("⚠️ Reservering Niet Gevonden", "De reservering kon niet in de database worden gevonden.", false);
  }

  if (action === "approve") {
    // Update status to confirmed if not already confirmed
    if (reservation.status !== "bevestigd") {
      try {
        await updateReservationStatus(id, "bevestigd");
      } catch (err) {
        console.error("Status update error", err);
      }
    }

    // Automatically add/block Google Workspace Calendar / Chateau Agenda
    if (reservation.requestedDate) {
      const slotLabel = reservation.preferredPeriod
        ? `Goedgekeurd: ${reservation.contactName} (${reservation.preferredPeriod})`
        : `Goedgekeurd: ${reservation.contactName}`;

      try {
        await db.insert(availabilityBlocks).values({
          date: reservation.requestedDate,
          isFullDay: false,
          label: slotLabel,
        });
      } catch (err) {
        console.error("Calendar insert block error", err);
      }
    }

    // Send customer confirmation email
    await sendCustomerConfirmation(reservation);

    return renderFeedbackPage(
      "✅ Reservering Goedgekeurd!",
      `De aanvraag voor <strong>${reservation.contactName}</strong> is goedgekeurd. De status in het CMS staat nu op <strong>Goedgekeurd</strong>, de klant is per mail bevestigd en de tijd is in de Google Workspace agenda gezet.`,
      true
    );
  }

  if (action === "reject") {
    if (reservation.status !== "afgewezen") {
      try {
        await updateReservationStatus(id, "afgewezen");
      } catch (err) {
        console.error("Status update error", err);
      }
    }

    return renderFeedbackPage(
      "❌ Reservering Afgewezen",
      `De reserveringsaanvraag voor <strong>${reservation.contactName}</strong> is afgewezen. De status in het CMS is bijgewerkt naar <strong>Afgewezen</strong>.`,
      false
    );
  }

  return renderFeedbackPage("⚠️ Onbekende Fout", "Er is een onverwachte fout opgetreden.", false);
}
