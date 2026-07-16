"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Lang = "nl" | "en";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (nl: string, en: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detectInitialLang(): Lang {
  if (typeof window === "undefined") return "nl";
  const saved = window.localStorage.getItem("preferred-lang");
  if (saved === "en" || saved === "nl") return saved;
  return navigator.language.startsWith("en") ? "en" : "nl";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("nl");

  useEffect(() => {
    setLangState(detectInitialLang());
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    window.localStorage.setItem("preferred-lang", next);
  }, []);

  const t = useCallback((nl: string, en: string) => (lang === "nl" ? nl : en), [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
