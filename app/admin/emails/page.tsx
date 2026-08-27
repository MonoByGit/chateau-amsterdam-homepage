// app/admin/emails/page.tsx
import { EmailEditorClient, type TemplateMeta } from "./email-editor-client";
import { getEmailContent } from "@/lib/content/emails";

export const dynamic = "force-dynamic";

export default async function EmailsAdminPage() {
  const [salesTasting, salesBusiness, confirmation, update] = await Promise.all([
    getEmailContent("sales-tasting"),
    getEmailContent("sales-business"),
    getEmailContent("customer-confirmation"),
    getEmailContent("customer-update"),
  ]);

  const templates: TemplateMeta[] = [
    {
      id: "customer-confirmation",
      title: "1. Klant: Definitieve Bevestiging",
      recipient: "Klant (zodra de boeking bevestigd is door Sales)",
      description: "Wordt verstuurd naar de klant zodra Sales op Bevestigen klikt (of na telefonisch overleg). Bevat de definitieve datum, tijd en adres.",
      content: confirmation,
    },
    {
      id: "customer-update",
      title: "2. Klant: Wijziging Reservering",
      recipient: "Klant (bij latere datum/tijd aanpassing in CMS)",
      description: "Wordt verstuurd naar de klant wanneer Sales achteraf datum, tijdslot of groepsgrootte aanpast in het CMS.",
      content: update,
    },
    {
      id: "sales-tasting",
      title: "3. Sales: Tasting Aanvraag",
      recipient: "sales@chateau.amsterdam",
      description: "Notificatiemail voor Sales met directe knoppen om direct te Bevestigen of telefonisch te overleggen en te Wijzigen.",
      content: salesTasting,
    },
    {
      id: "sales-business",
      title: "4. Sales: Zakelijke Aanvraag",
      recipient: "sales@chateau.amsterdam",
      description: "Notificatiemail voor Sales bij aanvragen via de Voor Bedrijven pagina (events, relatiegeschenken, groothandel).",
      content: salesBusiness,
    },
  ];

  return <EmailEditorClient templates={templates} />;
}
