// components/age-gate.tsx
"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language";
import { AGE_GATE_POPUP_DEFAULTS, type AgeGatePopupContent } from "@/lib/content/popup-defaults";

const STORAGE_KEY = "age-verified";
const UNDERAGE_REDIRECT_URL = "https://www.alcoholinfo.nl/";

export function AgeGate({
  content = AGE_GATE_POPUP_DEFAULTS,
}: {
  content?: AgeGatePopupContent;
}) {
  const [isVerified, setIsVerified] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const { t, lang } = useLanguage();

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

  const eyebrowText = content.eyebrow?.[lang] || "Chateau Amsterdam";
  const headingText = content.heading?.[lang] || "Ben je 18 jaar of ouder?";
  const descText = content.description?.[lang] || "Deze site gaat over wijn. Bevestig je leeftijd om verder te gaan.";
  const confirmText = content.btn_confirm?.[lang] || "Ja, ik ben 18+";
  const denyText = content.btn_deny?.[lang] || "Nee";

  return (
    <div className="age-gate" role="dialog" aria-modal="true" aria-label={t("Leeftijdscontrole", "Age verification")}>
      <div className="age-gate-card">
        <span className="label">{eyebrowText}</span>
        <h2>{headingText}</h2>
        <p>{descText}</p>
        <div className="age-gate-actions">
          <button type="button" className="btn btn--primary" onClick={confirmAge}>
            {confirmText}
          </button>
          <button type="button" className="btn" onClick={declineAge}>
            {denyText}
          </button>
        </div>
      </div>
    </div>
  );
}

