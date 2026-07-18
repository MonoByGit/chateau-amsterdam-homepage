// components/age-gate.tsx
"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language";

const STORAGE_KEY = "age-verified";

// Where "no" sends a visitor: away from the site, to a real, non-punitive
// destination rather than a dead wall. The Trimbos-instituut's public NL
// alcohol-awareness site is the appropriate destination for a wine producer's
// under-18 gate, rather than an arbitrary redirect.
const UNDERAGE_REDIRECT_URL = "https://www.alcoholinfo.nl/";

export function AgeGate() {
  const [isVerified, setIsVerified] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setIsVerified(window.localStorage.getItem(STORAGE_KEY) === "yes");
    setHasMounted(true);
  }, []);

  function confirmAge() {
    window.localStorage.setItem(STORAGE_KEY, "yes");
    setIsVerified(true);
  }

  function declineAge() {
    window.location.href = UNDERAGE_REDIRECT_URL;
  }

  // Nothing renders until the client has checked localStorage once (avoids a
  // flash of the gate for repeat visitors) and nothing renders once verified.
  if (!hasMounted || isVerified) return null;

  return (
    <div className="age-gate" role="dialog" aria-modal="true" aria-label={t("Leeftijdscontrole", "Age verification")}>
      <div className="age-gate-card">
        <span className="label">Chateau Amsterdam</span>
        <h2>{t("Ben je 18 jaar of ouder?", "Are you 18 years or older?")}</h2>
        <p>
          {t(
            "Deze site gaat over wijn. Bevestig je leeftijd om verder te gaan.",
            "This site is about wine. Please confirm your age to continue."
          )}
        </p>
        <div className="age-gate-actions">
          <button type="button" className="btn btn--primary" onClick={confirmAge}>
            {t("Ja, ik ben 18+", "Yes, I'm 18+")}
          </button>
          <button type="button" className="btn" onClick={declineAge}>
            {t("Nee", "No")}
          </button>
        </div>
      </div>
    </div>
  );
}
