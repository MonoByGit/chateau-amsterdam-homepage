// components/cookie-banner.tsx
"use client";

import { useLanguage } from "@/lib/language";
import { useConsent } from "@/lib/consent/context";

export function CookieBanner() {
  const { hasChosen, acceptAll, rejectNonEssential } = useConsent();
  const { t } = useLanguage();

  if (hasChosen) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label={t("Cookies", "Cookies")}>
      <p>
        {t(
          "We gebruiken alleen noodzakelijke cookies om de site te laten werken. Met je toestemming gebruiken we ook privacy-vriendelijke, cookieless analytics om te zien welke pagina's bezocht worden.",
          "We only use essential cookies to make the site work. With your consent we also use privacy-friendly, cookieless analytics to see which pages get visited."
        )}{" "}
        <a href="/privacybeleid">{t("Meer info", "Learn more")}</a>
      </p>
      <div className="cookie-banner-actions">
        <button type="button" className="btn" onClick={rejectNonEssential}>
          {t("Alleen noodzakelijk", "Essential only")}
        </button>
        <button type="button" className="btn btn--primary" onClick={acceptAll}>
          {t("Alles accepteren", "Accept all")}
        </button>
      </div>
    </div>
  );
}
