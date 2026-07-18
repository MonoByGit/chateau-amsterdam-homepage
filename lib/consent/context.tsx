// lib/consent/context.tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ConsentChoice = "all" | "essential-only";

type ConsentContextValue = {
  // null while the visitor has not made a choice yet (or before the client
  // has read localStorage on mount) — treated as "no non-essential cookies",
  // the privacy-friendly default this task explicitly asks for.
  choice: ConsentChoice | null;
  hasChosen: boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
};

const STORAGE_KEY = "cookie-consent";
const ConsentContext = createContext<ConsentContextValue | null>(null);

function readStoredChoice(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === "all" || saved === "essential-only" ? saved : null;
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [choice, setChoice] = useState<ConsentChoice | null>(null);
  const [hasChosen, setHasChosen] = useState(false);

  useEffect(() => {
    const stored = readStoredChoice();
    setChoice(stored);
    setHasChosen(stored !== null);
  }, []);

  const persist = useCallback((next: ConsentChoice) => {
    setChoice(next);
    setHasChosen(true);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const acceptAll = useCallback(() => persist("all"), [persist]);
  const rejectNonEssential = useCallback(() => persist("essential-only"), [persist]);

  const value = useMemo(
    () => ({ choice, hasChosen, acceptAll, rejectNonEssential }),
    [choice, hasChosen, acceptAll, rejectNonEssential]
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used within a ConsentProvider");
  return ctx;
}
