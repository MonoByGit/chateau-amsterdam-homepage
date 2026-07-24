// lib/email/templates.ts
import type { Reservation } from "@/lib/db/reservations";
import { generateActionToken } from "./action-token";

export function getBaseUrl(): string {
  if (process.env.PUBLIC_SITE_URL) return process.env.PUBLIC_SITE_URL;
  if (process.env.RAILWAY_PUBLIC_DOMAIN) return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  return "https://chateau-amsterdam-homepage-production.up.railway.app";
}

export function renderSalesNotificationEmail(reservation: Reservation): { subject: string; html: string } {
  const baseUrl = getBaseUrl();
  const approveToken = generateActionToken(reservation.id, "approve");
  const rejectToken = generateActionToken(reservation.id, "reject");

  const approveUrl = `${baseUrl}/api/reservations/action?id=${reservation.id}&action=approve&token=${approveToken}`;
  const rejectUrl = `${baseUrl}/api/reservations/action?id=${reservation.id}&action=reject&token=${rejectToken}`;

  const isBusiness = reservation.track === "zakelijk";
  const title = isBusiness
    ? `🏢 Nieuwe Zakelijke Aanvraag: ${reservation.companyName || reservation.contactName}`
    : `🍷 Nieuwe Tasting Aanvraag: ${reservation.contactName}`;

  const dateStr = reservation.requestedDate
    ? new Date(reservation.requestedDate).toLocaleDateString("nl-NL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Geen datum gekozen";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f5f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c1917;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f7f5f0; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e7e3d8; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #1c1917; padding: 28px 32px; text-align: center;">
              <h1 style="color: #cda757; margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">
                Chateau Amsterdam
              </h1>
              <p style="color: #a8a29e; margin: 6px 0 0 0; font-size: 13px; letter-spacing: 0.02em;">
                Urban Winery · Amsterdam-Noord
              </p>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px 0; color: #1c1917; font-size: 18px; font-weight: 600;">
                ${title}
              </h2>
              <p style="margin: 0 0 24px 0; color: #57534e; font-size: 14px; line-height: 1.5;">
                Er is zojuist een nieuwe formulieraanvraag binnengekomen via de website. Beoordeel de details hieronder en klik direct op <strong>[Goedkeuren]</strong> om deze automatisch in de Google Workspace agenda te zetten en de klant te bevestigen.
              </p>

              <!-- Reservation Details Table -->
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #faf8f5; border-radius: 8px; border: 1px solid #e7e3d8; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #78716c; border-bottom: 1px solid #e7e3d8; width: 140px; font-weight: 600;">Contactpersoon:</td>
                  <td style="padding: 12px 16px; font-size: 14px; color: #1c1917; border-bottom: 1px solid #e7e3d8; font-weight: 600;">${reservation.contactName}</td>
                </tr>
                ${
                  reservation.companyName
                    ? `<tr>
                        <td style="padding: 12px 16px; font-size: 13px; color: #78716c; border-bottom: 1px solid #e7e3d8; font-weight: 600;">Bedrijf:</td>
                        <td style="padding: 12px 16px; font-size: 14px; color: #1c1917; border-bottom: 1px solid #e7e3d8;">${reservation.companyName}</td>
                      </tr>`
                    : ""
                }
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #78716c; border-bottom: 1px solid #e7e3d8; font-weight: 600;">E-mailadres:</td>
                  <td style="padding: 12px 16px; font-size: 14px; color: #1c1917; border-bottom: 1px solid #e7e3d8;"><a href="mailto:${reservation.email}" style="color: #cda757; text-decoration: none;">${reservation.email}</a></td>
                </tr>
                ${
                  reservation.phone
                    ? `<tr>
                        <td style="padding: 12px 16px; font-size: 13px; color: #78716c; border-bottom: 1px solid #e7e3d8; font-weight: 600;">Telefoonnummer:</td>
                        <td style="padding: 12px 16px; font-size: 14px; color: #1c1917; border-bottom: 1px solid #e7e3d8;">${reservation.phone}</td>
                      </tr>`
                    : ""
                }
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #78716c; border-bottom: 1px solid #e7e3d8; font-weight: 600;">Datum & Tijdslot:</td>
                  <td style="padding: 12px 16px; font-size: 14px; color: #1c1917; border-bottom: 1px solid #e7e3d8; font-weight: 600;">
                    ${dateStr} ${reservation.preferredPeriod ? `(${reservation.preferredPeriod})` : ""}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #78716c; border-bottom: 1px solid #e7e3d8; font-weight: 600;">Groepsgrootte:</td>
                  <td style="padding: 12px 16px; font-size: 14px; color: #1c1917; border-bottom: 1px solid #e7e3d8;">
                    ${reservation.partySize || reservation.groupSize || "1"} personen
                  </td>
                </tr>
                ${
                  reservation.occasion
                    ? `<tr>
                        <td style="padding: 12px 16px; font-size: 13px; color: #78716c; border-bottom: 1px solid #e7e3d8; font-weight: 600;">Gelegenheid:</td>
                        <td style="padding: 12px 16px; font-size: 14px; color: #1c1917; border-bottom: 1px solid #e7e3d8;">${reservation.occasion}</td>
                      </tr>`
                    : ""
                }
                ${
                  reservation.notes
                    ? `<tr>
                        <td style="padding: 12px 16px; font-size: 13px; color: #78716c; font-weight: 600;">Opmerkingen:</td>
                        <td style="padding: 12px 16px; font-size: 14px; color: #1c1917; font-style: italic;">"${reservation.notes}"</td>
                      </tr>`
                    : ""
                }
              </table>

              <!-- Interactive Action Buttons -->
              <div style="background-color: #1c1917; padding: 24px; border-radius: 10px; text-align: center;">
                <p style="color: #cda757; margin: 0 0 16px 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                  ⚡ Directe Actie (Klik om te verwerken)
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center" style="padding: 4px;">
                      <a href="${approveUrl}" style="display: inline-block; background-color: #15803d; color: #ffffff; font-size: 15px; font-weight: 600; padding: 12px 24px; border-radius: 6px; text-decoration: none; box-shadow: 0 4px 12px rgba(21, 128, 61, 0.3);">
                        ✅ Goedkeuren &amp; Agenderen
                      </a>
                    </td>
                    <td align="center" style="padding: 4px;">
                      <a href="${rejectUrl}" style="display: inline-block; background-color: #dc2626; color: #ffffff; font-size: 15px; font-weight: 600; padding: 12px 24px; border-radius: 6px; text-decoration: none; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
                        ❌ Afwijzen
                      </a>
                    </td>
                  </tr>
                </table>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #faf8f5; padding: 20px 32px; text-align: center; border-top: 1px solid #e7e3d8; font-size: 12px; color: #78716c;">
              Chateau Amsterdam CMS · Reserveringssysteem
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return { subject: title, html };
}

export function renderCustomerConfirmationEmail(reservation: Reservation): { subject: string; html: string } {
  const isBusiness = reservation.track === "zakelijk";
  const subject = `🍷 Je reservering bij Chateau Amsterdam is goedgekeurd!`;

  const dateStr = reservation.requestedDate
    ? new Date(reservation.requestedDate).toLocaleDateString("nl-NL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "In overleg";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f5f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c1917;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e7e3d8; overflow: hidden;">
          <tr>
            <td style="background-color: #1c1917; padding: 28px; text-align: center;">
              <h1 style="color: #cda757; margin: 0; font-size: 22px; font-weight: 600;">Chateau Amsterdam</h1>
              <p style="color: #a8a29e; margin: 4px 0 0 0; font-size: 13px;">Urban Winery · Amsterdam-Noord</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px 0; color: #1c1917; font-size: 20px;">Beste ${reservation.contactName},</h2>
              <p style="color: #44403c; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                Goed nieuws! Je aanvraag voor <strong>Chateau Amsterdam</strong> op <strong>${dateStr}</strong> ${
    reservation.preferredPeriod ? `(${reservation.preferredPeriod})` : ""
  } is officieel <strong>goedgekeurd en bevestigd</strong>.
              </p>

              <div style="background-color: #faf8f5; border-left: 4px solid #cda757; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 14px; color: #1c1917;"><strong>Locatie:</strong> Johan van Hasseltweg, Amsterdam-Noord</p>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #1c1917;"><strong>Aantal personen:</strong> ${reservation.partySize || reservation.groupSize || 1}</p>
              </div>

              <p style="color: #57534e; font-size: 14px; line-height: 1.6;">
                We kijken er naar uit je te verwelkomen tussen de stalen tanks. Heb je vooraf vragen of dieetwensen? Reageer gerust op deze e-mail of neem contact op via <a href="mailto:sales@chateau.amsterdam" style="color: #cda757;">sales@chateau.amsterdam</a>.
              </p>
              
              <p style="margin: 28px 0 0 0; color: #1c1917; font-weight: 600; font-size: 14px;">
                Met vriendelijke groet,<br>
                <em>Team Chateau Amsterdam</em>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return { subject, html };
}
