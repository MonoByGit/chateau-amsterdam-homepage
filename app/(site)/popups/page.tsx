// app/(site)/popups/page.tsx
import { Metadata } from "next";
import { PopupsClient } from "./popups-client";

export const metadata: Metadata = {
  title: "Pop-ups & Modals Showcase | Chateau Amsterdam",
  description: "Overzicht van alle pop-ups, modal vensters, triggers en timing-regels van Chateau Amsterdam.",
};

export default function PopupsPage() {
  return <PopupsClient />;
}
