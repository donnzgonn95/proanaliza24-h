/**
 * Centralny słownik tłumaczeń aplikacji.
 * Klucze są pogrupowane wg sekcji ("nav.*", "settings.*", "common.*").
 * Domyślny i fallback: pl. Brakujący klucz w innym języku → wartość z pl,
 * a jeśli nadal brak → sam klucz.
 */
export const LANGUAGES = ["pl", "en", "de", "sl"] as const;
export type Lang = (typeof LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<Lang, string> = {
  pl: "Polski",
  en: "English",
  de: "Deutsch",
  sl: "Ślōnski",
};

export const LANGUAGE_FLAGS: Record<Lang, string> = {
  pl: "🇵🇱",
  en: "🇬🇧",
  de: "🇩🇪",
  sl: "🐦",
};

type Dict = Record<string, string>;

const pl: Dict = {
  // Nawigacja (nazwy głównych sekcji)
  "nav.dashboard": "Panel",
  "nav.sentyment": "Sentyment",
  "nav.przeplyw": "Przepływ",
  "nav.sila": "Siła",
  "nav.setupy": "Setupy",
  "nav.squeeze": "Squeeze",
  "nav.alerty": "Alerty",
  "nav.historia": "Historia",
  "nav.likwidacja": "Płynność",
  "nav.asystent": "Asystent",
  "nav.slownik": "Słownik",
  "nav.ulubione": "Ulubione",
  "nav.pricing": "Pro",
  "nav.ustawienia": "Ustawienia",

  // Wspólne
  "common.language": "Język",
  "common.refresh": "Odśwież",
  "common.live": "dane na żywo",
  "common.demo": "dane demo",
  "common.connecting": "łączę…",
  "common.no_connection": "brak połączenia",

  // Ustawienia
  "settings.title": "Ustawienia",
  "settings.language.heading": "Język interfejsu",
  "settings.language.desc": "Wybór zapisuje się lokalnie w przeglądarce. Domyślnie: polski.",
};

const en: Dict = {
  "nav.dashboard": "Dashboard",
  "nav.sentyment": "Sentiment",
  "nav.przeplyw": "Flow",
  "nav.sila": "Strength",
  "nav.setupy": "Setups",
  "nav.squeeze": "Squeeze",
  "nav.alerty": "Alerts",
  "nav.historia": "History",
  "nav.likwidacja": "Liquidity",
  "nav.asystent": "AI Assistant",
  "nav.slownik": "Glossary",
  "nav.ulubione": "Favorites",
  "nav.pricing": "Pro",
  "nav.ustawienia": "Settings",

  "common.language": "Language",
  "common.refresh": "Refresh",
  "common.live": "live data",
  "common.demo": "demo data",
  "common.connecting": "connecting…",
  "common.no_connection": "no connection",

  "settings.title": "Settings",
  "settings.language.heading": "Interface language",
  "settings.language.desc": "Selection is saved locally in your browser. Default: Polish.",
};

const de: Dict = {
  "nav.dashboard": "Übersicht",
  "nav.sentyment": "Sentiment",
  "nav.przeplyw": "Kapitalfluss",
  "nav.sila": "Stärke",
  "nav.setupy": "Setups",
  "nav.squeeze": "Squeeze",
  "nav.alerty": "Alarme",
  "nav.historia": "Verlauf",
  "nav.likwidacja": "Liquidität",
  "nav.asystent": "KI-Assistent",
  "nav.slownik": "Glossar",
  "nav.ulubione": "Favoriten",
  "nav.pricing": "Pro",
  "nav.ustawienia": "Einstellungen",

  "common.language": "Sprache",
  "common.refresh": "Aktualisieren",
  "common.live": "Live-Daten",
  "common.demo": "Demo-Daten",
  "common.connecting": "verbinde…",
  "common.no_connection": "keine Verbindung",

  "settings.title": "Einstellungen",
  "settings.language.heading": "Oberflächensprache",
  "settings.language.desc": "Auswahl wird lokal im Browser gespeichert. Standard: Polnisch.",
};

const sl: Dict = {
  "nav.dashboard": "Tabula",
  "nav.sentyment": "Nastrōj",
  "nav.przeplyw": "Przepływ",
  "nav.sila": "Mŏc",
  "nav.setupy": "Setupy",
  "nav.squeeze": "Ściśniyńcie",
  "nav.alerty": "Alarmy",
  "nav.historia": "Historyjŏ",
  "nav.likwidacja": "Płynność",
  "nav.asystent": "Asystynt AI",
  "nav.slownik": "Słownik",
  "nav.ulubione": "Ulubiōne",
  "nav.pricing": "Pro",
  "nav.ustawienia": "Sztelōnki",

  "common.language": "Rzecz",
  "common.refresh": "Ôdświyż",
  "common.live": "dane na żywo",
  "common.demo": "dane demo",
  "common.connecting": "łōnczã sie…",
  "common.no_connection": "ni ma połōnczynia",

  "settings.title": "Sztelōnki",
  "settings.language.heading": "Rzecz interfejsu",
  "settings.language.desc": "Wybōr sie spamiyntŏ we przeglōndarce. Wychodno: polskŏ.",
};

export const TRANSLATIONS: Record<Lang, Dict> = { pl, en, de, sl };

export function translate(lang: Lang, key: string): string {
  return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.pl[key] ?? key;
}
