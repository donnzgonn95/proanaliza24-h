import { Globe } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";
import { LANGUAGES, LANGUAGE_LABELS, type Lang } from "@/i18n/translations";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useTranslation();

  if (compact) {
    return (
      <label
        className="hidden h-8 items-center gap-1.5 rounded-md border border-border bg-card px-2 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:inline-flex"
        title={t("common.language")}
      >
        <Globe className="h-3.5 w-3.5" aria-hidden />
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as Lang)}
          aria-label={t("common.language")}
          className="bg-transparent text-foreground focus:outline-none"
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l} className="bg-background text-foreground">
              {l.toUpperCase()}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <div role="radiogroup" aria-label={t("common.language")} className="flex flex-wrap gap-2">
      {LANGUAGES.map((l) => {
        const active = lang === l;
        return (
          <button
            key={l}
            role="radio"
            aria-checked={active}
            onClick={() => setLang(l)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm transition-colors",
              active
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-background hover:bg-secondary",
            )}
          >
            <span className="font-semibold uppercase">{l}</span>
            <span className="ml-2 text-xs text-muted-foreground">{LANGUAGE_LABELS[l]}</span>
          </button>
        );
      })}
    </div>
  );
}
