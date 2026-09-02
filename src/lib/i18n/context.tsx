"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { dictionaries, Locale, TranslationKey } from "./dictionaries";

interface I18nContextType {
  locale: Locale;
  direction: "ltr" | "rtl";
  setLocale: (loc: Locale) => void;
  t: (key: TranslationKey, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = "ostan_locale";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    if (saved && (saved === "en" || saved === "ar")) {
      setLocaleState(saved);
    }
    setMounted(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    document.cookie = `ostan_locale=${newLocale}; path=/; max-age=31536000`;
  };

  const direction = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("dir", direction);
      document.documentElement.setAttribute("lang", locale);
    }
  }, [locale, direction, mounted]);

  const t = (key: TranslationKey, fallback?: string): string => {
    const dict = dictionaries[locale] || dictionaries.en;
    return dict[key] || fallback || key;
  };

  return (
    <I18nContext.Provider value={{ locale, direction, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
