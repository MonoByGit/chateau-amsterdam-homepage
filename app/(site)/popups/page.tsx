// app/(site)/popups/page.tsx
import { Metadata } from "next";
import { PopupsClient } from "./popups-client";
import {
  getPopupContent,
  type NewsletterPopupContent,
  type AgeGatePopupContent,
  type CookieBannerPopupContent,
} from "@/lib/content/popups";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pop-ups & Modals Showcase | Chateau Amsterdam",
  description: "Overzicht van alle pop-ups, modal vensters, triggers en timing-regels van Chateau Amsterdam.",
};

export default async function PopupsPage() {
  const [newsletter, ageGate, cookieBanner] = await Promise.all([
    getPopupContent<NewsletterPopupContent>("newsletter"),
    getPopupContent<AgeGatePopupContent>("age-gate"),
    getPopupContent<CookieBannerPopupContent>("cookie-banner"),
  ]);

  return (
    <PopupsClient
      newsletterContent={newsletter}
      ageGateContent={ageGate}
      cookieBannerContent={cookieBanner}
    />
  );
}
