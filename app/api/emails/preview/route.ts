// app/api/emails/preview/route.ts
import {
  renderCustomerConfirmationEmail,
  renderCustomerReceiptEmail,
  renderSalesNotificationEmail,
  renderReservationUpdateEmail,
} from "@/lib/email/templates";
import { getEmailContent } from "@/lib/content/emails";
import type { Reservation } from "@/lib/db/reservations";

export const dynamic = "force-dynamic";

const MOCK_TASTING_RESERVATION: Reservation = {
  id: "e4a19b22-861e-4cb8-8dc0-59f7df8cf822",
  track: "standaard",
  status: "nieuw",
  contactName: "Sophie van Dijk",
  email: "sophie.vandijk@example.com",
  phone: "06 87654321",
  partySize: 4,
  groupSize: null,
  companyName: null,
  occasion: "Verjaardag",
  preferredPeriod: "14:00 uur (70 min. tour & tasting) · Taal: Nederlands",
  requestedDate: "2026-08-22",
  notes: "[Taal: Nederlands] 1 persoon is zwanger, 1 persoon drinkt liever alcoholvrij/piquette indien mogelijk.",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const MOCK_BUSINESS_RESERVATION: Reservation = {
  id: "b7c29a11-532f-4db9-9fc1-48f6cf7ef911",
  track: "zakelijk",
  status: "nieuw",
  contactName: "Mark van der Meer",
  email: "mark@amsterdamtech.nl",
  phone: "020 1234567",
  partySize: null,
  groupSize: 28,
  companyName: "Amsterdam Tech B.V.",
  occasion: "Tastings & borrels",
  preferredPeriod: "16:00 uur",
  requestedDate: "2026-09-15",
  notes: "Jaarlijkse kwartaalborrel met het hele team. Graag inclusief bites en eventueel aansluitend diner.",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const template = searchParams.get("template") || "sales-tasting";
  const customContent = await getEmailContent(template);

  let rendered: { subject: string; html: string };

  switch (template) {
    case "sales-business":
      rendered = renderSalesNotificationEmail(MOCK_BUSINESS_RESERVATION, customContent);
      break;
    case "customer-receipt":
      rendered = renderCustomerReceiptEmail(MOCK_TASTING_RESERVATION, customContent);
      break;
    case "customer-confirmation":
      rendered = renderCustomerConfirmationEmail(MOCK_TASTING_RESERVATION, customContent);
      break;
    case "customer-update":
      rendered = renderReservationUpdateEmail(MOCK_TASTING_RESERVATION, customContent);
      break;
    case "sales-tasting":
    default:
      rendered = renderSalesNotificationEmail(MOCK_TASTING_RESERVATION, customContent);
      break;
  }

  return new Response(rendered.html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
