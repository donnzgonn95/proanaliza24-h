import { useMemo, useState } from "react";
import { Activity, ChevronDown, Flame, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { detectRegime, type Regime, type RegimeTone } from "@/lib/market-regime";
import { coins as demoCoins, type Coin } from "@/lib/demo-data";
import { useLiveCoins } from "@/lib/binance";

const toneClass: Record<RegimeTone, { wrap: string; dot: string; chip: string; bar: string }> = {
  bull: {
    wrap: "from-bull/30 via-bull/10 to-transparent border-bull/40",
    dot: "bg-bull",
    chip: "bg-bull/20 text-bull",
    bar: "bg-bull",
  },
  bear: {
    wrap: "from-bear/30 via-bear/10 to-transparent border-bear/40",
    dot: "bg-bear",
    chip: "bg-bear/20 text-bear",
    bar: "bg-bear",
  },
  warning: {
    wrap: "from-warning/30 via-warning/10 to-transparent border-warning/40",
    dot: "bg-warning",
    chip: "bg-warning/20 text-warning",
    bar: "bg-warning",
  },
  neutral: {
    wrap: "from-muted to-muted/10 border-border",
    dot: "bg-muted-foreground",
    chip: "bg-muted text-muted-foreground",
    bar: "bg-muted-foreground",
  },
};

export function MarketRegimeBanner({ coins: coinsProp }: { coins?: Coin[] }) {
  const { data: live, isLoading, isError } = useLiveCoins();
  const coins = coinsProp ?? live ?? demoCoins;
  const isLive = !!coinsProp || (!!live && live.length > 0);

  const regime: Regime = useMemo(() => detectRegime(coins), [coins]);
  const [open, setOpen] = useState(false);
  const t = toneClass[regime.tone];

  return (
    <section
      className={cn(
        "rounded-2xl border bg-gradient-to-br p-5 md:p-7",
        t.wrap,
      )}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        <Activity className="h-3.5 w-3.5" />
        Market Regime Engine
        <span className="text-foreground/50">·</span>
        <span className="inline-flex items-center gap-1.5">
          <span className={cn("inline-block h-1.5 w-1.5 rounded-full", isLive ? "animate-pulse bg-bull" : "bg-muted-foreground")} />
          {isLoading ? "ładuję…" : isError ? "dane DEMO" : isLive ? "na żywo" : "DEMO"}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider", t.chip)}>
          <Flame className="h-3.5 w-3.5" />
          {regime.label} · {regime.pl}
        </span>
        <span className="num text-xs text-muted-foreground">
          pewność <span className="text-foreground font-semibold">{regime.confidence}%</span>
        </span>
      </div>

      <h1 className="mt-3 text-xl font-bold leading-snug md:text-3xl">
        {regime.headline}
      </h1>
      <p className="mt-2 max-w-3xl text-sm text-foreground/80 md:text-base">
        {regime.narrative}
      </p>

      {/* confidence bar */}
      <div className="mt-4 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background/40">
          <div className={cn("h-full", t.bar)} style={{ width: `${regime.confidence}%` }} />
        </div>
      </div>

      {/* Playbook */}
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {regime.playbook.map((p) => (
          <div key={p} className="flex items-start gap-2 rounded-lg border border-border/60 bg-background/40 p-3 text-sm">
            <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", t.dot)} />
            <span>{p}</span>
          </div>
        ))}
      </div>

      {/* Signals — collapsible */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        aria-expanded={open}
      >
        <Info className="h-3.5 w-3.5" />
        {open ? "Ukryj sygnały" : "Pokaż sygnały, na których oparta jest decyzja"}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {regime.signals.map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between rounded-md border border-border/60 bg-background/30 px-3 py-2 text-xs"
            >
              <span className="text-muted-foreground">{s.label}</span>
              <span
                className={cn(
                  "num font-semibold",
                  s.direction === "bull" && "text-bull",
                  s.direction === "bear" && "text-bear",
                  s.direction === "neutral" && "text-foreground",
                )}
              >
                {s.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
