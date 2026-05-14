import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { LANGUAGES, translate, type Lang } from "./translations";

const STORAGE_KEY = "cryptopuls:lang:v1";
const DEFAULT_LANG: Lang = "pl";

function isLang(v: unknown): v is Lang {
  return typeof v === "string" && (LANGUAGES as readonly string[]).includes(v);
}

function readInitial(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return isLang(v) ? v : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // SSR-safe: na serwerze zawsze pl, hydratacja z localStorage po mount
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    setLangState(readInitial());
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({ lang, setLang, t: (key: string) => translate(lang, key) }),
    [lang, setLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Bezpieczny fallback — używamy języka domyślnego, bez rzucania.
    return {
      lang: DEFAULT_LANG,
      setLang: () => {},
      t: (key: string) => translate(DEFAULT_LANG, key),
    } satisfies Ctx;
  }
  return ctx;
}
