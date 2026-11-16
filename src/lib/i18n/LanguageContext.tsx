"use client";

import * as React from "react";
import {
  type Language,
  type Translations,
  LANDING_TRANSLATIONS,
  SUPPORTED_LANGUAGES,
} from "./landing-translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  languages: typeof SUPPORTED_LANGUAGES;
}

const LanguageContext = React.createContext<LanguageContextType>({
  language: "es",
  setLanguage: () => {},
  t: LANDING_TRANSLATIONS.es,
  languages: SUPPORTED_LANGUAGES,
});

const STORAGE_KEY = "cyclon_lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>("es");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (saved && (saved === "es" || saved === "en" || saved === "pt")) {
        setLanguageState(saved);
        if (typeof document !== "undefined") {
          document.documentElement.lang = saved;
        }
      }
    } catch {
      // Local storage unavailable or restricted
    }
    setMounted(true);
  }, []);

  const setLanguage = React.useCallback((newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      if (typeof document !== "undefined") {
        document.documentElement.lang = newLang;
      }
    } catch {
      // Ignore
    }
  }, []);

  const t = LANDING_TRANSLATIONS[language] || LANDING_TRANSLATIONS.es;

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
