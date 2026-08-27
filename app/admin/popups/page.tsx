// app/admin/popups/page.tsx
import { PopupEditorClient } from "./popup-editor-client";
import {
  getPopupContent,
  type NewsletterPopupContent,
  type AgeGatePopupContent,
  type CookieBannerPopupContent,
} from "@/lib/content/popups";

export const dynamic = "force-dynamic";

export default async function PopupsAdminPage() {
  const [newsletter, ageGate, cookieBanner] = await Promise.all([
    getPopupContent<NewsletterPopupContent>("newsletter"),
    getPopupContent<AgeGatePopupContent>("age-gate"),
    getPopupContent<CookieBannerPopupContent>("cookie-banner"),
  ]);

  return (
    <PopupEditorClient
      initialNewsletter={newsletter}
      initialAgeGate={ageGate}
      initialCookieBanner={cookieBanner}
    />
  );
}
