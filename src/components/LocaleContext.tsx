"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Locale } from "@/lib/types";
import { translate, MessageKey } from "@/lib/i18n";

interface LocaleCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: MessageKey) => string;
  ready: boolean;
}

const Ctx = createContext<LocaleCtx>({
  locale: "zh",
  setLocale: () => {},
  t: (k) => k,
  ready: false,
});

const STORAGE_KEY = "acc.locale";

// Provides the current UI language. Choice persists in localStorage so it is
// remembered across visits.
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved === "en" || saved === "zh") setLocaleState(saved);
    setReady(true);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.lang = l === "en" ? "en" : "zh-CN";
  };

  const t = (key: MessageKey) => translate(key, locale);

  return <Ctx.Provider value={{ locale, setLocale, t, ready }}>{children}</Ctx.Provider>;
}

export function useLocale() {
  return useContext(Ctx);
}
