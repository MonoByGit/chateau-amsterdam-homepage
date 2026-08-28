// lib/email/templates.ts
import type { Reservation } from "@/lib/db/reservations";
import { generateActionToken } from "./action-token";
import { generateGoogleCalendarUrl } from "./calendar";
import {
  EMAIL_RECEIPT_DEFAULTS,
  EMAIL_CONFIRMATION_DEFAULTS,
  EMAIL_UPDATE_DEFAULTS,
  EMAIL_SALES_DEFAULTS,
  type EmailTemplateContent,
} from "@/lib/content/defaults";

export function getBaseUrl(): string {
  if (process.env.RAILWAY_PUBLIC_DOMAIN) return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  if (process.env.RAILWAY_STATIC_URL) return `https://${process.env.RAILWAY_STATIC_URL}`;
  if (process.env.PUBLIC_SITE_URL) return process.env.PUBLIC_SITE_URL;
  return "https://chateau-amsterdam-homepage-production.up.railway.app";
}

function emailWrapper(content: string): string {
  const baseUrl = getBaseUrl();
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <style>
    *, *:before, *:after { box-sizing: border-box !important; }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      max-width: 100% !important;
      overflow-x: hidden !important;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      background-color: #F4F0E8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #17140E;
    }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    table { border-collapse: collapse; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    a { color: #17140E; text-decoration: underline; }
    .email-container { width: 100% !important; max-width: 580px !important; }
    .email-outer-pad { padding: 32px 12px !important; }
    .email-body { padding: 36px 36px 32px 36px !important; }
    .email-row-label { width: 120px !important; }
    @media only screen and (max-width: 520px) {
      .email-outer-pad { padding: 16px 8px !important; }
      .email-body { padding: 22px 16px 20px 16px !important; }
      .email-row-label { width: 92px !important; }
      .email-title { font-size: 22px !important; }
      .email-actions td { display: block !important; width: 100% !important; padding: 4px 0 !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F0E8;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-outer-pad" style="background-color: #F4F0E8; width: 100%;">
    <tr>
      <td align="center" style="padding: 0;">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-container" style="max-width: 580px; width: 100%; background-color: #FAF8F5; border: 1px solid #E2DDD2; border-radius: 4px; box-shadow: 0 4px 24px rgba(23, 20, 14, 0.04); overflow: hidden;">
          
          <!-- Brand Header with Logo -->
          <tr>
            <td style="padding: 28px 20px 20px 20px; border-bottom: 1px solid #E2DDD2; text-align: center; background-color: #FAF8F5;">
              <a href="${baseUrl}" style="display: inline-block; text-decoration: none;">
                <img src="${baseUrl}/assets/chateau-logo.png" alt="Chateau Amsterdam" width="140" style="display: block; margin: 0 auto; max-width: 140px; height: auto;" />
              </a>
              <div style="font-family: 'Courier New', Courier, monospace; font-size: 9.5px; letter-spacing: 0.18em; text-transform: uppercase; color: #8A8174; margin-top: 8px;">
                Urban Winery &middot; aan het IJ &middot; Amsterdam-Noord
              </div>
            </td>
          </tr>

          <!-- Dynamic Content Body -->
          <tr>
            <td class="email-body" style="padding: 36px 36px 32px 36px;">
              ${content}
            </td>
          </tr>

          <!-- Minimal Brand Footer -->
          <tr>
            <td style="padding: 20px 20px; border-top: 1px solid #E2DDD2; background-color: #F2ECE1; text-align: center;">
              <div style="font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: #8A8174; margin-bottom: 6px;">
                Chateau Amsterdam &middot; Johan van Hasseltweg 51
              </div>
              <div style="font-size: 11.5px; color: #767064; line-height: 1.5;">
                1021 KN Amsterdam &middot; 
                <a href="mailto:winery@chateau.amsterdam" style="color: #767064; text-decoration: underline;">winery@chateau.amsterdam</a> &middot; 
                <a href="mailto:sales@chateau.amsterdam" style="color: #767064; text-decoration: underline;">sales@chateau.amsterdam</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function renderFieldRow(num: string, label: string, value: string): string {
  return `
    <tr>
      <td class="email-row-label" style="padding: 9px 0; border-bottom: 1px solid #EAE5DC; vertical-align: top; width: 120px;">
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 9px; letter-spacing: 0.14em; color: #B8860B; font-weight: bold; margin-right: 3px;">${num}</span>
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 9.5px; letter-spacing: 0.08em; text-transform: uppercase; color: #8A8174;">${label}</span>
      </td>
      <td style="padding: 9px 0 9px 8px; border-bottom: 1px solid #EAE5DC; vertical-align: top; font-size: 14px; color: #17140E; font-weight: 500; word-break: break-word; overflow-wrap: break-word;">
        ${value}
      </td>
    </tr>`;
}

export function formatDisplayTime(period: string | null | undefined): string {
  if (!period) return "";
  const match = period.match(/(\d{1,2}[:.]\d{2})/);
  if (match) {
    return `${match[1].replace(".", ":")} uur`;
  }
  return period;
}

export function renderSalesNotificationEmail(
  reservation: Reservation,
  customContent?: Partial<EmailTemplateContent>
): { subject: string; html: string } {
  const baseUrl = getBaseUrl();
  const approveToken = generateActionToken(reservation.id, "approve");
  const approveUrl = `${baseUrl}/api/reservations/action?id=${reservation.id}&action=approve&token=${approveToken}`;
  const manageUrl = `${baseUrl}/admin/reservations/${reservation.id}`;

  const isBusiness = reservation.track === "zakelijk";
  const defaults = EMAIL_SALES_DEFAULTS;
  const heading = customContent?.heading?.nl || (isBusiness ? `Zakelijke aanvraag: ${reservation.companyName || reservation.contactName}` : `Tasting aanvraag: ${reservation.contactName}`);
  const intro = customContent?.intro?.nl || defaults.intro.nl;

  const dateStr = reservation.requestedDate
    ? new Date(reservation.requestedDate).toLocaleDateString("nl-NL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "In overleg";

  const content = `
    <div style="font-family: 'Courier New', Courier, monospace; font-size: 10.5px; letter-spacing: 0.16em; text-transform: uppercase; color: #B8860B; margin-bottom: 8px; font-weight: bold;">
      &bull; ${isBusiness ? "Zakelijke Aanvraag" : "Tasting Aanvraag"}
    </div>
    
    <h1 class="email-title" style="font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-weight: 400; font-size: 24px; line-height: 1.25; color: #17140E; margin: 0 0 14px 0;">
      ${heading}
    </h1>

    <p style="font-size: 14px; line-height: 1.6; color: #57534E; margin: 0 0 20px 0;">
      ${intro}
    </p>

    <!-- Details Table -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px; border-top: 1px solid #E2DDD2; width: 100%;">
      ${renderFieldRow("01", "Contact", reservation.contactName)}
      ${reservation.companyName ? renderFieldRow("02", "Bedrijf", reservation.companyName) : ""}
      ${renderFieldRow(reservation.companyName ? "03" : "02", "E-mail", `<a href="mailto:${reservation.email}" style="color: #17140E; font-weight: 600; word-break: break-all;">${reservation.email}</a>`)}
      ${reservation.phone ? renderFieldRow(reservation.companyName ? "04" : "03", "Telefoon", reservation.phone) : ""}
      ${renderFieldRow(
        reservation.companyName ? (reservation.phone ? "05" : "04") : (reservation.phone ? "04" : "03"),
        "Datum & Tijd",
        `<strong>${dateStr}</strong> ${reservation.preferredPeriod ? `&middot; ${formatDisplayTime(reservation.preferredPeriod)}` : ""}`
      )}
      ${renderFieldRow(
        "06",
        "Gezelschap",
        `${reservation.partySize || reservation.groupSize || "2"} personen`
      )}
      ${reservation.occasion ? renderFieldRow("07", "Gelegenheid", reservation.occasion) : ""}
      ${reservation.notes ? renderFieldRow("08", "Opmerkingen", `<span style="font-style: italic; color: #44403C;">&ldquo;${reservation.notes}&rdquo;</span>`) : ""}
    </table>

    <!-- Direct Action Card -->
    <div style="background-color: #F4F0E8; border: 1px solid #E2DDD2; border-radius: 4px; padding: 18px 12px; text-align: center;">
      <div style="font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: #8A8174; margin-bottom: 14px;">
        Directe actie &mdash; klik om te verwerken
      </div>
      
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" class="email-actions" style="margin: 0 auto; max-width: 100%;">
        <tr>
          <td style="padding: 4px 6px;">
            <a href="${approveUrl}" style="display: inline-block; background-color: #FFCC00; color: #17140E; font-family: 'Courier New', Courier, monospace; font-size: 11.5px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: bold; padding: 10px 22px; border-radius: 999px; text-decoration: none; border: 1px solid #E5B800; white-space: nowrap;">
              Bevestigen
            </a>
          </td>
          <td style="padding: 4px 6px;">
            <a href="${manageUrl}" style="display: inline-block; background-color: transparent; color: #17140E; font-family: 'Courier New', Courier, monospace; font-size: 11.5px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: bold; padding: 10px 22px; border-radius: 999px; text-decoration: none; border: 1px solid #C4BCAC; white-space: nowrap;">
              Wijzigen
            </a>
          </td>
        </tr>
      </table>
    </div>
  `;

  const subject = customContent?.subject?.nl || (isBusiness ? `Zakelijke Aanvraag: ${reservation.companyName || reservation.contactName}` : `Tasting Aanvraag: ${reservation.contactName}`);

  return {
    subject,
    html: emailWrapper(content),
  };
}

export function renderSalesConfirmationAlertEmail(reservation: Reservation): { subject: string; html: string } {
  const dateStr = reservation.requestedDate
    ? new Date(reservation.requestedDate).toLocaleDateString("nl-NL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "In overleg";

  const content = `
    <div style="font-family: 'Courier New', Courier, monospace; font-size: 10.5px; letter-spacing: 0.16em; text-transform: uppercase; color: #15803D; margin-bottom: 8px; font-weight: bold;">
      &check; Reservering Bevestigd &amp; In Agenda Gezet
    </div>
    
    <h1 class="email-title" style="font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-weight: 400; font-size: 24px; line-height: 1.25; color: #17140E; margin: 0 0 14px 0;">
      Bevestigd: ${reservation.contactName} ${reservation.companyName ? `(${reservation.companyName})` : ""}
    </h1>

    <p style="font-size: 14px; line-height: 1.6; color: #57534E; margin: 0 0 20px 0;">
      Deze afspraak is zojuist bevestigd. De klant heeft automatisch de bevestigingsmail ontvangen en de agenda-afspraak (.ics) is als bijlage meegestuurd voor jullie teamagenda.
    </p>

    <!-- Details Table -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px; border-top: 1px solid #E2DDD2; width: 100%;">
      ${renderFieldRow("01", "Contact", reservation.contactName)}
      ${reservation.companyName ? renderFieldRow("02", "Bedrijf", reservation.companyName) : ""}
      ${renderFieldRow(reservation.companyName ? "03" : "02", "E-mail", `<a href="mailto:${reservation.email}" style="color: #17140E; font-weight: 600;">${reservation.email}</a>`)}
      ${reservation.phone ? renderFieldRow(reservation.companyName ? "04" : "03", "Telefoon", reservation.phone) : ""}
      ${renderFieldRow(
        reservation.companyName ? (reservation.phone ? "05" : "04") : (reservation.phone ? "04" : "03"),
        "Datum & Tijd",
        `<strong>${dateStr}</strong> ${reservation.preferredPeriod ? `&middot; ${formatDisplayTime(reservation.preferredPeriod)}` : ""}`
      )}
      ${renderFieldRow(
        "06",
        "Gezelschap",
        `${reservation.partySize || reservation.groupSize || "2"} personen`
      )}
      ${reservation.occasion ? renderFieldRow("07", "Gelegenheid", reservation.occasion) : ""}
      ${reservation.notes ? renderFieldRow("08", "Opmerkingen", `<span style="font-style: italic; color: #44403C;">&ldquo;${reservation.notes}&rdquo;</span>`) : ""}
    </table>

    <!-- Add to Calendar Link -->
    <div style="text-align: center; margin: 0 0 20px 0;">
      <a href="${generateGoogleCalendarUrl(reservation)}" target="_blank" style="display: inline-block; background-color: #FAF8F5; color: #17140E; font-family: 'Courier New', Courier, monospace; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: bold; padding: 10px 20px; border-radius: 999px; text-decoration: none; border: 1px solid #C4BCAC;">
        📅 Openen in Google Agenda
      </a>
    </div>
  `;

  const subject = `✅ Afspraak Bevestigd: ${reservation.contactName} · ${dateStr} (In Agenda)`;

  return {
    subject,
    html: emailWrapper(content),
  };
}

export function renderCustomerReceiptEmail(
  reservation: Reservation,
  customContent?: Partial<EmailTemplateContent>
): { subject: string; html: string } {
  const defaults = EMAIL_RECEIPT_DEFAULTS;
  const heading = customContent?.heading?.nl || defaults.heading.nl;
  const intro = customContent?.intro?.nl || defaults.intro.nl;
  const detailsLabel = customContent?.details_label?.nl || defaults.details_label.nl;
  const footerNote = customContent?.footer_note?.nl || defaults.footer_note.nl;

  const dateStr = reservation.requestedDate
    ? new Date(reservation.requestedDate).toLocaleDateString("nl-NL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "In overleg";

  const content = `
    <div style="font-family: 'Courier New', Courier, monospace; font-size: 10.5px; letter-spacing: 0.16em; text-transform: uppercase; color: #B8860B; margin-bottom: 8px; font-weight: bold;">
      &bull; Aanvraag ontvangen
    </div>

    <h1 class="email-title" style="font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-weight: 400; font-size: 24px; line-height: 1.25; color: #17140E; margin: 0 0 14px 0;">
      Beste ${reservation.contactName},
    </h1>

    <p style="font-size: 14.5px; line-height: 1.6; color: #44403C; margin: 0 0 20px 0;">
      ${intro}
    </p>

    <!-- Overview Box -->
    <div style="background-color: #F4F0E8; border: 1px solid #E2DDD2; border-radius: 4px; padding: 16px 18px; margin-bottom: 20px;">
      <div style="font-family: 'Courier New', Courier, monospace; font-size: 9.5px; letter-spacing: 0.14em; text-transform: uppercase; color: #8A8174; margin-bottom: 10px;">
        ${detailsLabel}
      </div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        ${renderFieldRow("01", "Datum", dateStr)}
        ${reservation.preferredPeriod ? renderFieldRow("02", "Tijdstip", formatDisplayTime(reservation.preferredPeriod)) : ""}
        ${renderFieldRow("03", "Gezelschap", `${reservation.partySize || reservation.groupSize || 2} personen`)}
        ${renderFieldRow("04", "Locatie", "Johan van Hasseltweg 51, Amsterdam-Noord")}
      </table>
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: #57534E; margin: 0 0 20px 0;">
      ${footerNote}
    </p>

    <div style="margin-top: 24px; font-size: 14px; color: #17140E;">
      Met vriendelijke groet,<br>
      <em style="font-family: Georgia, serif; font-size: 15px;">Team Chateau Amsterdam</em>
    </div>
  `;

  return {
    subject: customContent?.subject?.nl || defaults.subject.nl,
    html: emailWrapper(content),
  };
}

export function renderCustomerConfirmationEmail(
  reservation: Reservation,
  customContent?: Partial<EmailTemplateContent>
): { subject: string; html: string } {
  const defaults = EMAIL_CONFIRMATION_DEFAULTS;
  const heading = customContent?.heading?.nl || `We zien je snel, ${reservation.contactName}.`;
  const intro = customContent?.intro?.nl || defaults.intro.nl;
  const detailsLabel = customContent?.details_label?.nl || defaults.details_label.nl;
  const footerNote = customContent?.footer_note?.nl || defaults.footer_note.nl;

  const dateStr = reservation.requestedDate
    ? new Date(reservation.requestedDate).toLocaleDateString("nl-NL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "In overleg";

  const content = `
    <div style="font-family: 'Courier New', Courier, monospace; font-size: 10.5px; letter-spacing: 0.16em; text-transform: uppercase; color: #B8860B; margin-bottom: 8px; font-weight: bold;">
      &bull; Reservering bevestigd
    </div>

    <h1 class="email-title" style="font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-weight: 400; font-size: 24px; line-height: 1.25; color: #17140E; margin: 0 0 14px 0;">
      ${heading}
    </h1>

    <p style="font-size: 14.5px; line-height: 1.6; color: #44403C; margin: 0 0 20px 0;">
      ${intro}
    </p>

    <!-- Confirmed Box -->
    <div style="background-color: #F4F0E8; border: 1px solid #E2DDD2; border-radius: 4px; padding: 16px 18px; margin-bottom: 20px;">
      <div style="font-family: 'Courier New', Courier, monospace; font-size: 9.5px; letter-spacing: 0.14em; text-transform: uppercase; color: #8A8174; margin-bottom: 10px;">
        ${detailsLabel}
      </div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        ${renderFieldRow("01", "Datum", `<strong>${dateStr}</strong>`)}
        ${reservation.preferredPeriod ? renderFieldRow("02", "Tijdstip", `<strong>${formatDisplayTime(reservation.preferredPeriod)}</strong>`) : ""}
        ${renderFieldRow("03", "Gezelschap", `${reservation.partySize || reservation.groupSize || 2} personen`)}
        ${renderFieldRow("04", "Adres", "Johan van Hasseltweg 51, 1021 KN Amsterdam")}
        ${renderFieldRow("05", "Locatie", "10 min. vanaf CS &middot; Gratis parkeren")}
      </table>
    </div>

    <!-- Add to Calendar Link -->
    <div style="text-align: center; margin: 0 0 24px 0;">
      <a href="${generateGoogleCalendarUrl(reservation)}" target="_blank" style="display: inline-block; background-color: #FAF8F5; color: #17140E; font-family: 'Courier New', Courier, monospace; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: bold; padding: 10px 20px; border-radius: 999px; text-decoration: none; border: 1px solid #C4BCAC;">
        📅 Toevoegen aan Agenda
      </a>
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: #57534E; margin: 0 0 20px 0;">
      ${footerNote}
    </p>

    <div style="margin-top: 24px; font-size: 14px; color: #17140E;">
      Tot snel aan het IJ,<br>
      <em style="font-family: Georgia, serif; font-size: 15px;">Team Chateau Amsterdam</em>
    </div>
  `;

  return {
    subject: customContent?.subject?.nl || defaults.subject.nl,
    html: emailWrapper(content),
  };
}

export function renderReservationUpdateEmail(
  reservation: Reservation,
  customContent?: Partial<EmailTemplateContent>
): { subject: string; html: string } {
  const defaults = EMAIL_UPDATE_DEFAULTS;
  const heading = customContent?.heading?.nl || defaults.heading.nl;
  const intro = customContent?.intro?.nl || defaults.intro.nl;
  const detailsLabel = customContent?.details_label?.nl || defaults.details_label.nl;
  const footerNote = customContent?.footer_note?.nl || defaults.footer_note.nl;

  const dateStr = reservation.requestedDate
    ? new Date(reservation.requestedDate).toLocaleDateString("nl-NL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "In overleg";

  const content = `
    <div style="font-family: 'Courier New', Courier, monospace; font-size: 10.5px; letter-spacing: 0.16em; text-transform: uppercase; color: #B8860B; margin-bottom: 8px; font-weight: bold;">
      &bull; Wijziging in je reservering
    </div>

    <h1 class="email-title" style="font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-weight: 400; font-size: 24px; line-height: 1.25; color: #17140E; margin: 0 0 14px 0;">
      Beste ${reservation.contactName},
    </h1>

    <p style="font-size: 14.5px; line-height: 1.6; color: #44403C; margin: 0 0 20px 0;">
      ${intro}
    </p>

    <!-- Updated Box -->
    <div style="background-color: #F4F0E8; border: 1px solid #E2DDD2; border-radius: 4px; padding: 16px 18px; margin-bottom: 20px;">
      <div style="font-family: 'Courier New', Courier, monospace; font-size: 9.5px; letter-spacing: 0.14em; text-transform: uppercase; color: #8A8174; margin-bottom: 10px;">
        ${detailsLabel}
      </div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        ${renderFieldRow("01", "Datum", `<strong>${dateStr}</strong>`)}
        ${reservation.preferredPeriod ? renderFieldRow("02", "Tijdstip", `<strong>${formatDisplayTime(reservation.preferredPeriod)}</strong>`) : ""}
        ${renderFieldRow("03", "Gezelschap", `${reservation.partySize || reservation.groupSize || 2} personen`)}
        ${renderFieldRow("04", "Locatie", "Johan van Hasseltweg 51, Amsterdam-Noord")}
      </table>
    </div>

    <!-- Add to Calendar Link -->
    <div style="text-align: center; margin: 0 0 24px 0;">
      <a href="${generateGoogleCalendarUrl(reservation)}" target="_blank" style="display: inline-block; background-color: #FAF8F5; color: #17140E; font-family: 'Courier New', Courier, monospace; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: bold; padding: 10px 20px; border-radius: 999px; text-decoration: none; border: 1px solid #C4BCAC;">
        📅 Agenda Bijwerken
      </a>
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: #57534E; margin: 0 0 20px 0;">
      ${footerNote}
    </p>

    <div style="margin-top: 24px; font-size: 14px; color: #17140E;">
      Met vriendelijke groet,<br>
      <em style="font-family: Georgia, serif; font-size: 15px;">Team Chateau Amsterdam</em>
    </div>
  `;

  return {
    subject: customContent?.subject?.nl || defaults.subject.nl,
    html: emailWrapper(content),
  };
}

export function renderLoginCodeEmail({
  code,
  expiresMinutes = 15,
  magicLinkUrl,
}: {
  code: string;
  expiresMinutes?: number;
  magicLinkUrl?: string;
}): { subject: string; html: string } {
  const formattedCode = code.length === 6 ? `${code.slice(0, 3)} ${code.slice(3)}` : code;

  const content = `
    <div style="font-family: 'Courier New', Courier, monospace; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #8A8174; margin-bottom: 8px;">
      Beveiligde Inlogcode &middot; Chateau CMS
    </div>

    <h1 class="email-title" style="font-family: Georgia, serif; font-size: 26px; font-weight: normal; margin: 0 0 16px 0; color: #17140E;">
      Inloggen bij Chateau Amsterdam
    </h1>

    <p style="font-size: 14.5px; line-height: 1.6; color: #44403C; margin: 0 0 24px 0;">
      Gebruik de onderstaande 6-cijferige code om direct in te loggen in het CMS. Je kunt de code eenvoudig kopiëren en in één keer plakken in het inlogscherm.
    </p>

    <!-- Highlighted Code Box -->
    <div style="background-color: #F4F0E8; border: 2px solid #E2DDD2; border-radius: 6px; padding: 24px 20px; margin: 0 0 24px 0; text-align: center;">
      <div style="font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #8A8174; margin-bottom: 8px;">
        JOUW EENMALIGE INLOGCODE
      </div>
      <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: bold; letter-spacing: 0.22em; color: #17140E; padding: 6px 0; user-select: all; -webkit-user-select: all;">
        ${formattedCode}
      </div>
      <div style="font-size: 12px; color: #767064; margin-top: 10px;">
        ⏱️ Deze code is <strong>${expiresMinutes} minuten</strong> geldig &middot; Maximaal <strong>3 pogingen</strong>
      </div>
    </div>

    ${
      magicLinkUrl
        ? `
    <!-- Direct Login Button -->
    <div style="text-align: center; margin: 0 0 28px 0;">
      <a href="${magicLinkUrl}" style="display: inline-block; background-color: #17140E; color: #F1ECE1; font-family: 'Courier New', Courier, monospace; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: bold; padding: 14px 28px; border-radius: 999px; text-decoration: none;">
        Direct Inloggen via Link &rarr;
      </a>
      <div style="font-size: 11.5px; color: #8A8174; margin-top: 8px;">
        (Of gebruik de 6-cijferige code op het inlogscherm)
      </div>
    </div>
    `
        : ""
    }

    <!-- Security Advice Box -->
    <div style="border-top: 1px dashed #E2DDD2; padding-top: 16px; margin-top: 24px;">
      <p style="font-size: 12px; line-height: 1.5; color: #767064; margin: 0;">
        <strong>Beveiligingstip:</strong> Heb je deze inlogcode niet zelf aangevraagd? Dan kun je deze e-mail veilig negeren. Deel deze code nooit met anderen.
      </p>
    </div>

    <div style="margin-top: 24px; font-size: 14px; color: #17140E;">
      Met vriendelijke groet,<br>
      <em style="font-family: Georgia, serif; font-size: 15px;">Team Chateau Amsterdam</em>
    </div>
  `;

  return {
    subject: `${formattedCode} is je inlogcode voor Chateau Amsterdam`,
    html: emailWrapper(content),
  };
}

