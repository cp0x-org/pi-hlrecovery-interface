"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getHtmlLang,
  getTranslator,
  isLocale,
  type Locale,
  type Translate,
} from "@/lib/i18n";

const LANGUAGE_STORAGE_KEY = "hlrecovery.language";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translate;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const storedLocale = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

      if (isLocale(storedLocale)) {
        // Restoring after hydration keeps the server-rendered default stable.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocaleState(storedLocale);
      }
    } catch {
      // Keep English if storage is unavailable.
    }
  }, []);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);

    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLocale);
    } catch {
      // The interface still works if the preference cannot be persisted.
    }
  }, []);

  const t = useMemo(() => getTranslator(locale), [locale]);

  useEffect(() => {
    document.documentElement.lang = getHtmlLang(locale);
    document.title = t("meta.title");

    const description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    description?.setAttribute("content", t("meta.description"));
  }, [locale, t]);

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider.");
  }

  return context;
}
