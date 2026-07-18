// components/analytics-script.tsx
"use client";

import Script from "next/script";
import { useConsent } from "@/lib/consent/context";

// Umami is itself cookieless, but we still gate it behind consent (rather
// than arguing whether that's strictly required) so there's nothing to
// debate later — see docs/superpowers/plans for the phase 2 compliance spec.
export function AnalyticsScript() {
  const { choice } = useConsent();
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const scriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;

  if (choice !== "all" || !websiteId || !scriptUrl) {
    return null;
  }

  return <Script src={scriptUrl} data-website-id={websiteId} strategy="afterInteractive" />;
}
